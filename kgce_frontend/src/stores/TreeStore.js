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
*/

import { defineStore } from 'pinia'
import { fetchNodeNeighbors } from '../utils/NodeNeighborHandling.js'
import { useGraphStore } from './GraphStore.js';


function getPathId(path){
    return path.map(n => n.id).join("->");   
}

export const useTreeStore = defineStore("TreeStore", {
  state: () => ({
    queriesToTopics: {},
    currentPath: [],
    fetchedNodesStore: {},
    storedPaths: [],
    graphViewTopic: undefined,
    selectedNodeId: undefined,
    nodeIdToNode: {},
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
    },
    async selectNode(node){
        this.selectedNodeId = node.id;
        this.deletePath(this.currentPath);
        this.currentPath.push(node);
        if(node.id in this.fetchedNodesStore) return;
        await fetchNodeNeighbors(node.id);
        this.storedPaths.push([...this.currentPath]);
    },
    setStoredPaths(paths){
        const graphStore = useGraphStore();
        this.storedPaths = paths;
        graphStore.initializeGraph()
    },
    setCurrentPath(path){
        this.currentPath = path;
    }
  },
});
