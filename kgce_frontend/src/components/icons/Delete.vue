<template>
    <div 
        class="h-8 w-8 flex items-center justify-center shadow-md rounded-md cursor-pointer hover:scale-110 transition-colors hover:font-bold" 
        @click="handleDelete"
    >
        <svg 
            class="w-5 h-5 text-white" 
            xmlns="http://www.w3.org/2000/svg"  
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    </div>
</template>

<script setup>
defineProps({
    handleDelete: {
        type: Function,
        required: true
    }
})
</script>