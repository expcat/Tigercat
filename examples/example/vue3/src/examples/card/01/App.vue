<script setup lang="ts">
import { Card } from '@expcat/tigercat-vue/Card'

function onOpen() {}
</script>

<template>
  <Card variant="shadow" size="md" hoverable aria-label="项目概览" @click="onOpen">
    <template #header><h3 class="font-semibold">项目概览</h3></template>
    <p class="text-gray-600 dark:text-gray-300">
      悬停抬起且可 Tab 进入。封面和 actions 见后面的示例。
    </p>
    <template #footer>
      <span class="text-sm text-gray-500 dark:text-gray-400">更新于刚刚</span>
    </template>
  </Card>
</template>
