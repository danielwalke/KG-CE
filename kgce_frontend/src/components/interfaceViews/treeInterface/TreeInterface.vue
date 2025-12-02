<template>
    <div class="h-full flex flex-col gap-4 p-4 overflow-hidden text-white">

        <div class="flex-none space-y-4 border-b border-white/10 pb-4">
            <div>
                <input type="text" v-model="searchTerm" placeholder="Type your filter..." class="w-full p-2 rounded-md bg-black/80 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"/>
            </div>
            <div v-if="savedPaths.length > 0" class="max-h-48 overflow-y-auto">
                <h3 class="section-header text-base">SAVED PATHS:</h3>
                <div class="flex flex-col gap-2">
                    <div v-for="(path, index) in savedPaths" :key="index" class="path-tag  max-w-max overflow-x-auto">
                        <div class="p-1 rounded-md" v-for="node in path" :key="node.id + '-' + index" :style="node.style">{{ node.name }}</div>
                        <Delete :handleDelete="() => deletePath(path)"/>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="section-header text-base">CURRENT PATH:</h3>
                <div
                    class="flex flex-wrap items-center gap-2 bg-black/40 border border-white/10 p-3 rounded-md min-h-12">
                    <span v-if="currentPath.length === 0" class="text-white/50 italic text-sm">No path started...</span>

                    <template v-for="(node, index) in currentPath" :key="node.id">
                        <span v-if="index > 0" class="text-white/40">/</span>
                        <button class="path-node-btn" @click="handlePathClick(node)" title="Reset path to this node" :style="node.style">
                            {{ node.name }}
                        </button>
                    </template>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">

            <section>
                <h3 class="section-header">START QUERIES:</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button v-for="query in queries" :key="query" @click="()=>selectedQuery = query" class="tab-block"
                        :class="{ 'active': selectedQuery === query }">
                        {{ query }}
                    </button>
                </div>
            </section>

            <section v-if="selectedQuery">
                <h3 class="section-header">TOPICS:</h3>
                <div v-if="topics.length" class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    <button v-for="topic in topics" :key="topic.id" @click="selectTopic(topic)" class="tab-block" :style="topic.style">
                        {{ topic.name }}
                    </button>
                </div>
                <div v-else class="text-white/50 italic pl-2">No topics found.</div>
            </section>

            <section v-if="childrenNodes.length">
                <h3 class="section-header">NEXT NODES:</h3>
                <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    <button v-for="node in childrenNodes" :key="node.id" @click="selectChildNode(node)"
                        class="tab-block" :style="node.style">
                        {{ node.name }}
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useTreeStore } from '../../../stores/TreeStore';
import Delete from '../../icons/Delete.vue';
const treeStore = useTreeStore();
const selectedQuery = computed({
    get: () => treeStore.selectedQuery,
    set: (value) => treeStore.setSelectedQuery(value)
});
const searchTerm = computed({
    get: () => treeStore.searchTerm,
    set: (value) => treeStore.setSearchTerm(value)
});

const queries = computed(() => treeStore.getQueries.filter(query =>
    query.toLowerCase().includes(searchTerm.value.toLowerCase())
));

const currentPath = computed(() => treeStore.getCurrentPath);
const savedPaths = computed(() => {
    const pathsThatIncludeSearchTerm = treeStore.storedPaths.filter(path =>
        path.some(node => node.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
    return pathsThatIncludeSearchTerm || [];
});
const childrenNodes = computed(() => {
    return treeStore.getChildren.filter(node => node.name.toLowerCase().includes(searchTerm.value.toLowerCase()))
});

const topics = computed(() => {
    if (!selectedQuery.value) return [];
    if (!(selectedQuery.value in treeStore.queriesToTopics)) return [];
    return treeStore.queriesToTopics[selectedQuery.value].filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

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
    treeStore.resetPathAndSelect(node);
}

function deletePath(path){
    treeStore.deletePath(path);
}
</script>

<style scoped>
@reference "../../../style.css";

/* Matches the .message-header style from your chat:
   Bold, Italic, specific margin
*/
.section-header {
    @apply font-bold italic flex items-center gap-2 justify-start mb-2 text-white;
}

/* Matches .instruction-container / .topic-container style:
   bg-black/80, rounded-md, text-white
*/
.tab-block {
    @apply bg-black/80 text-white p-3 rounded-md text-sm text-justify font-semibold border border-transparent transition-all duration-150;
    /* Hover effect */
    @apply hover:bg-black/60 hover:border-white/20 cursor-pointer;
}

/* Active state for Queries */
.tab-block.active {
    @apply border-white bg-black/90;
}

/* Small tags for saved paths */
.path-tag {
    @apply text-xs bg-black/60 border border-white/10 p-1 px-2 rounded-md text-white/80 flex items-center gap-2;
}

/* Breadcrumb items */
.path-node-btn {
    @apply px-2 py-1 rounded-md hover:bg-white/20 text-white font-semibold transition-colors text-sm;
}

/* Scrollbar customization to match dark theme */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-white/20 rounded-full hover:bg-white/40;
}
</style>