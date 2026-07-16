<script setup lang="ts">
import { ref } from 'vue'
import { ColorSwatch } from '@expcat/tigercat-vue/ColorSwatch'

const color = ref('#3b82f6')
const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-4">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-3">
      <span class="w-8 text-sm text-gray-500">{{ size }}</span>
      <ColorSwatch v-model="color" :colors="palette" :size="size" :aria-label="`尺寸 ${size}`" />
    </div>
    <p class="text-sm text-gray-500">当前：{{ color }}</p>
  </div>
</template>
