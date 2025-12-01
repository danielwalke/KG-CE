import { defineStore } from 'pinia'
import { sendTopicMessage } from '../utils/TopicMessageHandling.js'
import { createWebsocket } from '../utils/WebsocketHandling.js'
import { fetchNodeNeighbors } from '../utils/NodeNeighborHandling.js'
import { selectNode } from '../utils/NodeSelectionHandling.js'
import { deleteContextInstruction } from '../utils/DeleteContextHandling.js'
import { useGraphStore } from './GraphStore.js'

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
                    selectedNode: undefined,
                    currentPath: [],
                    isTreeView: true
   }),
  getters: {
    getIsTreeView(state) {
        return state.isTreeView
    },
    getCurrentPath(state) {
        return state.currentPath
    },
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
    setIsTreeView(isTreeView) {
        this.isTreeView = isTreeView;
        if(!isTreeView) {
            const graphStore = useGraphStore();
            graphStore.initializeGraph();
            this.addChangeToCounter();
            console.log(this.changeCounter)
        }
    },
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
    setNodes(nodes) {
        this.nodes = nodes;
    },
    setEdges(edges) {
        this.edges = edges;
    },
    appendTopicMessage(topicMessage) {
        this.topicMessages.push(topicMessage);
    },
    appendSelectedNode(nodeId) {
        this.selectedNodes.push(nodeId);
    },
    sendInstructionMessage() {
        this.instructionMessages.push({
            "id": crypto.randomUUID().toString(),
            "role": "user",
            "content": this.message,
            "type": "instruction"
        });
        console.log(this.instructionMessages.map(msg => "<" + msg.role + ">" + msg.content + "</" + msg.role + ">").join("\n\n"))
        console.log(this.edges)
        console.log(this.selectedNodes)
        const childrenOfSelectedNodes = this.edges
            .filter(edge => this.selectedNodes.includes(edge["source"]))
            .map(edge => edge["target"]);
        const selectedNodesAndChildren = [...this.selectedNodes, ...childrenOfSelectedNodes];
        console.log("Selected nodes and their children:", selectedNodesAndChildren);
        this.websocket.send(JSON.stringify({
            "prompt": this.message,
            "node_ids": selectedNodesAndChildren,
            "previous_context": this.instructionMessages.map(msg => "<" + msg.role + ">" + msg.content + "</" + msg.role + ">").join("\n\n")
        }));
    },
    sendMessage() {
        if(this.isTopicState){
            sendTopicMessage();
            this.isTopicState = false;
        } else {
            this.sendInstructionMessage();
        }
        this.message = "";
    },
    selectNode(nodeId) {
        selectNode(nodeId);
        this.selectedNode = nodeId;
    },
    async fetchNodeNeighbors(nodeId) {
        fetchNodeNeighbors(nodeId);
    },
    setIsTopicState(isTopic) {
        this.isTopicState = isTopic;
    },
    deleteInstruction(msg, index) {
        if (msg.type === "context") {
            deleteContextInstruction(msg, index);
        }
        this.instructionMessages.splice(index, 1);
    }
}
})