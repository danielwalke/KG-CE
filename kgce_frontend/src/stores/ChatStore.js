import { defineStore } from 'pinia'
import axios from 'axios'
import { WEBSOCKET_URL, NEIGHBORS_EP } from '../constants/Server'
import { TOPIC_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
export const useChatStore = defineStore('chatStore', {
  state: () => ({   message: "what connection exist between sepsis and age?",
                    websocket: undefined,
                    tokens: [],
                    messages: [],
                    nodes: [],
                    edges: [],
                    sessionId: undefined,
                    topicMessages: [],
                    instructionMessages: [],
                    isTopicState: true,
                    changeCounter: 0,
                    selectedNodes: [],
   }),
  getters: {
    getMessage(state) {
      return state.message
    },
    getWebsocket(state) {
        return state.websocket
    },
    getChatMessage(state) {
        return state.tokens.join('')
    },
    getTopicMessages(state) {
        return state.topicMessages
    },
    getInstructionMessages(state) { 
        return state.instructionMessages
    },
    getNodes(state) {
        return state.nodes
    },
    getEdges(state) {
        return state.edges
    },
  },
  actions: {
    setMessage(newMessage) {
        this.message = newMessage
    },
    createWebsocket(){
        this.websocket = new WebSocket(WEBSOCKET_URL);
        this.websocket.onopen = () => {
            console.log("WebSocket connection established");
        };
        this.websocket.onmessage = (event) => {
            const token = event.data;
            console.log("Received token:", token);
            if (token.startsWith("[KG_RESULT]")) {
                const kgData = token.replace("[KG_RESULT]", "").trim();
                console.log(kgData);
                const node = JSON.parse(kgData);
                console.log("Knowledge Graph Node:", node);
                node["id"] = node["id"].toString();
                node["data"] = {
                    "label": node["names"].join(", "),
                }
                node["type"] = 'input'; 
                node["position"] = { x: Math.random() * 400, y: Math.random() * 400 };
                this.nodes.push(node);
                this.edges.push({
                    id: `start-node-${node["id"]}`,
                    source: 'start-node',
                    target: node["id"]
                });
                console.log("Knowledge Graph Data:", kgData);
            }
            else if (token.startsWith("[SESSION_ID]")) {
                const sessionId = token.replace("[SESSION_ID]", "").trim();
                this.sessionId = sessionId;
            }
            else{
                this.tokens.push(token);
            }
            this.changeCounter += 1;
            
        };
    },
    sendTopicMessage(topicMessage) {
        const startNode = {
                id: crypto.randomUUID().toString(), // random string uuid
                data: { label: this.message },
                position: { x: 250, y: 250 }
        }
        this.nodes.push(startNode);

        this.topicMessages.push(topicMessage);
        const inTopicData = {
            "prompt": this.message
        }
        if (this.sessionId) {
            inTopicData["session_id"] = this.sessionId;
        }
        axios.post(TOPIC_EP, inTopicData).then((response) => {
            console.log("Topic response:", response.data);
            console.log(response.data["keyword_results"]);
            const kgData = response.data["keyword_results"];
            for (const kw in kgData) {
                
                const kw_nodes  = kgData[kw].map((n)=>{
                    const color = COLORS[n["label"]] || '#CCCCCC';
                    console.log("Node color:", color);
                    return {
                    id: n["id"],
                    data: { label: n["names"].join(", ") },
                    position: { x: Math.random() * 400, y: Math.random() * 400 },
                    style: { backgroundColor: color, color: TEXT_COLORS[n["label"]] || '#000000', borderColor: '#000000', borderWidth: 10},
                }});
                const kw_edges = kw_nodes.map((n)=>({
                    id: `${startNode.id}-${n["id"]}`,
                    source: startNode.id,
                    target: n["id"]
                }));
                this.nodes.push(...kw_nodes);
                this.edges.push(...kw_edges);
            }
            this.changeCounter += 1;
        }).catch((error) => {
            console.error("Error sending topic message:", error);
        });
        console.log(this.topicMessages)
    },
    sendInstructionMessage(instructionMessage) {
        this.instructionMessages.push({
            "role": "user",
            "content": this.message,
            "type": "instruction"
        });
        this.websocket.send(this.message);
    },
    sendMessage() {
        if(this.isTopicState){
            this.sendTopicMessage(this.message);
        } else {
            this.sendInstructionMessage(this.message);
        }
        this.message = "";
    },
    selectNode(nodeId) {
        this.selectedNodes.push(nodeId);
        const getEdgesWithNodesAsTarget = this.edges.filter(edge => edge.target === nodeId);
        const selectedEdgeIds = []
        for (const edge of getEdgesWithNodesAsTarget) {
            edge["animated"] = true;
            edge["style"] = { strokeWidth: 3, stroke: '#000000' };
            selectedEdgeIds.push(edge.id);
        }
        const selectedNode = this.nodes.find(node => node.id === nodeId);
        selectedNode["style"] = { ...selectedNode["style"], borderColor: '#000000', strokeWidth: 4 };
        this.instructionMessages.push({
            "role": "user",
            "content": `Added context about ${selectedNode["data"]["label"]} to the conversation.`,
            "type": "context",
            "nodeId": nodeId,
            "edgeIds": selectedEdgeIds
        });        
    },
    async fetchNodeNeighbors(nodeId) {
        const inNeighborData = {
            "node_id": nodeId,
            "max_neighbors": 5,
            "skip": 0,
            "topic_prompt": this.topicMessages[this.topicMessages.length - 1] || ""
        }
        this.selectNode(nodeId);
        const neighbor_nodes = await axios.post(NEIGHBORS_EP, inNeighborData);
        for (const n of neighbor_nodes.data["neighbors"]) {
            n["data"] = {
                "label": n["names"].join(", "),
            } 
            n["id"] = n["id"].toString();
            n["position"] = { x: Math.random() * 400, y: Math.random() * 400 };
            n["style"] = { backgroundColor: COLORS[n["label"]] || '#CCCCCC', color: TEXT_COLORS[n["label"]] || '#000000' };
            this.nodes.push(n);
            const edge = {
                id: `${nodeId}-${n["id"]}`,
                source: nodeId,
                target: n["id"]
            }
            this.edges.push(edge);
        }
        this.changeCounter += 1;
    },
    setIsTopicState(isTopic) {
        this.isTopicState = isTopic;
    },
    treeCutting(nodeId) {
        this.nodes = this.nodes.filter(n => n.id !== nodeId);
        const filteredEdges = this.edges.filter(e => e.source === nodeId || e.target === nodeId);
        for (const edge of filteredEdges) {
            if(this.selectedNodes.includes(edge.target) || this.selectedNodes.includes(edge.source)) continue
            this.nodes = this.nodes.filter(n => n.id !== edge.source);
            this.nodes = this.nodes.filter(n => n.id !== edge.target);
        }
        this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        this.changeCounter += 1;
    },
    deleteContextInstruction(msg, index) {
        this.instructionMessages.splice(index, 1);
        console.log(msg)
        const node = this.nodes.find(n => n.id === msg.nodeId);
        console.log(node)
        if (node) {
            node["style"] = { ...node["style"], borderColor: '#000000', borderWidth: 1 };
        }
        for (const edgeId of msg.edgeIds) {
            const edge = this.edges.find(e => e.id === edgeId);
            if (edge) {
                edge["animated"] = false;
                edge["style"] = { strokeWidth: 1, stroke: '#888888'};
            }
            this.changeCounter += 1;
        }
        this.treeCutting(msg.nodeId);
    },
    deleteInstruction(msg, index) {
        if (msg.type === "context") {
            this.deleteContextInstruction(msg, index);
        } else {
            this.instructionMessages.splice(index, 1);
        }
    }
}
})