<template>
    <div v-if="isLoading" class="fixed inset-0 w-full max-h-[100dvh] flex items-center justify-center z-50">
        <div class="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div class="relative flex flex-col items-center gap-6">
            <div class="relative flex items-center justify-center">
                <svg class="w-28 h-28 text-gray-700 animate-spin" viewBox="0 0 50 50" fill="none" role="img" aria-label="loading">
                    <circle class="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5"></circle>
                    <path class="opacity-95" fill="currentColor" d="M47 25a22 22 0 0 1-22 22v-5a17 17 0 0 0 17-17h5z"></path>
                </svg>
                <span v-if="progress !== undefined && progress !== null" class="absolute font-semibold text-gray-700 text-lg">
                    {{ progress }}%
                </span>
            </div>
            <span class="text-gray-700 text-lg font-medium">{{ message }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useChatStore } from '../../stores/ChatStore.js';

const chatStore = useChatStore();
const isLoading = computed(() => chatStore.getIsLoading);
const progress = computed(() => chatStore.percentLoading);
const message = "Loading..."
</script>

<style scoped>
</style>