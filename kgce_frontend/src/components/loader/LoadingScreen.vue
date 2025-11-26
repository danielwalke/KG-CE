<template>
    <div v-if="show" class="fixed inset-0 w-full max-h-[100dvh] flex items-center justify-center z-50">
        <div class="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div class="relative flex flex-col items-center gap-6">
            <svg class="w-28 h-28 text-gray-700 animate-spin" viewBox="0 0 50 50" fill="none" role="img" aria-label="loading">
                <circle class="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" stroke-width="5"></circle>
                <path class="opacity-95" fill="currentColor" d="M47 25a22 22 0 0 1-22 22v-5a17 17 0 0 0 17-17h5z"></path>
            </svg>
            <span class="text-gray-700 text-lg font-medium">{{ message }}</span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: { type: Boolean, default: true },
    message: { type: String, default: 'Loading' }
})
</script>

<style scoped>
</style>