import axios from 'axios'
import { NEIGHBORS_EP } from '../constants/Server'
import { useChatStore } from '../stores/ChatStore.js'
import { useGraphSchemaStore } from '../stores/GraphSchemaStore.js'
import { useTreeStore } from '../stores/TreeStore.js'
import { selectNode } from './NodeSelectionHandling.js'
import { COLORS, TEXT_COLORS } from '../constants/Graph.js'

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
        "excluded_edge_types": excludedEdgeTypes,
        "style": {"background-color": "#000000", "color": "#FFFFFF"}
    }
    selectNode(nodeId);
    console.time("fetchNodeNeighbors");
    console.log("Fetching neighbors for node:", nodeId);
    const neighbor_nodes = await axios.post(NEIGHBORS_EP, inNeighborData);
    console.log("Fetched neighbors:", neighbor_nodes.data["neighbors"]);
    const processedNodeNeighbors = neighbor_nodes.data["neighbors"].map(n => {
        const bgColor = COLORS[n['label']] || "#888888"
        const textColor = TEXT_COLORS[n['label']] || "#FFFFFF"
        const node = {
            "id": n["id"],
            "label": n["label"],
            "name": n["name"],
            "relationshipType": `${nodeId}-${n["id"]}`,
            "type": "neighbor",
            "parent": nodeId,
            "style": {"background-color": bgColor, "color": textColor}
        }
        return node;
    });
    console.log("Processed neighbor nodes:", processedNodeNeighbors);
    console.timeEnd("fetchNodeNeighbors");
    treeStore.addNodes(processedNodeNeighbors);
    console.log("Added neighbor nodes to TreeStore.");
    treeStore.addNodesForTopicToStore(nodeId, processedNodeNeighbors);
    console.log("Updated TreeStore with new neighbor nodes.");
    chatStore.setIsLoading(false);
}