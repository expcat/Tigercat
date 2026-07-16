<script setup lang="ts">
import { ref } from 'vue'
import { Rate } from '@expcat/tigercat-vue/Rate'

const value = ref(3)
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-3">
    <div v-for="size in sizes" :key="size" class="flex items-center gap-3">
      <span class="w-10 text-sm text-gray-500">{{ size }}</span>
      <Rate v-model="value" :size="size" />
    </div>
    <div class="flex items-center gap-3">
      <span class="w-10 text-sm text-gray-500">count</span>
      <Rate v-model="value" :count="10" />
    </div>
  </div>
</template>
