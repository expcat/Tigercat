<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'

const hex = ref('#2563eb')
const rgb = ref('rgb(37, 99, 235)')
const hsl = ref('hsl(221, 83%, 53%)')
const sizeColor = ref('#2563eb')
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <ColorPicker v-model="hex" format="hex" />
        <span class="text-sm text-gray-500">hex</span>
        <code class="text-xs text-[var(--tiger-text-muted,#6b7280)]">{{ hex }}</code>
      </div>
      <div class="flex items-center gap-2">
        <ColorPicker v-model="rgb" format="rgb" />
        <span class="text-sm text-gray-500">rgb</span>
        <code class="text-xs text-[var(--tiger-text-muted,#6b7280)]">{{ rgb }}</code>
      </div>
      <div class="flex items-center gap-2">
        <ColorPicker v-model="hsl" format="hsl" />
        <span class="text-sm text-gray-500">hsl</span>
        <code class="text-xs text-[var(--tiger-text-muted,#6b7280)]">{{ hsl }}</code>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <ColorPicker v-for="size in sizes" :key="size" v-model="sizeColor" :size="size" />
    </div>
  </div>
</template>
