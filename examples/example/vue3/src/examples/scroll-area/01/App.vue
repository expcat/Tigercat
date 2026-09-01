<script setup lang="ts">
import { ScrollArea } from '@expcat/tigercat-vue/ScrollArea'

const items = Array.from({ length: 24 }, (_, index) => `第 ${index + 1} 条更新日志`)
</script>

<template>
  <div class="w-full max-w-md">
    <ScrollArea
      :height="200"
      :max-height="200"
      shadow
      aria-label="更新日志"
      class="rounded-lg border border-gray-200 dark:border-gray-700">
      <ul class="divide-y divide-gray-100 px-4 dark:divide-gray-800">
        <li v-for="item in items" :key="item" class="py-2 text-sm text-gray-700 dark:text-gray-200">
          {{ item }}
        </li>
      </ul>
    </ScrollArea>
  </div>
</template>
