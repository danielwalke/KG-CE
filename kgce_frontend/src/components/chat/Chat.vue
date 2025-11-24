<template>
    <div class="h-full flex justify-center items-center overflow-y-hidden">
        <div class="h-full w-1/2 flex flex-col bg-black/60 text-white">
            <div class="flex-1 messages-container">

                <div class="" v-if="!isTopicState">
                    {{ chatMessage }}          
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div class="topic-container" v-for="(msg, index) in topicMessages" :key="index">
                        <div class="message-header">Topic-Request:</div>
                        <div class="message">{{ msg }}</div>
                    </div>
                </div>
            </div>
            
            <div class="h-28 flex flex-col ">
                <Send class="h-14"/>
                <ChatTypeSelection class="flex-1"/>
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
import ChatTypeSelection from './ChatTypeSelection.vue';

const chatStore = useChatStore();
chatStore.createWebsocket();

const isTopicState = computed(()=> chatStore.isTopicState);
const chatMessage = computed(()=> chatStore.getChatMessage);
const topicMessages = computed(()=> chatStore.topicMessages);
    
</script>

<style scoped>
@reference "../../style.css";   
.messages-container {
    @apply w-full h-full max-h-full overflow-y-auto p-4 flex flex-col gap-2;
}
.message-token {
    @apply bg-black/80 p-2 rounded-md text-white;
}

.topic-container{
    @apply bg-black/80 p-4 max-w-1/2 rounded-md text-white self-end; 
}

.message-header{
    @apply font-bold text-lg lg:text-xl mb-2 italic;
}

.message{
    @apply text-white text-justify p-2 font-semibold;
}
</style>