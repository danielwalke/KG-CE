import axios from 'axios'
import { TOPIC_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
import { useChatStore } from '../stores/ChatStore.js'
import { useGraphSchemaStore } from '../stores/GraphSchemaStore.js'

export function sendTopicMessage(){
    const chatStore = useChatStore();
    const graphSchemaStore = useGraphSchemaStore();
    const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
    chatStore.setIsLoading(true);
    const startNode = {
            id: crypto.randomUUID().toString(),
            data: { label: chatStore.message },
            position: { x: 250, y: 250 }
    }
    chatStore.appendNode(startNode);
    chatStore.appendTopicMessage(chatStore.message);
    const inTopicData = {
        "prompt": chatStore.message,
        "excluded_node_types": excludedNodeTypes
    }
    axios.post(TOPIC_EP, inTopicData).then((response) => {
        console.log("Topic message response:", response.data);
        const kgData = response.data["keyword_results"];
        for (const kw in kgData) {
            const kw_nodes  = kgData[kw].map((n)=>{
                const color = COLORS[n["label"]] || '#CCCCCC';
                return {
                id: n["id"],
                data: { label: n["name"]},
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                style: { backgroundColor: color, color: TEXT_COLORS[n["label"]] || '#000000', borderColor: '#000000', borderWidth: 10},
            }});
            const kw_edges = kw_nodes.map((n)=>({
                id: `${startNode.id}-${n["id"]}`,
                source: startNode.id,
                target: n["id"]
            }));
            chatStore.appendNodeList(kw_nodes);
            chatStore.appendEdgeList(kw_edges);
        }
        chatStore.addChangeToCounter();        
    }).catch((error) => {
        console.error("Error sending topic message:", error);
    }).finally(() => {
        chatStore.setIsLoading(false);
    });
}