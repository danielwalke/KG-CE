/*
node interface {
    id: string;
    name: string;
    label: string;
    relationshipType: string;
    type:"neighbor";
    "parent": string;
}

topic interface {
    id: string;
    name: string;
    label: string;
    type: "topic";
    "parent": undefined;
}

startNode interface {
    id: string;
    name: string;
    label: string;
    type: "start";
    "parent": undefined;
}
*/

import { defineStore } from 'pinia'
import { fetchNodeNeighbors } from '../utils/NodeNeighborHandling.js'
import { useGraphStore } from './GraphStore.js';
import { selectNode } from '../utils/NodeSelectionHandling.js';
import { useChatStore } from './ChatStore.js';
import { markRaw } from 'vue';

function getPathId(path){
    return path.map(n => n.id).join("->");   
}



export const useTreeStore = defineStore("TreeStore", {
  state: () => ({
    selectedQuery: undefined,
    queriesToTopics: {},
    currentPath: [],
    fetchedNodesStore: {},
    storedPaths: [],
    graphViewTopic: undefined,
    selectedNodeId: undefined,
    nodeIdToNode: {},
    searchTerm: "",
    hasSelectedAllChildren: false,
  }),
  getters: {
    getQueries(state) {
        return Object.keys(state.queriesToTopics);
    },
    getSelectedNode(state) {
        if (state.currentPath.length === 0) return undefined;
      return state.currentPath[state.currentPath.length - 1].id;
    },
    getSelectedTopic(state) {
        if (state.currentPath.length === 0) {
            return undefined;
        }
        return state.currentPath[0].id;
    },
    getCurrentPath(state) {
        return state.currentPath;
    },
    getChildren(state){
        return state.fetchedNodesStore[state.getSelectedNode] || [];
    },
  },
  actions: {
    setSearchTerm(term) {
        this.searchTerm = term;
    },
    setSelectedQuery(query) {
      this.selectedQuery = query;
    },
    setTreeData(data) {
      this.treeData = data;
    },
    addTopicToQuery(topic, query) {
        if(!(query in this.queriesToTopics)){
            this.queriesToTopics[query] = []
        }
        this.queriesToTopics[query].push(topic);
        console.log(this.queriesToTopics)
    },
    addNodesForTopicToStore(topicId, nodes){
        this.fetchedNodesStore[topicId] = nodes;
    },
    addNode(node){
        if(node.id in this.nodeIdToNode) return;
        this.nodeIdToNode[node.id] = node;
    },
    async addNodes(nodes){
        console.time("addNodes");
        const chatStore = useChatStore();
        for(let i = 0; i < nodes.length; i++){
            const node = nodes[i]
            if(!this.nodeIdToNode[node.id]){
                this.nodeIdToNode[node.id] = markRaw(node);
            }
            const percentage = Math.floor(((i + 1) / nodes.length) * 100);
            chatStore.setPercentLoading(percentage);
            if (i % 50 === 0) await new Promise(resolve => setTimeout(resolve, 0));
        }
        console.timeEnd("addNodes");
    },
    deletePath(path){
        const pathId = getPathId(path);
        this.storedPaths = this.storedPaths.filter(p => getPathId(p) !== pathId);
        
    },
    selectAllChildren(node){
        const children = this.fetchedNodesStore[node] || [];
        for(const child of children){
            const newCurrentPath = [...this.currentPath];
            newCurrentPath.push(child);
            this.deletePath(newCurrentPath);
            this.storedPaths.push([...newCurrentPath]);
            selectNode(child.id, true);
        }
        const graphStore = useGraphStore();
        graphStore.initializeGraph();
    },
    unSelectAllChildren(node){
        console.log("Unselecting all children of node:", node);
        const chatStore = useChatStore();
        const children = this.fetchedNodesStore[node] || [];
        for(const path of this.storedPaths){
            if (path.length < 2) continue;

            const lastChild = path[path.length -1];
            const foreLastChild = path[path.length -2];
            const isLastChildAChildren = children.find(c => c.id === lastChild.id);
            if(foreLastChild.id !== node) continue;

            if(isLastChildAChildren && foreLastChild.id === node){
                this.deletePath(path);
            }
            const newChatStoreInstructionMessages = chatStore.instructionMessages.filter(msg => {
                if(!msg["selectedViaAllChildren"]) return true;
                return (msg["nodeId"] !== lastChild.id)
            })
            chatStore.setInstructionMessages(newChatStoreInstructionMessages);
        }
        const graphStore = useGraphStore();
        graphStore.initializeGraph();
    },
    async selectNode(node){
        this.hasSelectedAllChildren = false;
        this.selectedNodeId = node.id;
        this.deletePath(this.currentPath);
        this.currentPath.push(node);
        this.storedPaths.push([...this.currentPath]);
        if(node.type === "start") return;
        if(node.id in this.fetchedNodesStore) return;
        await fetchNodeNeighbors(node.id);
        const graphStore = useGraphStore();
        graphStore.initializeGraph();
        
    },
    setStoredPaths(paths){
        const graphStore = useGraphStore();
        this.storedPaths = paths;
        graphStore.initializeGraph()
    },
    setCurrentPath(path){
        this.currentPath = path;
    },
    reconstructPath(nodeId, pathArray) {
        const node = this.nodeIdToNode[nodeId];
        if (!node) return;
        pathArray.unshift(node);
        if (node.parent !== undefined) {
            this.reconstructPath(node.parent, pathArray);
        }
    },
    resetPathAndSelect(node) {
        if (this.currentPath.length === 0) {
            this.selectNode(node);
            return;
        }
        // treeStore.storedPaths.push([...treeStore.currentPath]);

        const nodesInPath = [];
        console.log(node)
        if (node.parent !== undefined) {
            this.reconstructPath(node.parent, nodesInPath);
        }
        this.currentPath = nodesInPath;
        console.log(nodesInPath)
        this.selectNode(node);
    },
    setHasSelectedAllChildren(value) {
        this.hasSelectedAllChildren = value;
    }
  },
});
