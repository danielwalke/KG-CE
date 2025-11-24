<template>
    <div class="h-full flex justify-center w-full">
        <div class="w-full lg:w-4/5 flex flex-col justify-center items-center p-4 bg-black/80 shadow-lg text-white">
            <h1 class="font-bold lg:text-7xl text-2xl">Knowledge Graph Context Engineering (KG-CE)</h1>
            <h3 class="italic font-semibold lg:text-4xl text-lg p-4">Welcome to Precision Context Engine
Where every token counts, because your knowledge does too.</h3>
            <div class="grid lg:grid-cols-3 grid-cols-1 gap-4 w-full mt-4">
                <Block title="Your Knowledge, Precisely Connected">                
                    <p class="justified">
                        We merge documents into a dynamic knowledge graph—but you choose which nodes and edges feed the LLM. Solve RAG’s isolation without GraphRAG’s noise.</p>
                </Block>
                <Block title="No More Haystacks. Just Needles.">                
                    <p class="justified">Cut irrelevant context with surgical precision. Only the most critical paths reach your LLM—reducing token waste and boosting accuracy.</p>
                </Block>
                <Block title="You’re the Architect. Not the Victim.">                
                    <p class="justified">Define filters, relationships, and depth in plain English. Customize context for sales, support, or research—no PhD required.</p>
                </Block>
            </div>

            <div class="grid lg:grid-cols-3 grid-cols-1 gap-4 w-full mt-4">
                <Block title="RAG’s Isolation Trap">                
                    <p class="justified">Traditional RAG treats documents as isolated islands. It misses critical connections between facts, leading to shallow, fragmented answers.</p>
                </Block>
                <Block title="GraphRAG’s Noise Flood">                
                    <p class="justified">While GraphRAG maps relationships, it drowns LLMs in irrelevant context. You get verbose, off-target responses bloated with unnecessary data.</p>
                </Block>
                <Block title="You’re Not in Control">                
                    <p class="justified">Both force you to accept all or nothing. No way to curate exactly which relationships matter for your task. Frustrating.</p>
                </Block>
            </div>
        </div>
    </div>
</template>

<script setup>  
import Block from '../home/Block.vue'
</script>

<style scoped>
@reference "../../style.css";
p{
    @apply text-justify lg:text-lg text-base font-semibold;
}
</style>