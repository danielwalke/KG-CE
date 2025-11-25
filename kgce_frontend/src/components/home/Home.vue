<template>
    <div class="page-container">
        <div class="content-wrapper">
            
            <div class="text-center space-y-2 max-w-4xl">
                <h1 class="hero-title">
                    Knowledge Graph Context Engineering
                </h1>
                <h2 class="hero-subtitle">
                    "Inject the connectivity of a Graph and the precision of a Surgeon into your LLM context."
                </h2>
            </div>

            <hr class="divider">

            <div class="w-full">
                <h3 class="section-title text-red-400">
                    The Current Landscape
                </h3>
                <div class="grid-layout">
                    <Block title="Standard RAG: The Silo Trap" class="block-limitation">                
                        <p>Documents act as isolated islands, missing critical hidden connections between facts. Your LLM retrieves chunks but misses the bigger picture.</p>
                        <div class="limitation-img-container">
                            <img :src="Home_SiloTrap" alt="Silo Trap" class="img-fill"/>
                        </div>
                    </Block>

                    <Block title="GraphRAG: The Noise Flood" class="block-limitation">                
                        <p>While it maps relationships, it drowns the context window in irrelevant edges. The result is bloated costs and hallucination-prone verbosity.</p>
                         <div class="limitation-img-container">
                            <img :src="Home_Noise" alt="Tangled Web" class="img-fill"/>
                        </div>
                    </Block>

                    <Block title="The 'Black Box' Frustration" class="block-limitation">                
                        <p>Current tools force an "all or nothing" approach to retrieval. You have zero granular control over which relationships actually matter for your specific query.</p>
                         <div class="limitation-img-container">
                            <img :src="Home_BlackBox" alt="Broken Controls" class="img-fill"/>
                        </div>
                    </Block>
                </div>
            </div>

            <div class="w-full">
                <h3 class="section-title text-emerald-400">
                    The KG-CE Advantage
                </h3>
                <div class="grid-layout">
                    <Block title="Smart Connectivity">                
                        <p>Traverse the graph to fetch only the connected nodes that matter. Solve RAG’s blindness by retrieving the relationship, not just the text.</p>
                        <img :src="Home_Connections" alt="Connections" class="img-benefit"/>
                    </Block>

                    <Block title="Surgical Context Precision">                
                        <p>Filter out the noise of GraphRAG. Define strict paths and depths to ensure only high-signal tokens enter your LLM context window.</p>
                        <img :src="Home_Relevance" alt="Relevance" class="img-benefit"/>
                    </Block>

                    <Block title="You Are The Architect">                
                        <p>Customize the retrieval logic using simple filters. Whether for sales or support, you decide exactly what information structure enters the prompt.</p>
                        <img :src="Home_Architect" alt="Architect" class="img-benefit"/>
                    </Block>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>  
import Block from '../home/Block.vue'
import Home_Connections from "../../assets/Home_Connections.png";
import Home_Relevance from "../../assets/Home_Relevance.png";
import Home_Architect from "../../assets/Home_Architect.png";
import Home_Noise from "../../assets/Home_Noise.png";
import Home_BlackBox from "../../assets/Home_BlackBox.png";
import Home_SiloTrap from "../../assets/Home_SiloTrap.png";
</script>

<style scoped>
@reference "../../style.css";

/* --- Layout & Typography --- */
.page-container {
    @apply h-full w-full flex justify-center bg-black/80 select-none overflow-y-auto;
}

.content-wrapper {
    @apply w-full lg:w-4/5 flex flex-col items-center p-8 lg:p-12 text-white space-y-12;
}

.hero-title {
    @apply font-extrabold text-4xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 pb-6;
}

.hero-subtitle {
    @apply text-xl lg:text-3xl font-light text-gray-300 italic;
}

.divider {
    @apply w-1/2 h-2 border-gray-700 opacity-50 mb-2;
}

.section-title {
    @apply text-2xl font-bold mb-6 uppercase tracking-widest text-center lg:text-left;
}

.grid-layout {
    @apply grid grid-cols-1 xl:grid-cols-3 gap-8 w-full;
}

p {
    @apply text-gray-300 text-base leading-relaxed;
}

/* --- Block Styles --- */
.block-limitation {
    @apply border-l-4 border-red-500 bg-black/40;
}

/* --- Image & Visual Styles --- */

/* 1. Limitation Container (The box with the dashed border) */
.limitation-img-container {
    @apply mt-6 h-84 w-full bg-gray-800 rounded-xl flex items-center justify-center border border-dashed border-gray-600 overflow-hidden;
}

/* 2. Image inside limitation container (fills the box) */
.img-fill {
    @apply w-full h-full object-cover transition-transform duration-500 hover:scale-110;
}

/* 3. Benefit Images (Standalone images) */
.img-benefit {
    @apply mt-6 w-full h-78 object-cover rounded-xl shadow-lg border border-gray-700 transition-transform duration-500 hover:scale-105;
}
</style>