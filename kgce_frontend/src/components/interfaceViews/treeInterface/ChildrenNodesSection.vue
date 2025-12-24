<template>
    <section v-if="childrenNodes.length">
        <h3 class="section-header">NEXT NODES ({{ renderLimit }} / {{ childrenNodes.length }}):</h3>
        <div class="flex gap-2 p-2 font-semibold"><input class="cursor-pointer hover-enlarge" type="checkbox" @change="() => selectAllChildrenNodes()" :checked="hasSelectedAllChildren" id="childrenSelection"/><label for="childrenSelection" class="cursor-pointer text-black hover-enlarge ">Select all</label></div>
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4">
            <button v-for="node in visibleNodes" :key="node.id" @click="selectChildNode(node)"
                class="tab-block btn-effect" :style="node.style">
                {{ node.name }}
            </button>
            <div ref="loadTrigger" class="col-span-full h-4 w-full"></div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTreeStore } from '../../../stores/TreeStore';

const treeStore = useTreeStore();

const hasSelectedAllChildren = computed({
    get: () => treeStore.hasSelectedAllChildren,
    set: (value) => treeStore.setHasSelectedAllChildren(value)
});

const childrenNodes = computed(() => {
    return treeStore.getChildren.filter(node => {
        if (!treeStore.searchTerm) return true;
        if (!node) return false;
        if (node.name === undefined) return true;
        return node.name.toLowerCase().includes(treeStore.searchTerm.toLowerCase())
    })
});


const BATCH_SIZE = 150
const renderLimit = ref(BATCH_SIZE)
const loadTrigger = ref(null)
let observer = null

const visibleNodes = computed(() => {
  return childrenNodes.value.slice(0, renderLimit.value)
})


watch(() => childrenNodes.value, () => {
  renderLimit.value = BATCH_SIZE
})


onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry.isIntersecting && renderLimit.value < childrenNodes.value.length) {
      renderLimit.value += BATCH_SIZE
    }
  }, {
    rootMargin: '400px' // Start loading before the user reaches the bottom
  })

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value)
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})

watch(loadTrigger, (newTrigger) => {
    if (newTrigger && observer) {
        observer.disconnect() // Clean up old observation
        observer.observe(newTrigger) // Observe the new element
    }
})

function selectChildNode(node) {
    treeStore.selectNode(node);
}

function selectAllChildrenNodes(){
    if(hasSelectedAllChildren.value){
        console.log("Unselecting all children nodes");
        hasSelectedAllChildren.value = false;
        treeStore.unSelectAllChildren(treeStore.getSelectedNode);
        return;
    }
    console.log("Selecting all children nodes");
    treeStore.selectAllChildren(treeStore.getSelectedNode);
    hasSelectedAllChildren.value = true;
}
</script>

<style scoped>
@reference "../../../style.css";
</style>