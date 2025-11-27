import { defineStore } from 'pinia'
import axios from 'axios'
import { NEIGHBORS_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
import { useGraphSchemaStore } from './GraphSchemaStore.js'
import { sendTopicMessage } from '../utils/TopicMessageHandling.js'
import { createWebsocket } from '../utils/WebsocketHandling.js'

export const useChatStore = defineStore('chatStore', {
  state: () => ({   message: "Sepsis & Diabetes",
                    websocket: undefined,
                    tokens: [],
                    messages: [],
                    nodes: [],
                    edges: [],
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
    setWebsocket(ws) {
        this.websocket = ws;
    },
    addChangeToCounter() {
        this.changeCounter += 1;
    },
    appendInstructionMessage(message) {
        this.instructionMessages.push(message);
    },
    createWebsocket(){
        createWebsocket();
    },
    appendNode(node) {
        this.nodes.push(node);
    },
    appendEdge(edge) {
        this.edges.push(edge);
    },
    appendNodeList(nodes) {
        this.nodes.push(...nodes);
    },
    appendEdgeList(edges) {
        this.edges.push(...edges);
    },
    appendTopicMessage(topicMessage) {
        this.topicMessages.push(topicMessage);
    },
    sendInstructionMessage(instructionMessage) {
        this.instructionMessages.push({
            "id": crypto.randomUUID().toString(),
            "role": "user",
            "content": this.message,
            "type": "instruction"
        });
        this.websocket.send(JSON.stringify({
            "prompt": this.message,
            "node_ids": this.selectedNodes
        }));
    },
    sendMessage() {
        if(this.isTopicState){
            sendTopicMessage();
            this.isTopicState = false;
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
        const node = this.nodes.find(n => n.id === msg.nodeId);
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