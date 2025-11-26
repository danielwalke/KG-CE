<template>
    <div class="h-full flex w-full justify-center items-center overflow-y-hidden" ref="containerRef">
        <div class="h-full flex flex-col bg-black/60 text-white" :style="{ width: `${leftWidth}%` }">
            <div class="flex-1 messages-container">
                <Configuration class="absolute z-10"/>
                <div class="flex flex-col gap-2"v-if="!isTopicState">
                    <div class="instruction-container" v-for="(msg, index) in instructionMessages" :key="index" :class="msg.type === 'response' ? 'self-start lg:max-full' : 'self-end lg:max-w-1/2'">
                        <div class="message-header"><Delete :handleDelete="()=> handleDeleteInstruction(msg, index)" v-if="msg.type !== 'response'"/>{{ msg.type.toUpperCase() }}:</div>
                        <div class="message">
                            <div 
                            v-if="msg.type === 'response'" 
                            v-html="parseMarkdown(msg.content)"
                            class="prose prose-sm dark:prose-invert max-w-none"
                            ></div>

                            <div v-else>
                            {{ msg.content }}
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="flex flex-col gap-2">
                    <div class="topic-container  self-end" v-for="(msg, index) in topicMessages" :key="index">
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
        <div 
            class="h-full w-2 hover:w-4 bg-white hover:bg-black/40 cursor-col-resize transition-all duration-150 z-10 flex-shrink-0 touch-manipulation"
            @mousedown="startDrag"
            @touchstart="startTouch"
        >
        </div>
        <div class="flex-1 h-full bg-black/20">
            <GraphInterface class="h-full w-full"/>
        </div>
        
    </div>
</template>

<script setup>
import Send from './Send.vue'
import { useChatStore } from '../../stores/ChatStore'
import { computed, ref, onUnmounted } from 'vue'
import GraphInterface from './GraphInterface.vue';
import ChatTypeSelection from './ChatTypeSelection.vue';
import Delete from '../icons/Delete.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Configuration from './Configuration.vue';

const chatStore = useChatStore();
chatStore.createWebsocket();

const isTopicState = computed(()=> chatStore.isTopicState);
const topicMessages = computed(()=> chatStore.topicMessages);
const instructionMessages = computed(()=> chatStore.instructionMessages);

const parseMarkdown = (content) => {
  const rawHtml = marked.parse(content);
  return DOMPurify.sanitize(rawHtml);
};
    
const containerRef = ref(null);
const leftWidth = ref(50);
const isDragging = ref(false);

function handleDeleteInstruction(msg, index) {
    chatStore.deleteInstruction(msg, index);
}

const setWidthFromX = (clientX) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const rawPercent = ((clientX - rect.left) / rect.width) * 100;
  
  if (rawPercent >= 10 && rawPercent <= 90) {
    leftWidth.value = rawPercent;
  }
};

const startDrag = (e) => {
  e.stopPropagation(); 
  e.preventDefault();

  isDragging.value = true;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', stopDrag);
  document.body.style.userSelect = 'none';
  document.body.style.cursor = 'col-resize';
};

const onMouseMove = (e) => {
  if (!isDragging.value) return;
  e.preventDefault();
  setWidthFromX(e.clientX);
};

const startTouch = (e) => {
  e.stopPropagation();
  
  isDragging.value = true;
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', stopDrag);
  document.body.style.userSelect = 'none';
};

const onTouchMove = (e) => {
  if (!isDragging.value) return;
  if (e.cancelable) e.preventDefault();
  setWidthFromX(e.touches[0].clientX);
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', stopDrag);
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
};

onUnmounted(() => {
  stopDrag();
});

</script>

<style scoped>
@reference "../../style.css";   
.messages-container {
    @apply w-full h-full max-h-full overflow-y-auto p-4 flex flex-col gap-2;
}
.message-token {
    @apply bg-black/80 p-2 rounded-md text-white;
}

.topic-container {
    @apply bg-black/80 p-4 max-w-1/2 rounded-md text-white self-end; 
}

.instruction-container {
    @apply bg-black/80 p-4 rounded-md text-white max-w-full; 
}

.message-header{
    @apply font-bold text-lg lg:text-xl mb-2 italic flex items-center gap-2 justify-start;
}

.message{
    @apply text-white text-justify p-2 font-semibold;
}
</style>