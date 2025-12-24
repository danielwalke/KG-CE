<script setup>
import Header from './components/header/Header.vue';
import LoadingScreen from './components/loader/LoadingScreen.vue';
import { RouterView } from 'vue-router';
import { useChatStore } from './stores/ChatStore.js';
import { computed } from 'vue';
import ConfigurationModal from './components/modal/ConfigurationModal.vue';



</script>

<template>
  <div class="h-dvh w-screen flex flex-col">
    <Header class="h-12" />
    <RouterView class="flex-1" />
    <LoadingScreen />
    <ConfigurationModal/>
  </div>
</template>

<style scoped>
</style>
