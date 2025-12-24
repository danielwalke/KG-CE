import { defineStore } from 'pinia'
import { sendTopicMessage } from '../utils/TopicMessageHandling.js'
import { createWebsocket } from '../utils/WebsocketHandling.js'
import { fetchNodeNeighbors } from '../utils/NodeNeighborHandling.js'
import { deleteContextInstruction } from '../utils/DeleteContextHandling.js'
import { useGraphStore } from './GraphStore.js'

export const useChatStore = defineStore('chatStore', {
  state: () => ({   message: "Sepsis metaproteome study", //"Sepsis & Diabetes"
                    websocket: undefined,
                    tokens: [],
                    messages: [],
                    topicMessages: [],
                    instructionMessages: [],
                    isTopicState: true,
                    isLoading: false,
                    isConfigurationOpen: false,
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
    appendInstructionMessage(message) {
        this.instructionMessages.push(message);
    },
    createWebsocket(){
        createWebsocket();
    },
    appendTopicMessage(topicMessage) {
        this.topicMessages.push(topicMessage);
    },
    sendInstructionMessage() {
        const graphStore = useGraphStore();
        graphStore.initializeGraph();
        const nodeIds = graphStore.nodes.map(node => node.id);
        this.instructionMessages.push({
            "id": crypto.randomUUID().toString(),
            "role": "user",
            "content": this.message,
            "type": "instruction"
        });
        const selectedNodeIds = [...nodeIds];
        console.log("Selected nodes:", selectedNodeIds);
        this.websocket.send(JSON.stringify({
            "prompt": this.message,
            "node_ids": selectedNodeIds,
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
    },
    setInstructionMessages(messages) {
        this.instructionMessages = messages;
    }
}
})