import { defineStore } from 'pinia'
import axios from 'axios'
import { WEBSOCKET_URL, NEIGHBORS_EP } from '../constants/Server'
import { TOPIC_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
import { useGraphSchemaStore } from './GraphSchemaStore.js'

export const useChatStore = defineStore('chatStore', {
  state: () => ({   message: "Sepsis & Diabetes",
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
                    isLoading: false,
                    isConfigurationOpen: false,
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
    getIsLoading(state) {
        return state.isLoading
    },
    getIsConfigurationOpen(state) {
        return state.isConfigurationOpen
    }
  },
  actions: {
    setIsConfigurationOpen(isOpen) {
        this.isConfigurationOpen = isOpen;
    },
    setIsLoading(isLoading) {
        this.isLoading = isLoading;
    },
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
            if (token.startsWith("[START]")) {
                this.instructionMessages.push({
                    "id": crypto.randomUUID().toString(),
                    "role": "assistant",
                    "content": "",
                    "type": "response"
                });
            }
            else{
                this.instructionMessages[this.instructionMessages.length - 1].content += token;
            }
            this.changeCounter += 1;
        };
    },
    sendTopicMessage(topicMessage) {
        const graphSchemaStore = useGraphSchemaStore();
        const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
        this.setIsLoading(true);
        const startNode = {
                id: crypto.randomUUID().toString(), // random string uuid
                data: { label: this.message },
                position: { x: 250, y: 250 }
        }
        this.nodes.push(startNode);

        this.topicMessages.push(topicMessage);
        const inTopicData = {
            "prompt": this.message,
            "excluded_node_types": excludedNodeTypes
        }
        console.log(inTopicData);
        if (this.sessionId) {
            inTopicData["session_id"] = this.sessionId;
        }
        axios.post(TOPIC_EP, inTopicData).then((response) => {
            const kgData = response.data["keyword_results"];
            for (const kw in kgData) {
                const kw_nodes  = kgData[kw].map((n)=>{
                    const color = COLORS[n["label"]] || '#CCCCCC';
                    console.log("Node color:", color);
                    return {
                    id: n["id"],
                    data: { label: n["name"]},
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
        }).finally(() => {
            this.setIsLoading(false);
        });
        console.log(this.topicMessages)
    },
    sendInstructionMessage(instructionMessage) {
        this.instructionMessages.push({
            "id": crypto.randomUUID().toString(),
            "role": "user",
            "content": this.message,
            "type": "instruction"
        });
        console.log(JSON.stringify({
            "prompt": this.message,
            "node_ids": this.selectedNodes
        }));
        this.websocket.send(JSON.stringify({
            "prompt": this.message,
            "node_ids": this.selectedNodes
        }));
    },
    sendMessage() {
        this.setIsLoading(true);
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
            "id": crypto.randomUUID().toString(),
            "role": "user",
            "content": `Added context about ${selectedNode["data"]["label"]} to the conversation.`,
            "type": "context",
            "nodeId": nodeId,
            "edgeIds": selectedEdgeIds
        });        
    },
    async fetchNodeNeighbors(nodeId) {
        this.setIsLoading(true);
        const graphSchemaStore = useGraphSchemaStore();
        const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
        const excludedEdgeTypes = graphSchemaStore.getExcludedEdgeTypes.map(et => ({"source_node_type": et['start_node_type'], "target_node_type": et['target_node_type'], "edge_type": et['edge_type']}));
        const inNeighborData = {
            "node_id": nodeId,
            "max_neighbors": 5,
            "skip": 0,
            "topic_prompt": this.topicMessages[this.topicMessages.length - 1] || "",
            "excluded_node_types": excludedNodeTypes,
            "excluded_edge_types": excludedEdgeTypes
        }
        console.log(inNeighborData)
        this.selectNode(nodeId);
        const neighbor_nodes = await axios.post(NEIGHBORS_EP, inNeighborData);
        for (const n of neighbor_nodes.data["neighbors"]) {
            n["data"] = {
                "label": n["name"],
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
        this.setIsLoading(false);
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