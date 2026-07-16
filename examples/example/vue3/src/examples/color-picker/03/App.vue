<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'

const color = ref('#059669')
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div class="flex items-center gap-2">
      <ColorPicker
        v-model="color"
        :presets="['#059669', '#2563eb', '#7c3aed', '#dc2626', '#f59e0b', '#0891b2']" />
      <span class="text-sm text-gray-500">presets 快速选色</span>
    </div>
    <div class="flex items-center gap-2">
      <ColorPicker :model-value="'#94a3b8'" disabled />
      <span class="text-sm text-gray-500">disabled</span>
    </div>
  </div>
</template>
