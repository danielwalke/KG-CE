import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from './Routes.js'

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})