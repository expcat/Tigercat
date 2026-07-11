<script setup lang="ts">
import { Timeline } from '@expcat/tigercat-vue/Timeline'

const items = [
  { key: 1, label: '第一步', content: '提交申请' },
  { key: 2, label: '第二步', content: '人工审核' }
]
</script>

<template>
  <Timeline :items="items" reverse :pending="true">
    <template #pending>
      <span class="text-blue-600">处理中…</span>
    </template>
  </Timeline>
</template>
