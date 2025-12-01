import axios from 'axios'
import { TOPIC_EP } from '../constants/Server'
import { COLORS, TEXT_COLORS } from '../constants/Graph'
import { useChatStore } from '../stores/ChatStore.js'
import { useGraphSchemaStore } from '../stores/GraphSchemaStore.js'
import { useTreeStore } from '../stores/TreeStore.js'

export function sendTopicMessage(){
    const chatStore = useChatStore();
    const treeStore = useTreeStore();
    const graphSchemaStore = useGraphSchemaStore();
    const excludedNodeTypes = graphSchemaStore.getExcludedNodeTypes.map(nt => ({"node_type": nt}));
    chatStore.setIsLoading(true);
    const startNode = {
            id: crypto.randomUUID().toString(),
            data: { label: chatStore.message },
            position: { x: 250, y: 250 },
            group: "start",
            style: {"background-color": "#000000", "color": "#FFFFFF"}
    }
    chatStore.appendTopicMessage(chatStore.message);
    const inTopicData = {
        "prompt": chatStore.message,
        "excluded_node_types": excludedNodeTypes
    }
    axios.post(TOPIC_EP, inTopicData).then((response) => {
        const kgData = response.data["keyword_results"];
        for (const kw in kgData) {
            for(const node of kgData[kw]){
                const bgColor = COLORS[node['label']] || "#888888"
                const textColor = TEXT_COLORS[node['label']] || "#FFFFFF"
                const processedNode = {
                    "id": node["id"],
                    "label": node["label"],
                    "name": node["name"],
                    "type": "topic",
                    "parent": undefined,
                    "style": {"background-color": bgColor, "color": textColor}
                }
                treeStore.addTopicToQuery(processedNode, startNode["data"]["label"]);
                treeStore.addNode(processedNode);
            }
        }    
    }).catch((error) => {
        console.error("Error sending topic message:", error);
    }).finally(() => {
        chatStore.setIsLoading(false);
    });
}