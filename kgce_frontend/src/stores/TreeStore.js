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
    getNodes(state){
        const nodes = new Set();
        for(const path of state.storedPaths){
            if(path[0] !== state.graphViewTopic) continue;
            for(const node of path){
                nodes.add(node.id);
            }
        }
        return Array.from(nodes);
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
    async selectNode(node){
        this.selectedNodeId = node.id;
        this.currentPath.push(node);
        if(node.id in this.fetchedNodesStore) return;
        await fetchNodeNeighbors(node.id);
    },
  },
});
