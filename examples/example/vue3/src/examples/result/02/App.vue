<script setup lang="ts">
import { Result } from '@expcat/tigercat-vue/Result'

const statuses = ['info', 'warning', 'error', '404', '403', '500'] as const
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="status in statuses" :key="status" class="rounded border border-gray-200 dark:border-gray-700">
      <Result :status="status" :title="`状态：${status}`" sub-title="状态决定图标与配色" />
    </div>
  </div>
</template>
