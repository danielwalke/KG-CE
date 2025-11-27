import axios from 'axios'
import { NEIGHBORS_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
import { useChatStore } from '../stores/ChatStore.js'
import { useGraphSchemaStore } from '../stores/GraphSchemaStore.js'

export async function fetchNodeNeighbors(nodeId){
    const chatStore = useChatStore();
    chatStore.setIsLoading(true);
    const graphSchemaStore = useGraphSchemaStore();
    const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
    const excludedEdgeTypes = graphSchemaStore.getExcludedEdgeTypes.map(et => ({"source_node_type": et['start_node_type'], "target_node_type": et['target_node_type'], "edge_type": et['edge_type']}));
    const inNeighborData = {
        "node_id": nodeId,
        "max_neighbors": 5,
        "skip": 0,
        "topic_prompt": chatStore.topicMessages[chatStore.topicMessages.length - 1] || "",
        "excluded_node_types": excludedNodeTypes,
        "excluded_edge_types": excludedEdgeTypes
    }
    chatStore.selectNode(nodeId);
    const neighbor_nodes = await axios.post(NEIGHBORS_EP, inNeighborData);
    for (const n of neighbor_nodes.data["neighbors"]) {
        n["data"] = {
            "label": n["name"],
        } 
        n["id"] = n["id"].toString();
        n["position"] = { x: Math.random() * 400, y: Math.random() * 400 };
        n["style"] = { backgroundColor: COLORS[n["label"]] || '#CCCCCC', color: TEXT_COLORS[n["label"]] || '#000000' };
        chatStore.appendNode(n);
        const edge = {
            id: `${nodeId}-${n["id"]}`,
            source: nodeId,
            target: n["id"]
        }
        chatStore.appendEdge(edge);
    }
    chatStore.addChangeToCounter();
    chatStore.setIsLoading(false);
}