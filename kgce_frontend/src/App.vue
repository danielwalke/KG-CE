<script setup>
import Header from './components/header/Header.vue';

</script>

<template>
  <div class="h-dvh w-screen flex flex-col">
    <Header class="h-12" />
    <RouterView class="flex-1" />
    
  </div>
</template>

<style scoped>
</style>
