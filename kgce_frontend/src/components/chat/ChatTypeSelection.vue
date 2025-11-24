<template>
    <div class="flex items-center justify-around  pl-2 pr-2 gap-4">
        <button @click="() => isTopicState = true" :class="isTopicState ? 'active' : ''">Topic</button>
        <button @click="() => isTopicState = false" :class="!isTopicState ? 'active' : ''">Instruction</button>
    </div>
</template>

<script setup>
import { useChatStore } from '../../stores/ChatStore.js'
import { computed } from 'vue'

const chatStore = useChatStore();

// Setter for isTopicState
const isTopicState = computed({
  get() {
    return chatStore.isTopicState;
  },
  set(value) {
    chatStore.setIsTopicState(value);
  }
})

</script>

<style scoped>
@reference "../../style.css";   
button{
    @apply bg-black/60 hover:bg-black/80 active:bg-black/80 focus:bg-black/80 p-2 text-white rounded-md shadow-md text-lg hover:text-xl transition-all ease-in-out duration-200 cursor-pointer w-full active:text-xl focus:text-xl hover:font-bold active:font-bold focus:font-bold;
}

.active {
    @apply bg-black/80 text-xl font-bold;
}
</style>