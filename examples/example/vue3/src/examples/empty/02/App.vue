<script setup lang="ts">
import { Empty } from '@expcat/tigercat-vue/Empty'

const presets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="preset in presets"
      :key="preset"
      class="rounded border border-gray-200 p-4 dark:border-gray-700">
      <Empty :preset="preset" />
      <p class="mt-2 text-center text-xs text-gray-400">preset="{{ preset }}"</p>
    </div>
  </div>
</template>
