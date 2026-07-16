<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'

const on = ref(true)
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="flex items-center gap-6">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-2">
      <Switch v-model="on" :size="size" :aria-label="`尺寸 ${size}`" />
      <span class="text-sm text-gray-500">{{ size }}</span>
    </div>
  </div>
</template>
