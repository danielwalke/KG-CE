<template>
    <div class="container-block">
        <h2 class="font-bold text-lg lg:text-2xl pb-4">{{ title }}</h2>
        <slot></slot>
    </div>
</template>
<script setup>
defineProps({
  title: String
})
</script>
<style scoped>
@reference "../../style.css";
.container-block {
    @apply flex justify-center items-center bg-gradient-to-b from-black/60 to-transparent rounded-lg shadow-lg p-2 lg:p-6 flex-col;
}   
</style>