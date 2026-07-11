<script setup lang="ts">
import { computed, ref } from 'vue'
import { Gantt } from '@expcat/tigercat-vue/Gantt'
import type { GanttTask } from '@expcat/tigercat-core'

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

const selectedTask = computed(() => releaseTasks.find((task) => task.id === selectedId.value))

const monthFormatter = (date: Date) => `${date.getMonth() + 1}月`
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          任务条、进度条与依赖线自动按时间范围布局。
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          移动端可在预览区域横向滚动，查看完整时间轴。
        </p>
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
            当前选择：{{
              selectedTask ? `${selectedTask.label}（${String(selectedTask.id)}）` : '未选择'
            }}
          </div>
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">月份刻度</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">scale='month' 适合跨月项目排期。</p>
        <Gantt
          :data="releaseTasks"
          :width="820"
          :height="320"
          scale="month"
          min-date="2026-01-01"
          max-date="2026-03-01"
          :date-formatter="monthFormatter"
          :show-dependencies="false" />
      </section>
    </div>
  </div>
</template>
