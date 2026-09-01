<script setup lang="ts">
import { ref } from 'vue'
import { TaskBoard } from '@expcat/tigercat-vue/TaskBoard'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

const columns = ref<TaskBoardColumn[]>([
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: 1, title: '整理示例' },
      { id: 2, title: '补充说明' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: 3, title: '运行验证' }]
  },
  { id: 'done', title: '已完成', cards: [] }
])
</script>

<template>
  <TaskBoard v-model:columns="columns" allow-add-card enforce-wip-limit show-card-count />
</template>
