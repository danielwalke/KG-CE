import { WEBSOCKET_URL } from "../constants/Server";
import { useChatStore } from "../stores/ChatStore";

export function createWebsocket(){
    const chatStore = useChatStore();
    const websocket = new WebSocket(WEBSOCKET_URL);
    websocket.onopen = () => {
        console.log("WebSocket connection established");
    };
    websocket.onmessage = (event) => {
        const token = event.data;
        if (token.startsWith("[START]")) {
            chatStore.appendInstructionMessage({
                "id": crypto.randomUUID().toString(),
                "role": "assistant",
                "content": "",
                "type": "response"
            })
        }
        else{
            chatStore.instructionMessages[chatStore.instructionMessages.length - 1].content += token;
        }
    };
    chatStore.addChangeToCounter();
    chatStore.setWebsocket(websocket);
}