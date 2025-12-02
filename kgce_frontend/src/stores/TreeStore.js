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
    }
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
    deletePath(path){
        const pathId = getPathId(path);
        this.storedPaths = this.storedPaths.filter(p => getPathId(p) !== pathId);
        const graphStore = useGraphStore();
        graphStore.initializeGraph();
    },
    async selectNode(node){
        this.selectedNodeId = node.id;
        this.deletePath(this.currentPath);
        this.currentPath.push(node);
        this.storedPaths.push([...this.currentPath]);
        if(node.type === "start") return;
        if(node.id in this.fetchedNodesStore) return;
        await fetchNodeNeighbors(node.id);
        
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
    }
  },
});
