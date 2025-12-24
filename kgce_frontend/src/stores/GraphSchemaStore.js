import { defineStore } from 'pinia'
import axios from 'axios'
import { GRAPH_SCHEMA_EP } from '../constants/Server'
import { useChatStore } from './ChatStore.js'
import { WEBSOCKET_URL, NEIGHBORS_EP } from '../constants/Server'
import { TOPIC_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'

export const useGraphSchemaStore = defineStore('graphSchemaStore', {
  state: () => ({   
                    nodeTypes: [],
                    edgeTypes:[],
                    selectedNodeTypes: [],
                    selectedEdgeTypes: [],
   }),
  getters: {
    getNodeTypes(state) {
        return state.nodeTypes
    },
    getEdgeTypes(state) {
        return state.edgeTypes      
    },
    getExcludedNodeTypes(state) {
        const excludedNodeTypes = state.nodeTypes.filter(nt => !state.selectedNodeTypes.includes(nt))
        // TODO remove
        excludedNodeTypes.push("Publication")
        return excludedNodeTypes;
    },
    getExcludedEdgeTypes(state) {
        return state.edgeTypes.filter(et => !state.selectedEdgeTypes.includes(et));      
    }
  },
  actions: {
    fetchGraphSchema() {
        const chatStore = useChatStore();
        chatStore.setIsLoading(true);
        axios.get(GRAPH_SCHEMA_EP)
        .then((response) => {
            console.log(response.data);
            
            this.nodeTypes = response.data.node_types;
            this.edgeTypes = response.data.edge_types;
            this.selectedNodeTypes = this.nodeTypes
            this.selectedEdgeTypes = this.edgeTypes
            chatStore.setIsLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching graph schema:", error);
            chatStore.setIsLoading(false);
        });
    }
}
})