<script setup lang="ts">
import { ref } from 'vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'

const color = ref('#2563eb')
const formats = ['hex', 'rgb', 'hsl'] as const
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-4">
      <div v-for="format in formats" :key="format" class="flex items-center gap-2">
        <ColorPicker v-model="color" :format="format" />
        <span class="text-sm text-gray-500">{{ format }}</span>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <ColorPicker v-for="size in sizes" :key="size" v-model="color" :size="size" />
    </div>
  </div>
</template>
