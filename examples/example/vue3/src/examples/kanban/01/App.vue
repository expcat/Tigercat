<script setup lang="ts">
import { ref } from 'vue'
import { Kanban } from '@expcat/tigercat-vue/Kanban'
import type { TaskBoardColumn } from '@expcat/tigercat-core'

const columns = ref<TaskBoardColumn[]>([
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计界面' },
      { id: '2', title: '补充文档' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 2,
    cards: [{ id: '3', title: '实现看板' }]
  },
  { id: 'done', title: '已完成', cards: [] }
])
</script>

<template>
  <Kanban
    v-model:columns="columns"
    allow-add-card
    enforce-wip-limit
    show-card-count
    :style="{ height: '400px' }" />
</template>
