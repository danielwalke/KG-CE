import { defineStore } from "pinia";
import { useTreeStore } from "./TreeStore.js";
import { COLORS, TEXT_COLORS } from "../constants/Graph.js";


export const useGraphStore = defineStore("GraphStore", {
    state: () => ({
        nodes: [],
        edges: [],
    }),
    getters: {
        getNodes(state) {
            return state.nodes;
        },
        getEdges(state) {
            return state.edges;
        }
    },
    actions: {
        initializeNodes() {
            const treeStore = useTreeStore();
            for(const path of treeStore.storedPaths){
                if(path.length === 0) continue;
                // if(path[0] !== state.graphViewTopic) continue;
                for(const node of path){
                    if(this.nodes.some(n => n.id === node.id)) continue;
                    const bgColor = COLORS[node.label] || '#CCCCCC';
                    const textColor = TEXT_COLORS[node.label] || '#000000';
                    const graph_node = {
                        "id": node.id,
                        "data": {
                                    "label": node.name,
                                },
                        "position": { x: Math.random() * 400, y: Math.random() * 400 },
                        "style": { backgroundColor: bgColor, color: textColor },
                        "group": node.type,
                    }
                    this.nodes.push(graph_node);
                }
            }
        },
        initializeEdges() {
            const treeStore = useTreeStore();
            for(const path of treeStore.storedPaths){
                if(path.length === 0) continue;
                // if(path[0] !== state.graphViewTopic) continue;
                for(let i = 1; i < path.length; i++){
                    const edgeId = `${path[i-1].id}-${path[i].id}`;
                    if(this.edges.some(e => e.id === edgeId)) continue;
                    const edge = {
                        id: edgeId,
                        source: path[i-1].id,
                        target: path[i].id
                    }
                    this.edges.push(edge);
                }
            }
        },
        initializeGraph(){
            console.log("Initializing graph...");
            this.nodes = [];
            this.edges = [];
            this.initializeNodes();
            this.initializeEdges();
        },
        setNodes(nodes) {
            this.nodes = nodes;
        },
        setEdges(edges) {
            this.edges = edges;
        }
    }
});