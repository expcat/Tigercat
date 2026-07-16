<script setup lang="ts">
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue/Pagination'

const current = ref(2)
const sizes = ['small', 'medium', 'large'] as const
</script>

<template>
  <div class="space-y-4">
    <div v-for="size in sizes" :key="size">
      <p class="mb-1 text-sm text-gray-500">size={{ size }}</p>
      <Pagination v-model:current="current" :total="120" :size="size" align="left" />
    </div>
  </div>
</template>
