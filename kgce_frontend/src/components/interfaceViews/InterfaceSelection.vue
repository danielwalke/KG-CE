<template>
    <div class="interface-selection">
        <div class="interface-item" 
             @click="isChatStoreTreeView = true"
             :class="isChatStoreTreeView ? 'interface-item-active' : 'interface-item-inactive'"
             >
             Tree Interface
            </div>
        <div class="interface-item" 
                @click="isChatStoreTreeView = false" 
                :class="!isChatStoreTreeView ? 'interface-item-active' : 'interface-item-inactive'"
                >
                Graph Interface
        </div>
    </div>
</template> 

<script setup>
import { useChatStore } from '../../stores/ChatStore';
import { computed } from 'vue';

const chatStore = useChatStore();

const isChatStoreTreeView = computed({
  get: () => chatStore.isTreeView,
  set: (v) => {
    chatStore.setIsTreeView(v);
  }
})
</script>

<style scoped>
@reference "../../style.css";
.interface-selection {
    @apply flex justify-center items-center gap-2 pl-4 pr-4;
}
.interface-item {
    @apply bg-black/60 hover:bg-black/80 active:bg-black/80 focus:bg-black/80 p-2 text-white rounded-md shadow-md text-lg hover:text-xl transition-all ease-in-out duration-200 cursor-pointer w-full active:text-xl focus:text-xl hover:font-bold active:font-bold focus:font-bold text-center;
}

.interface-item-active {
    @apply bg-black/80 text-xl font-bold;
}

.interface-item-inactive {
    @apply bg-black/60 hover:bg-black/80 active:bg-black/80 focus:bg-black/80 p-2;
}

</style>