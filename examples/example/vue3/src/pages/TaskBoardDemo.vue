<script setup lang="ts">
import { ref } from 'vue'
import { TaskBoard } from '@expcat/tigercat-vue'
import type { TaskBoardColumn, TaskBoardCardMoveEvent, TaskBoardColumnMoveEvent } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const columns = ref<TaskBoardColumn[]>([
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: 1, title: '需求评审', description: '与产品经理对齐 Q2 需求' },
      { id: 2, title: '技术方案', description: '编写 TaskBoard 组件方案' },
      { id: 3, title: '环境搭建' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    wipLimit: 3,
    cards: [
      { id: 4, title: '开发看板组件', description: '实现拖拽、列管理、样式' },
      { id: 5, title: '单元测试' }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [
      { id: 6, title: '项目初始化', description: '搭建 monorepo 框架' }
    ]
  }
])

const handleCardMove = (event: TaskBoardCardMoveEvent) => {
  console.log('card-move', event)
}

const handleColumnMove = (event: TaskBoardColumnMoveEvent) => {
  console.log('column-move', event)
}

const handleCardAdd = (columnId: string | number) => {
  const col = columns.value.find((c) => c.id === columnId)
  if (col) {
    col.cards.push({
      id: Date.now(),
      title: `新任务 ${col.cards.length + 1}`
    })
  }
}

// ---- columns for slot demo ----
const slotColumns = ref<TaskBoardColumn[]>([
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 's1', title: 'Design System', description: '建立设计规范', tag: '设计', priority: 'high' },
      { id: 's2', title: 'API 对接', description: '完成后端 API 集成', tag: '开发', priority: 'medium' }
    ]
  },
  {
    id: 'review',
    title: 'Review',
    wipLimit: 2,
    cards: [
      { id: 's3', title: 'Code Review', description: 'PR #42 审查', tag: '审查', priority: 'low' }
    ]
  }
])

const basicSnippet = `<TaskBoard
  v-model:columns="columns"
  @card-move="handleCardMove"
  @column-move="handleColumnMove"
  :on-card-add="handleCardAdd"
/>`

const slotSnippet = `<TaskBoard v-model:columns="slotColumns">
  <template #card="{ card }">
    <div class="flex flex-col gap-1">
      <span class="font-semibold text-sm">{{ card.title }}</span>
      <span class="text-xs opacity-60">{{ card.description }}</span>
      <div class="flex gap-1 mt-1">
        <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
          {{ card.tag }}
        </span>
      </div>
    </div>
  </template>
</TaskBoard>`
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">TaskBoard 任务看板</h1>
      <p class="text-gray-600">
        可拖拽的任务看板，支持卡片跨列流转、列排序、WIP 限制等。
      </p>
    </div>

    <DemoBlock
      title="基础用法"
      description="受控模式 + 卡片拖拽 + 列拖拽 + 新增卡片"
      :code="basicSnippet">
      <TaskBoard
        v-model:columns="columns"
        @card-move="handleCardMove"
        @column-move="handleColumnMove"
        :on-card-add="handleCardAdd" />
    </DemoBlock>

    <DemoBlock
      title="自定义卡片"
      description="通过 #card 插槽自定义卡片渲染"
      :code="slotSnippet"
      class="mt-8">
      <TaskBoard v-model:columns="slotColumns">
        <template #card="{ card }">
          <div class="flex flex-col gap-1">
            <span class="font-semibold text-sm">{{ card.title }}</span>
            <span class="text-xs opacity-60">{{ card.description }}</span>
            <div class="flex gap-1 mt-1">
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700">
                {{ card.tag }}
              </span>
            </div>
          </div>
        </template>
      </TaskBoard>
    </DemoBlock>
  </div>
</template>
