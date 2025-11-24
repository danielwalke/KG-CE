<script setup>
import { computed } from 'vue'
import { Position, Handle } from '@vue-flow/core'

const props = defineProps({
  position: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
})

const x = computed(() => `${Math.round(props.position.x)}px`)
const y = computed(() => `${Math.round(props.position.y)}px`)

function clickHandler() {
  console.log('Special node clicked!')
}
</script>

<template>
  <div class="vue-flow__node-default" @click="clickHandler">
    <div>{{ props.name }}</div>

    <div>
      {{ x }} {{ y }}
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>