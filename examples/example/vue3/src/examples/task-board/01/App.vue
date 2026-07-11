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
  }
])

const handleCardAdd = (columnId: string | number) => {
  columns.value = columns.value.map((column) =>
    column.id === columnId
      ? {
          ...column,
          cards: [...column.cards, { id: Date.now(), title: '新任务' }]
        }
      : column
  )
}
</script>

<template>
  <TaskBoard
    v-model:columns="columns"
    allow-add-card
    enforce-wip-limit
    :labels="{ addCardText: '新增任务' }"
    @card-add="handleCardAdd" />
</template>
