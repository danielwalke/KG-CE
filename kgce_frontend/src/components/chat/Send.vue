<template>
    <form class="send-container">
        <input type="text" placeholder="Type your message..." class="input-box" v-model="chatMessage" />
        <button v-on:submit="sendMessage" class="send-button" @click="sendMessage">Send</button>
    </form>
</template>

<script setup>
import { useChatStore } from '../../stores/ChatStore.js'
import { computed } from 'vue'

const chatStore = useChatStore()

const chatMessage = computed({
    get() {
        return chatStore.message
    },
    set(value) {
        chatStore.setMessage(value)
    }
})

function sendMessage(event) {
    event.preventDefault()
    if (chatMessage.value && chatMessage.value.trim() !== "") {
        chatStore.sendMessage()
    }
}
</script>

<style scoped>
@reference "../../style.css";   
.send-container {
    @apply w-full flex gap-2 p-2 justify-center items-center bg-black/60;
}

.input-box {
    @apply p-2 text-lg rounded-md border-none shadow-lg active:outline-none focus:outline-none w-full;
}

.send-button {
    @apply bg-black/80 p-2 text-white font-semibold rounded-md shadow-md hover:scale-110 transition-all ease-in-out duration-200 cursor-pointer min-w-24;
}
</style>