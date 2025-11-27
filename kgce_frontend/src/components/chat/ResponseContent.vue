<template>
    <div class="flex flex-col gap-2 items-start w-full my-2">

        <button @click="isShowThinking = !isShowThinking" class="group flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 select-none text-sm w-full text-left
           bg-gray-100 hover:bg-gray-200 text-gray-700
           dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 border border-transparent dark:border-white/5">

            <svg xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200 opacity-60 group-hover:opacity-100"
                :class="{ 'rotate-90': isShowThinking }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>

            <span class="font-medium opacity-80">Thought Process</span>

            <span v-if="isThinking(msg)" class="flex items-center gap-2 ml-auto">
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span class="text-xs text-sky-500 font-mono animate-pulse">Generating...</span>
            </span>

        </button>

        <div v-if="isShowThinking" class="w-full overflow-hidden">
            <div class="text-sm p-4 rounded-md 
                bg-gray-50 text-gray-600 border border-gray-200
                dark:bg-black/20 dark:text-gray-400 dark:border-white/10">
                <div v-if="msg.content" v-html="parseMarkdownThinking(msg.content)"
                    class="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-black/50">
                </div>

                <div v-else class="italic opacity-50">Initializing thought process...</div>
            </div>
        </div>

        <div v-if="!isThinking(msg) || (msg.content && parseMarkdown(msg.content))" v-html="parseMarkdown(msg.content)"
            class="prose prose-sm dark:prose-invert max-w-none mt-2"></div>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

defineProps({
    msg: {
        type: Object,
        required: true
    }
});

const isShowThinking = ref(false);

const parseMarkdown = (content) => {
    const rawHtml = marked.parse(content.split('</think>').slice(-1)[0]);
    return DOMPurify.sanitize(rawHtml);
};

const parseMarkdownThinking = (content) => {
    const rawHtml = marked.parse(content.split('<think>')[1].split('</think>')[0]);
    return DOMPurify.sanitize(rawHtml);
};

function isThinking(msg) {
    return msg.type === 'response' && msg.content.includes("<think>") && !msg.content.includes("</think>");
}
</script>