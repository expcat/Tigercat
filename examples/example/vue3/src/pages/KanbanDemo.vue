<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Kanban 看板</h1>
    <p class="text-gray-500 mb-8">可拖拽的看板面板，支持卡片和列拖拽排序。</p>

    <DemoBlock title="基础用法" description="columns 定义列和卡片，支持拖拽" :code="basicSnippet">
      <Kanban v-model:columns="columns" allow-add-card :style="{ height: '400px' }" />
    </DemoBlock>

    <DemoBlock title="禁用拖拽 & WIP 限制" description="draggable=false 禁用，enforceWipLimit 限制列容量" :code="wipSnippet">
      <Kanban :default-columns="wipColumns" :draggable="false" enforce-wip-limit :show-card-count="true" :style="{ height: '350px' }" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Kanban } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const columns = ref([
  {
    id: 'todo',
    title: '待办',
    cards: [
      { id: '1', title: '设计 UI', description: '完成组件设计稿' },
      { id: '2', title: '编写文档', description: '更新 API 文档' }
    ]
  },
  {
    id: 'doing',
    title: '进行中',
    cards: [
      { id: '3', title: '开发 Kanban', description: '实现看板组件' }
    ]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [
      { id: '4', title: '项目搭建', description: '初始化项目结构' }
    ]
  }
])

const wipColumns = [
  {
    id: 'backlog',
    title: '需求池',
    wipLimit: 5,
    cards: [
      { id: 'a', title: '需求 A' },
      { id: 'b', title: '需求 B' },
      { id: 'c', title: '需求 C' }
    ]
  },
  {
    id: 'wip',
    title: '开发中 (WIP=2)',
    wipLimit: 2,
    cards: [
      { id: 'd', title: '任务 D' },
      { id: 'e', title: '任务 E' }
    ]
  },
  {
    id: 'review',
    title: '评审',
    cards: []
  }
]

const basicSnippet = `const columns = ref([
  { id: 'todo', title: '待办', cards: [{ id: '1', title: '设计 UI', description: '...' }] },
  { id: 'doing', title: '进行中', cards: [...] },
  { id: 'done', title: '已完成', cards: [...] }
])

<Kanban v-model:columns="columns" allow-add-card />`

const wipSnippet = `<Kanban :default-columns="columns" :draggable="false" enforce-wip-limit :show-card-count="true" />`
</script>
