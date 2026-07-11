<script setup lang="ts">
import { ref } from 'vue'
import { Kanban } from '@expcat/tigercat-vue/Kanban'

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
    cards: [{ id: '3', title: '开发 Kanban', description: '实现看板组件' }]
  },
  {
    id: 'done',
    title: '已完成',
    cards: [{ id: '4', title: '项目搭建', description: '初始化项目结构' }]
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
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">columns 定义列和卡片，支持拖拽</p>
        <Kanban v-model:columns="columns" allow-add-card :style="{ height: '400px' }" />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用拖拽 & WIP 限制</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          draggable=false 禁用，enforceWipLimit 限制列容量
        </p>
        <Kanban
          :default-columns="wipColumns"
          :draggable="false"
          enforce-wip-limit
          :show-card-count="true"
          :style="{ height: '350px' }" />
      </section>
    </div>
  </div>
</template>
