<template>
    <div class="header-container">
        <RouterLink class="router-link" to="/">Home</RouterLink>
        <RouterLink class="router-link" to="/chat">Chat</RouterLink>
        <RouterLink class="router-link" to="/about">About</RouterLink>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@reference "../../style.css";

.router-link {
    @apply text-white transition-all ease-in-out duration-200 lg:text-lg text-base;
}

.router-link:hover {
    @apply scale-110 font-bold;
}

.header-container {
    @apply w-full flex justify-center gap-4 lg:gap-16 items-center bg-black/90 p-2;
}
</style>