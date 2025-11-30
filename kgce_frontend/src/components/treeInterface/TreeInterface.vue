<template>
    <div class="h-full flex flex-col gap-4 p-4 overflow-hidden bg-gray-900 text-gray-100">

        <div class="flex-none space-y-4 border-b border-gray-700 pb-4">
            <div v-if="savedPaths.length > 0">
                <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Saved Paths</h3>
                <div class="flex flex-wrap gap-2">
                    <div v-for="(path, index) in savedPaths" :key="index" class="text-xs bg-gray-800 p-1 px-2 rounded">
                        Path #{{ index + 1 }} ({{ path.length }} nodes)
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Path</h3>
                <div class="flex flex-wrap items-center gap-2 bg-gray-800/50 p-3 rounded-lg min-h-[3rem]">
                    <span v-if="currentPath.length === 0" class="text-gray-500 italic text-sm">No path started...</span>
                    
                    <template v-for="(node, index) in currentPath" :key="node.id">
                        <span v-if="index > 0" class="text-gray-500">/</span>
                        <button 
                            class="path-node" 
                            @click="handlePathClick(node)"
                            title="Reset path to this node"
                        >
                            {{ node.name }}
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            <section>
                <h3 class="section-header">Start Queries</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button 
                        v-for="query in queries" 
                        :key="query" 
                        @click="selectQuery(query)"
                        class="tab-block"
                        :class="{ 'active': selectedQuery === query }"
                    >
                        {{ query }}
                    </button>
                </div>
            </section>

            <section v-if="selectedQuery">
                <h3 class="section-header">Topics for "{{ selectedQuery }}"</h3>
                <div v-if="topics.length" class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    <button 
                        v-for="topic in topics" 
                        :key="topic.id" 
                        @click="selectTopic(topic)"
                        class="tab-block"
                    >
                        {{ topic.name }}
                    </button>
                </div>
                <div v-else class="text-gray-500 italic text-sm">No topics found.</div>
            </section>

            <section v-if="childrenNodes.length">
                <h3 class="section-header">Next Nodes</h3>
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <button 
                        v-for="node in childrenNodes" 
                        :key="node.id" 
                        @click="selectChildNode(node)"
                        class="tab-block"
                    >
                        {{ node.name }}
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTreeStore } from '../../stores/TreeStore';

const treeStore = useTreeStore();

const selectedQuery = ref(undefined);

const queries = computed(() => treeStore.getQueries);
const currentPath = computed(() => treeStore.getCurrentPath);
const savedPaths = computed(() => treeStore.storedPaths || []); 
const childrenNodes = computed(() => treeStore.getChildren);

const topics = computed(() => {
    if (!selectedQuery.value) return [];
    return treeStore.queriesToTopics[selectedQuery.value] || [];
});

function selectQuery(query) {
    selectedQuery.value = query;
}

function selectTopic(topic) {
    resetPathAndSelect(topic); 
}

function selectChildNode(node) {
    treeStore.selectNode(node);
}

function handlePathClick(node) {
    resetPathAndSelect(node);
}

function resetPathAndSelect(node) {
    if (treeStore.currentPath.length === 0) {
        treeStore.selectNode(node);
        return;
    }

    treeStore.storedPaths.push([...treeStore.currentPath]);

    const nodesInPath = [];
    if (node.parent !== undefined) {
        reconstructPath(node.parent, nodesInPath);
    }
    
    treeStore.currentPath = nodesInPath;
    treeStore.selectNode(node);
}

function reconstructPath(nodeId, pathArray) {
    const node = treeStore.nodeIdToNode[nodeId];
    if (!node) return;
    
    pathArray.unshift(node);
    if (node.parent !== undefined) {
        reconstructPath(node.parent, pathArray);
    }
}
</script>

<style scoped>
@reference "../../style.css";

.section-header {
    @apply text-xs font-bold text-gray-500 uppercase mb-2 ml-1;
}

.tab-block {
    @apply bg-gray-800 text-gray-200 p-3 rounded-lg text-sm text-left transition-all duration-200 border border-gray-700 hover:bg-gray-700 hover:border-blue-500 hover:text-white;
}

.tab-block.active {
    @apply bg-blue-900/40 border-blue-500 text-white ring-1 ring-blue-500;
}

.path-node {
    @apply px-2 py-1 rounded hover:bg-white/10 text-blue-400 font-medium transition-colors text-sm;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-700 rounded-full;
}
</style>