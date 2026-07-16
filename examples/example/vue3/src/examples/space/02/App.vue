<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'

const items = ['项目一', '项目二', '项目三']
</script>

<template>
  <div class="space-y-6">
    <div>
      <p class="mb-2 text-sm text-gray-500">direction="vertical"</p>
      <Space direction="vertical" size="md">
        <span v-for="t in items" :key="t" class="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white">
          {{ t }}
        </span>
      </Space>
    </div>
    <div>
      <p class="mb-2 text-sm text-gray-500">size=40（自定义像素间距）</p>
      <Space :size="40">
        <span v-for="t in items" :key="t" class="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white">
          {{ t }}
        </span>
      </Space>
    </div>
  </div>
</template>
