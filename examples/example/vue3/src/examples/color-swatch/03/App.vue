<script setup lang="ts">
import { ref } from 'vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'

const color = ref('#22c55e')
const palette = [
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#64748b'
]
</script>

<template>
  <div class="space-y-4">
    <div>
      <p class="mb-2 text-sm text-gray-500">columns=4</p>
      <ColorSwatch v-model="color" :colors="palette" :columns="4" aria-label="四列色板" />
    </div>
    <div>
      <p class="mb-2 text-sm text-gray-500">disabled</p>
      <ColorSwatch :model-value="color" :colors="palette" :columns="8" disabled aria-label="禁用色板" />
    </div>
  </div>
</template>
