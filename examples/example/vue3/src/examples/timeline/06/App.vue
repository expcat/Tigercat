<script setup lang="ts">
import { Tag } from '@expcat/tigercat-vue/Tag'
import { h } from 'vue'
import { Timeline } from '@expcat/tigercat-vue/Timeline'

// Basic timeline data
const basicEvents = [
  { key: 1, label: '2024-01-01', content: '创建项目' },
  { key: 2, label: '2024-01-05', content: '编写文档' },
  { key: 3, label: '2024-01-10', content: '发布版本 1.0' }
]

// Timeline with colors
const coloredEvents = [
  {
    key: 1,
    label: '2024-01-01',
    content: '项目启动',
    color: '#10b981'
  },
  {
    key: 2,
    label: '2024-01-05',
    content: '开发进行中',
    color: '#3b82f6'
  },
  {
    key: 3,
    label: '2024-01-10',
    content: '即将发布',
    color: '#f59e0b'
  }
]

// Project timeline with custom rendering
const projectTimeline = [
  {
    key: 1,
    date: '2024-01-01 09:00',
    title: '项目启动会议',
    description: '团队会议和项目计划',
    status: 'completed',
    color: '#10b981'
  },
  {
    key: 2,
    date: '2024-01-05 14:30',
    title: '设计评审',
    description: 'UI/UX 设计展示和反馈',
    status: 'completed',
    color: '#10b981'
  },
  {
    key: 3,
    date: '2024-01-10 10:00',
    title: '开发冲刺 1',
    description: '实现核心功能',
    status: 'in-progress',
    color: '#3b82f6'
  },
  {
    key: 4,
    date: '2024-01-20',
    title: '测试阶段',
    description: 'QA 测试和 Bug 修复',
    status: 'pending',
    color: '#6b7280'
  }
]

// Timeline with custom dots
const customDotEvents = [
  {
    key: 1,
    label: '2024-01-01',
    content: '项目完成',
    dot: h('div', { class: 'w-4 h-4 bg-green-500 rounded-full flex items-center justify-center' }, [
      h('svg', { class: 'w-3 h-3 text-white', fill: 'currentColor', viewBox: '0 0 20 20' }, [
        h('path', {
          'fill-rule': 'evenodd',
          d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
          'clip-rule': 'evenodd'
        })
      ])
    ])
  },
  {
    key: 2,
    label: '2024-01-05',
    content: '进行中',
    dot: h('div', { class: 'w-4 h-4 bg-blue-500 rounded-full animate-pulse' })
  },
  {
    key: 3,
    label: '2024-01-10',
    content: '待处理',
    dot: h('div', { class: 'w-4 h-4 bg-gray-300 rounded-full' })
  }
]

const renderDotEvents = [
  { key: 1, label: '2024-01-01', content: '已完成' },
  { key: 2, label: '2024-01-05', content: '进行中' },
  { key: 3, label: '2024-01-10', content: '待处理' }
]

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'primary'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in-progress':
      return '进行中'
    default:
      return '待处理'
  }
}
</script>

<template>
  <div class="min-w-0">
    <Timeline :items="projectTimeline">
      <template #item="{ item }">
        <div class="mb-2">
          <span class="text-sm text-gray-500">{{ item.date }}</span>
        </div>
        <div class="font-medium text-gray-900 mb-1">
          {{ item.title }}
          <Tag :variant="getStatusVariant(item.status)" size="sm" class="ml-2">
            {{ getStatusText(item.status) }}
          </Tag>
        </div>
        <div class="text-gray-600 dark:text-gray-400">{{ item.description }}</div>
      </template>
    </Timeline>
  </div>
</template>
