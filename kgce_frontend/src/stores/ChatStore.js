import { defineStore } from 'pinia'
import axios from 'axios'
import { WEBSOCKET_URL, NEIGHBORS_EP } from '../constants/Server'
export const useChatStore = defineStore('chatStore', {
  state: () => ({ message: "what connection exist between sepsis and age?", websocket: undefined, tokens: [], messages: [], nodes: [], edges: [], sessionId: undefined,
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
    }
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
    sendMessage() {
        this.websocket.send(this.message);
        const startNode = {
                id: 'start-node',
                data: { label: this.message },
                type: 'input',
                position: { x: 250, y: 250 }
            }
        this.nodes.push(startNode);
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
    }
  },
})