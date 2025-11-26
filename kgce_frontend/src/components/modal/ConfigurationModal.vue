<template>
    <div v-if="show" class="fixed inset-0 w-full max-h-[100dvh] flex items-center justify-center z-50">
        <div class="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
        <div class="relative flex flex-col items-center gap-6 overflow-y-hidden">
            <div class="bg-white p-8 rounded-lg max-h-178 overflow-y-auto shadow-lg">
                <div @click="closeModal" class="absolute top-3 right-5 cursor-pointer bg-black/80 rounded-lg text-white w-6 h-6 flex items-center justify-center scale-110 ease-in-out transition-all duration-150">X</div>
                <h2>Configurations:</h2>
                <h3>Node types:</h3>
                <div class="p-2">
                    <ul class="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        <li v-for="nodeTypeStr in nodeTypes" :key="nodeTypeStr" class="flex items-center gap-2">
                            <input type="checkbox" :id="nodeTypeStr" :value="nodeTypeStr" class="w-4 h-4" :checked="graphSchemaStore.selectedNodeTypes.includes(nodeTypeStr)" @change="() => selectNodeType(nodeTypeStr)" />
                            <NodeType :nodeType="nodeTypeStr"/>
                        </li>
                    </ul>
                </div>
                <h3>Edge types:</h3>
                <div class="p-2">
                    <ul class="flex flex-col gap-2 justify-center">
                        <li v-for="edgeType in edgeTypes" :key="edgeType" class="grid grid-cols-4 gap-0 rounded-md shadow-lg p-2 items-center grid-cols-[.5fr_2fr_5fr_2fr]">
                            <input type="checkbox" :id="edgeType['edge_type']" :value="edgeType['edge_type']" class="w-4 h-4 justify-self-center" :checked="graphSchemaStore.selectedEdgeTypes.includes(edgeType)" @change="() => selectEdgeType(edgeType)" />
                            <NodeType :nodeType="edgeType['start_node_type']" class="justify-center"/>
                            <div class="flex flex-col-reverse items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="24" style="display: block;">
                                <defs>
                                    <marker id="smallArrowhead" viewBox="0 0 10 10" refX="10" refY="5"
                                    markerWidth="6" markerHeight="6" orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                                    </marker>
                                </defs>

                                <line x1="0" y1="12" x2="100%" y2="12" 
                                        stroke="currentColor" stroke-width="4" marker-end="url(#smallArrowhead)" />
                                </svg>
                                {{ edgeType['edge_type'] }}</div>
                            <NodeType :nodeType="edgeType['target_node_type']" class="justify-center"/>
                        </li>
                    </ul>
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup>
import { useChatStore } from '../../stores/ChatStore'
import { useGraphSchemaStore } from '../../stores/GraphSchemaStore.js';
import { computed } from 'vue';
import NodeType from './NodeType.vue';

const chatStore = useChatStore();
const show = computed(() => chatStore.getIsConfigurationOpen);

const graphSchemaStore = useGraphSchemaStore();
graphSchemaStore.fetchGraphSchema();

const nodeTypes = computed(() => graphSchemaStore.nodeTypes);
const edgeTypes = computed(() => graphSchemaStore.edgeTypes);

function selectNodeType(nodeType) {
    if (graphSchemaStore.selectedNodeTypes.includes(nodeType)) {
        graphSchemaStore.selectedNodeTypes = graphSchemaStore.selectedNodeTypes.filter((nt) => nt !== nodeType);
        graphSchemaStore.selectedEdgeTypes = graphSchemaStore.selectedEdgeTypes.filter((et) => et.start_node_type !== nodeType && et.target_node_type !== nodeType);
    } else {
        graphSchemaStore.selectedNodeTypes.push(nodeType);
        graphSchemaStore.edgeTypes.forEach((et) => {
            if (et.start_node_type === nodeType ||  et.target_node_type === nodeType) {
                if (!graphSchemaStore.selectedEdgeTypes.includes(et)) {
                    graphSchemaStore.selectedEdgeTypes.push(et);
                }
            }
        });
    }
}

function selectEdgeType(edgeType) {
    if (graphSchemaStore.selectedEdgeTypes.includes(edgeType)) {
        graphSchemaStore.selectedEdgeTypes = graphSchemaStore.selectedEdgeTypes.filter((et) => et !== edgeType);
    } else {
        graphSchemaStore.selectedEdgeTypes.push(edgeType);
        if (!graphSchemaStore.selectedNodeTypes.includes(edgeType.start_node_type)) {
            graphSchemaStore.selectedNodeTypes.push(edgeType.start_node_type);
        }
        if (!graphSchemaStore.selectedNodeTypes.includes(edgeType.target_node_type)) {
            graphSchemaStore.selectedNodeTypes.push(edgeType.target_node_type);
        }
    }
}

function closeModal() {
    chatStore.setIsConfigurationOpen(false);
}
</script>


<style scoped>
@reference "../../style.css";

h2{
    @apply text-xl xl:text-4xl font-semibold mb-4;
}

h3{
    @apply text-lg xl:text-2xl font-semibold mt-4;
}
</style>