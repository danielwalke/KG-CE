import { useChatStore } from '../stores/ChatStore.js'

export function selectNode(nodeId){
    const chatStore = useChatStore();
    chatStore.appendSelectedNode(nodeId);
    const getEdgesWithNodesAsTarget = chatStore.edges.filter(edge => edge.target === nodeId);
    const selectedEdgeIds = []
    for (const edge of getEdgesWithNodesAsTarget) {
        edge["animated"] = true;
        edge["style"] = { strokeWidth: 3, stroke: '#000000' };
        selectedEdgeIds.push(edge.id);
    }
    const selectedNode = chatStore.nodes.find(node => node.id === nodeId);
    selectedNode["style"] = { ...selectedNode["style"], borderColor: '#000000', strokeWidth: 4 };
    chatStore.appendInstructionMessage({
        "id": crypto.randomUUID().toString(),
        "role": "user",
        "content": `Added context about ${selectedNode["data"]["label"]} to the conversation.`,
        "type": "context",
        "nodeId": nodeId,
        "edgeIds": selectedEdgeIds
    });    
}