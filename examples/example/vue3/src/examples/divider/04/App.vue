<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <div class="text-gray-700 dark:text-gray-300">color="#2563eb" thickness="2px"</div>
      <Divider color="#2563eb" thickness="2px" />
      <div class="text-gray-700 dark:text-gray-300">color="#10b981" thickness="4px"（dashed）</div>
      <Divider color="#10b981" thickness="4px" line-style="dashed" />
    </div>
  </div>
</template>
