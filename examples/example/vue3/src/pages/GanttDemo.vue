<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">Gantt 甘特图</h1>
    <p class="text-gray-500 mb-8">用 SVG 时间轴展示任务排期、进度和依赖关系。</p>

    <DemoBlock
      title="基础用法"
      description="任务条、进度条与依赖线自动按时间范围布局。"
      :code="basicSnippet">
      <div class="space-y-4">
        <Gantt
          :data="releaseTasks"
          :width="820"
          :height="320"
          min-date="2026-01-01"
          max-date="2026-02-20"
          hoverable
          selectable
          :selected-id="selectedId"
          title="Release plan"
          desc="Feature delivery timeline"
          @update:selected-id="selectedId = $event" />
        <div class="rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          当前选择：{{ selectedId ?? '未选择' }}
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="月份刻度" description="scale='month' 适合跨月项目排期。" :code="monthSnippet">
      <Gantt
        :data="releaseTasks"
        :width="820"
        :height="320"
        scale="month"
        min-date="2026-01-01"
        max-date="2026-03-01"
        :date-formatter="monthFormatter"
        :show-dependencies="false" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Gantt } from '@expcat/tigercat-vue/Gantt'
import type { GanttTask } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const selectedId = ref<string | number | null>(null)

const releaseTasks: GanttTask[] = [
  {
    id: 'research',
    label: '需求调研',
    start: '2026-01-01',
    end: '2026-01-07',
    progress: 100,
    color: '#2563eb'
  },
  {
    id: 'design',
    label: '交互设计',
    start: '2026-01-06',
    end: '2026-01-15',
    progress: 75,
    dependencies: ['research'],
    color: '#10b981'
  },
  {
    id: 'build',
    label: '功能开发',
    start: '2026-01-13',
    end: '2026-02-05',
    progress: 45,
    dependencies: ['design'],
    color: '#f59e0b'
  },
  {
    id: 'qa',
    label: '测试验收',
    start: '2026-02-03',
    end: '2026-02-14',
    progress: 20,
    dependencies: ['build'],
    color: '#8b5cf6'
  }
]

const monthFormatter = (date: Date) => `${date.getMonth() + 1}月`

const basicSnippet = `const tasks = [
  { id: 'research', label: '需求调研', start: '2026-01-01', end: '2026-01-07', progress: 100 },
  { id: 'design', label: '交互设计', start: '2026-01-06', end: '2026-01-15', dependencies: ['research'] }
]

<Gantt :data="tasks" :width="760" :height="320" hoverable selectable />`

const monthSnippet = `<Gantt
  :data="tasks"
  scale="month"
  min-date="2026-01-01"
  max-date="2026-03-01"
  :date-formatter="monthFormatter" />`
</script>
