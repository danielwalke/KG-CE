import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import typography from '@tailwindcss/typography';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    typography(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // CRITICAL FIX: Force usage of the pre-bundled dagre build
      'dagre': 'dagre/dist/dagre.js' 
    }
  },
})