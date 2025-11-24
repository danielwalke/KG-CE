<template>
    <div class="h-full flex justify-center items-center overflow-y-hidden">
        <div class="h-full w-1/2 flex flex-col bg-black/60 text-white">
            <div class="flex-1 messages-container">
                {{ chatMessage }}          
            </div>
            <div class="h-12">
                <Send/>
            </div>
        </div>
        <div class="w-1/2 h-full bg-black/20">
            <GraphInterface class="h-full w-full"/>
        </div>
        
    </div>
</template>

<script setup>
import Send from './Send.vue'
import { useChatStore } from '../../stores/ChatStore'
import { computed } from 'vue'
import GraphInterface from './GraphInterface.vue';

const chatStore = useChatStore();
chatStore.createWebsocket();

const chatMessage = computed(()=> chatStore.getChatMessage);
    
</script>

<style scoped>
@reference "../../style.css";   
.messages-container {
    @apply w-full h-full max-h-full overflow-y-auto p-4 flex flex-col gap-2;
}
.message-token {
    @apply bg-black/80 p-2 rounded-md text-white;
}
</style>