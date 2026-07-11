<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'
</script>

<template>
  <Card variant="shadow" size="md" hoverable>
    <template #header><h3 class="font-semibold">项目概览</h3></template>
    <p class="text-gray-600">一个实例组合展示阴影、尺寸、悬停、头部与底部。</p>
    <template #footer><span class="text-sm text-gray-500">更新于刚刚</span></template>
  </Card>
</template>
