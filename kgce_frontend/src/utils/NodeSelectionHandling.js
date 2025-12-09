import { useChatStore } from '../stores/ChatStore.js'
import { useTreeStore } from '../stores/TreeStore.js'
export function selectNode(nodeId, selectedViaAllChildren = false){
    const chatStore = useChatStore();
    const treeStore = useTreeStore();
    
    const selectedNode = {...treeStore.nodeIdToNode[nodeId]};
    chatStore.appendInstructionMessage({
        "id": crypto.randomUUID().toString(),
        "role": "user",
        "content": `Added context about ${selectedNode["name"]} to the conversation.`,
        "type": "context",
        "nodeId": nodeId,
        "edgeIds": [],
        "selectedViaAllChildren": selectedViaAllChildren
    });    
}