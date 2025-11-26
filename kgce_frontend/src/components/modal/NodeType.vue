<template>
        <div class="flex items-center gap-2">
            <div class="rounded-full border-2 w-6 h-6" :style="{ backgroundColor: COLORS[nodeType]}"></div>
            <div>{{ nodeType }}</div>
        </div>
</template>

<script setup>
import { COLORS } from '../../constants/Graph';
defineProps({
    nodeType: {
        type: String,
        required: true
    }
});
</script>