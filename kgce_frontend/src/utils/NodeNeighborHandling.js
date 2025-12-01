import axios from 'axios'
import { NEIGHBORS_EP } from '../constants/Server'
import { useChatStore } from '../stores/ChatStore.js'
import { useGraphSchemaStore } from '../stores/GraphSchemaStore.js'
import { useTreeStore } from '../stores/TreeStore.js'
import { selectNode } from './NodeSelectionHandling.js'

export async function fetchNodeNeighbors(nodeId){
    const treeStore = useTreeStore();
    const chatStore = useChatStore();
    chatStore.setIsLoading(true);
    const graphSchemaStore = useGraphSchemaStore();
    const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
    const excludedEdgeTypes = graphSchemaStore.getExcludedEdgeTypes.map(et => ({"source_node_type": et['start_node_type'], "target_node_type": et['target_node_type'], "edge_type": et['edge_type']}));
    const inNeighborData = {
        "node_id": nodeId,
        "max_neighbors": 50,
        "skip": 0,
        "topic_prompt": chatStore.topicMessages[chatStore.topicMessages.length - 1] || "",
        "excluded_node_types": excludedNodeTypes,
        "excluded_edge_types": excludedEdgeTypes
    }
    selectNode(nodeId);
    const neighbor_nodes = await axios.post(NEIGHBORS_EP, inNeighborData);
    const processedNodeNeighbors = []
    for (const n of neighbor_nodes.data["neighbors"]) {
        const node = {
            "id": n["id"],
            "label": n["label"],
            "name": n["name"],
            "relationshipType": `${nodeId}-${n["id"]}`,
            "type": "neighbor",
            "parent": nodeId,
        }
        treeStore.addNode(node);
        processedNodeNeighbors.push(node);
    }
    treeStore.addNodesForTopicToStore(nodeId, processedNodeNeighbors);
    chatStore.setIsLoading(false);
}