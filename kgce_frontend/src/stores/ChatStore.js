import { defineStore } from 'pinia'
import axios from 'axios'
import { WEBSOCKET_URL, NEIGHBORS_EP } from '../constants/Server'
import { TOPIC_EP } from '../constants/Server'
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
                    changeCounter: 0
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
        this.nodes.push({
                id: 'start-node',
                data: { label: this.message },
                type: 'input',
                position: { x: 250, y: 250 }
        });

        this.topicMessages.push(topicMessage);
        const inTopicData = {
            "prompt": this.message
        }
        if (this.sessionId) {
            inTopicData["session_id"] = this.sessionId;
        }
        axios.post(TOPIC_EP, inTopicData).then((response) => {
            console.log("Topic response:", response.data);
            const kgData = response.data["keyword_results"];
            console.log("KG Data:", kgData);
            for (const kw in kgData) {
                const kw_nodes  = kgData[kw].map((n)=>({
                    id: n["id"],
                    data: { label: n["names"].join(", ") },
                    type: 'input',
                    position: { x: Math.random() * 400, y: Math.random() * 400 }
                }));
                const kw_edges = kw_nodes.map((n)=>({
                    id: `start-node-${n["id"]}`,
                    source: 'start-node',
                    target: n["id"]
                }));
                
                this.nodes.push(...kw_nodes);
                this.edges.push(...kw_edges);
                
            }
            this.changeCounter += 1;
        }).catch((error) => {
            console.error("Error sending topic message:", error);
        });
    },
    sendInstructionMessage(instructionMessage) {
        this.instructionMessages.push(instructionMessage);
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
    async fetchNodeNeighbors(nodeId) {
        const neighbor_nodes = await axios.get(`${NEIGHBORS_EP}/${nodeId}/10`);
        for (const n of neighbor_nodes.data["neighbors"]) {
            n["data"] = {
                "label": n["names"].join(", "),
            }
            n["type"] = 'input'; 
            n["id"] = n["id"].toString();
            n["position"] = { x: Math.random() * 400, y: Math.random() * 400 };
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
  },
})