<script setup lang="ts">
import { h } from 'vue'
import { Timeline, Divider, Tag } from '@tigercat/vue'

// Basic timeline data
const basicEvents = [
  { key: 1, label: '2024-01-01', content: '创建项目' },
  { key: 2, label: '2024-01-05', content: '编写文档' },
  { key: 3, label: '2024-01-10', content: '发布版本 1.0' },
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
  },
]

// Project timeline with custom rendering
const projectTimeline = [
  {
    key: 1,
    date: '2024-01-01 09:00',
    title: '项目启动会议',
    description: '团队会议和项目计划',
    status: 'completed',
    color: '#10b981',
  },
  {
    key: 2,
    date: '2024-01-05 14:30',
    title: '设计评审',
    description: 'UI/UX 设计展示和反馈',
    status: 'completed',
    color: '#10b981',
  },
  {
    key: 3,
    date: '2024-01-10 10:00',
    title: '开发冲刺 1',
    description: '实现核心功能',
    status: 'in-progress',
    color: '#3b82f6',
  },
  {
    key: 4,
    date: '2024-01-20',
    title: '测试阶段',
    description: 'QA 测试和 Bug 修复',
    status: 'pending',
    color: '#6b7280',
  },
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
  },
]

const renderDotEvents = [
  { key: 1, label: '2024-01-01', content: '已完成' },
  { key: 2, label: '2024-01-05', content: '进行中' },
  { key: 3, label: '2024-01-10', content: '待处理' },
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
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Timeline 时间线</h1>
      <p class="text-gray-600">垂直展示时间流信息的时间线组件，支持多种模式与自定义渲染。</p>
    </div>

    <section id="basic" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基本用法</h2>
      <p class="text-gray-600 mb-6">通过 items 提供数据源即可渲染时间线。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="basicEvents" />
      </div>
      <Divider class="my-6" />
    </section>

    <section id="mode" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">展示模式</h2>
      <p class="text-gray-600 mb-6">支持 left/right/alternate 三种展示模式。</p>
      <div class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="text-lg font-semibold mb-4">左侧时间线（默认）</div>
          <Timeline :items="basicEvents" mode="left" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="text-lg font-semibold mb-4">右侧时间线</div>
          <Timeline :items="basicEvents" mode="right" />
        </div>
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="text-lg font-semibold mb-4">交替展示</div>
          <Timeline :items="basicEvents" mode="alternate" />
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <section id="color" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义颜色</h2>
      <p class="text-gray-600 mb-6">通过 item.color 设置时间点颜色。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="coloredEvents" />
      </div>
      <Divider class="my-6" />
    </section>

    <section id="dot" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义节点（dot）</h2>
      <p class="text-gray-600 mb-6">通过 item.dot 为单个节点提供自定义内容。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="customDotEvents" />
      </div>
      <Divider class="my-6" />
    </section>

    <section id="render-dot" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义节点（dot 插槽）</h2>
      <p class="text-gray-600 mb-6">通过 #dot 插槽统一控制节点渲染。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="renderDotEvents">
          <template #dot="{ item }">
            <div
              v-if="item.key === 1"
              class="w-4 h-4 bg-green-500 rounded-full"
            />
            <div
              v-else-if="item.key === 2"
              class="w-4 h-4 bg-blue-500 rounded-full animate-pulse"
            />
            <div v-else class="w-4 h-4 bg-gray-300 rounded-full" />
          </template>
        </Timeline>
      </div>
      <Divider class="my-6" />
    </section>

    <section id="render-item" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">自定义内容（item 插槽）</h2>
      <p class="text-gray-600 mb-6">通过 #item 插槽自定义每个时间线项的内容区域。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="projectTimeline">
          <template #item="{ item }">
            <div class="mb-2">
              <span class="text-sm text-gray-500">{{ item.date }}</span>
            </div>
            <div class="font-medium text-gray-900 mb-1">
              {{ item.title }}
              <Tag :variant="getStatusVariant(item.status)" size="sm" class="ml-2">
                {{ item.status }}
              </Tag>
            </div>
            <div class="text-gray-600">{{ item.description }}</div>
          </template>
        </Timeline>
      </div>
      <Divider class="my-6" />
    </section>

    <section id="pending" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">等待中状态</h2>
      <p class="text-gray-600 mb-6">通过 pending/pendingDot/#pending 展示“处理中”状态。</p>
      <div class="space-y-6">
        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="text-lg font-semibold mb-4">默认等待内容</div>
          <Timeline :items="basicEvents" :pending="true" />
        </div>

        <div class="p-6 bg-gray-50 rounded-lg">
          <div class="text-lg font-semibold mb-4">自定义等待节点与内容</div>
          <Timeline :items="basicEvents" :pending="true">
            <template #dot="{ item }">
              <div
                v-if="item.key == null"
                class="w-4 h-4 bg-[var(--tiger-primary,#2563eb)] rounded-full animate-pulse"
              />
              <div v-else class="w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--tiger-primary,#2563eb)]" />
            </template>
            <template #pending>
              <div class="flex items-center gap-2 text-blue-600">
                <svg
                  class="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>正在处理...</span>
              </div>
            </template>
          </Timeline>
        </div>
      </div>
      <Divider class="my-6" />
    </section>

    <section id="reverse" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">反转顺序</h2>
      <p class="text-gray-600 mb-6">通过 reverse 反转时间线顺序。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Timeline :items="basicEvents" :reverse="true" />
      </div>
      <Divider class="my-6" />
    </section>

    <section id="example" class="mb-12">
      <h2 class="text-2xl font-bold mb-4">完整示例</h2>
      <p class="text-gray-600 mb-6">组合 mode + item 插槽 + color 展示一个“项目时间线”。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="max-w-2xl">
          <Timeline :items="projectTimeline" mode="alternate">
            <template #item="{ item }">
              <div class="mb-2">
                <span class="text-sm text-gray-500">{{ item.date }}</span>
              </div>
              <div class="font-medium text-gray-900 mb-1">
                {{ item.title }}
                <Tag :variant="getStatusVariant(item.status)" size="sm" class="ml-2">
                  {{ item.status }}
                </Tag>
              </div>
              <div class="text-gray-600">{{ item.description }}</div>
            </template>
          </Timeline>
        </div>
      </div>
    </section>
  </div>
</template>
