<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <div class="flex items-center h-12">
        <span class="text-gray-700 dark:text-gray-300">Left</span>
        <Divider orientation="vertical" class="h-6" />
        <span class="text-gray-700 dark:text-gray-300">Middle</span>
        <Divider orientation="vertical" class="h-6" line-style="dashed" />
        <span class="text-gray-700 dark:text-gray-300">Right</span>
      </div>
    </div>
  </div>
</template>
