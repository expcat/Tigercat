<script setup lang="ts">
import { Result } from '@expcat/tigercat-vue/Result'

const semantic = ['success', 'info', 'warning', 'error'] as const
const http = ['404', '403', '500'] as const
</script>

<template>
  <div class="grid min-h-full grid-cols-1 gap-4 overflow-auto sm:grid-cols-3">
    <div
      v-for="status in semantic"
      :key="status"
      class="rounded border border-gray-200 dark:border-gray-700">
      <Result :status="status" :title="status" sub-title="语义状态" />
    </div>
    <div
      v-for="status in http"
      :key="status"
      class="rounded border border-gray-200 dark:border-gray-700">
      <Result :status="status" sub-title="HTTP 数字即可见名" />
    </div>
  </div>
</template>
