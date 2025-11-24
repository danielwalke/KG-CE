<template>
     <VueFlow :nodes="nodes" :edges="edges">
    <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
    <!-- <template #node-special="specialNodeProps">
      <SpecialNode v-bind="specialNodeProps" />
    </template> -->

    <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
    <!-- <template #edge-special="specialEdgeProps">
      <SpecialEdge v-bind="specialEdgeProps" />
    </template> -->
  </VueFlow>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'

// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
import SpecialNode from '../graphComponents/SpecialNode.vue'
import SpecialEdge from '../graphComponents/SpecialEdge.vue'
import { useChatStore } from '../../stores/ChatStore.js'
import { useLayout } from '../../utils/useLayout.js'

const chatStore = useChatStore()

const nodes = computed({
  get() {
    return chatStore.nodes
  },
  set(value) {
    chatStore.nodes = value
  }
})
// these are our edges
const edges = computed(() => chatStore.edges)
const changeCounter = computed(() => chatStore.changeCounter)

const { 
  onNodeDragStart, 
  onNodeDrag,
  onNodeDragStop, 
  onNodeClick, 
  onNodeDoubleClick, 
  onNodeContextMenu, 
  onNodeMouseEnter, 
  onNodeMouseLeave, 
  onNodeMouseMove,
  fitView
} = useVueFlow()

const { layout } = useLayout()
onNodeClick((event, node) => {
  
  console.log(event.node)
  chatStore.fetchNodeNeighbors(event.node.id)
})

async function layoutGraph(direction = "TB") {
  await nextTick()
  nodes.value =  layout(nodes.value, edges.value, direction)
  
  nextTick(() => {
    fitView()
  })
}

watch((changeCounter), () => {
  console.error("Something changed, laying out graph")
  layoutGraph("TB")
})



</script>


<style scoped>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>