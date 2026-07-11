<script setup lang="ts">
import { Timeline } from '@expcat/tigercat-vue/Timeline'

const items = [
  { key: 1, label: 'v1.0', title: '首次发布', detail: '完成核心组件。' },
  { key: 2, label: 'v1.1', title: '体验优化', detail: '补充主题和无障碍支持。' }
]
</script>

<template>
  <Timeline :items="items">
    <template #dot="{ item }">
      <span class="block h-3 w-3 rounded-full bg-[var(--tiger-primary,#2563eb)]">
        <span class="sr-only">{{ item.label }}</span>
      </span>
    </template>
    <template #item="{ item }">
      <div>
        <strong>{{ item.title }}</strong>
        <p class="text-sm text-gray-500">{{ item.detail }}</p>
      </div>
    </template>
  </Timeline>
</template>
