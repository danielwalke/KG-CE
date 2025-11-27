import { useChatStore } from '../stores/ChatStore.js'

function treeCutting(nodeId){
    const chatStore = useChatStore();
    chatStore.setNodes(chatStore.nodes.filter(n => n.id !== nodeId));
    const filteredEdges = chatStore.edges.filter(e => e.source === nodeId || e.target === nodeId);
    for (const edge of filteredEdges) {
        if(chatStore.selectedNodes.includes(edge.target) || chatStore.selectedNodes.includes(edge.source)) continue
        chatStore.setNodes(chatStore.nodes.filter(n => n.id !== edge.source));
        chatStore.setNodes(chatStore.nodes.filter(n => n.id !== edge.target));
    }
    chatStore.setEdges(chatStore.edges.filter(e => e.source !== nodeId && e.target !== nodeId));
    chatStore.addChangeToCounter();
}


export function deleteContextInstruction(msg, index){
    const chatStore = useChatStore();
    const node = chatStore.nodes.find(n => n.id === msg.nodeId);
    if (node) {
        node["style"] = { ...node["style"], borderColor: '#000000', borderWidth: 1 };
    }
    for (const edgeId of msg.edgeIds) {
        const edge = chatStore.edges.find(e => e.id === edgeId);
        if (edge) {
            edge["animated"] = false;
            edge["style"] = { strokeWidth: 1, stroke: '#888888'};
        }
        chatStore.addChangeToCounter();
    }
    treeCutting(msg.nodeId);
}