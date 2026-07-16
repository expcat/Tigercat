<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'

const aligns = ['start', 'center', 'end'] as const
const tags = Array.from({ length: 10 }, (_, i) => i + 1)
</script>

<template>
  <div class="space-y-6">
    <div v-for="align in aligns" :key="align">
      <p class="mb-2 text-sm text-gray-500">align="{{ align }}"</p>
      <Space :align="align" size="md">
        <span class="rounded bg-emerald-600 px-3 py-1 text-sm text-white">小</span>
        <span class="rounded bg-emerald-600 px-3 py-4 text-sm text-white">高</span>
        <span class="rounded bg-emerald-600 px-3 py-2 text-sm text-white">中</span>
      </Space>
    </div>
    <div>
      <p class="mb-2 text-sm text-gray-500">wrap（窄容器内自动换行）</p>
      <div class="max-w-xs">
        <Space size="sm" wrap>
          <span v-for="i in tags" :key="i" class="rounded bg-emerald-600 px-3 py-1 text-sm text-white">
            标签 {{ i }}
          </span>
        </Space>
      </div>
    </div>
  </div>
</template>
