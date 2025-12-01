<template>
    <div class="h-full w-full relative flex flex-col">
        <GraphInterface v-if="!isChatStoreTreeView" class="flex-1 w-full" />
        <TreeInterface v-if="isChatStoreTreeView" class="flex-1 w-full"/>
        <InterfaceSelection class="h-14"/>
    </div>

</template>

<script setup>
import GraphInterface from './graphInterface/GraphInterface.vue';
import TreeInterface from './treeInterface/TreeInterface.vue';
import InterfaceSelection from './InterfaceSelection.vue';
import { useChatStore } from '../../stores/ChatStore';
import { computed } from 'vue';

const chatStore = useChatStore();
const isChatStoreTreeView = computed(()=> chatStore.isTreeView);

</script>