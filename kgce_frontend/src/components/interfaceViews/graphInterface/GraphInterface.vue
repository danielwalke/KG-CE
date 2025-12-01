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
import { computed, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { useLayout } from '../../../utils/useLayout.js'
import { useGraphStore } from '../../../stores/GraphStore.js'

const graphStore = useGraphStore()

const nodes = computed({
  get() {
    console.log(graphStore.getNodes)
    return graphStore.getNodes
  },
  set(value) {
    graphStore.nodes = value
  }
})
// these are our edges
const edges = computed(() => graphStore.getEdges)

layoutGraph("TB")

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
onNodeClick((event) => {
  console.log(event.node)
})

async function layoutGraph(direction = "TB") {
  await nextTick()
  nodes.value =  layout(nodes.value, edges.value, direction)
  
  nextTick(() => {
    fitView()
  })
}
</script>


<style scoped>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>