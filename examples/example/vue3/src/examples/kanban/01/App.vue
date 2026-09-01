<script setup lang="ts">
import { ref } from 'vue'
import { Kanban } from '@expcat/tigercat-vue/Kanban'
import type { TaskBoardColumn, TaskBoardSwimlane } from '@expcat/tigercat-core'

const swimlanes: TaskBoardSwimlane[] = [
  { id: 'feature', label: '功能', color: '#2563eb' },
  { id: 'bug', label: '缺陷', color: '#ef4444' }
]

const columns = ref<TaskBoardColumn[]>([
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计界面', type: 'feature' },
      { id: '2', title: '补充文档', type: 'feature' },
      { id: '4', title: '登录失败' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: '3', title: '实现看板', type: 'bug' }]
  },
  { id: 'done', title: '已完成', cards: [] }
])
</script>

<template>
  <Kanban
    v-model:columns="columns"
    :swimlanes="swimlanes"
    swimlane-field="type"
    enforce-wip-limit
    show-card-count
    :style="{ height: '400px' }" />
</template>
