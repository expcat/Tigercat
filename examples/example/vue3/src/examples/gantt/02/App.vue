<script setup lang="ts">
import { ref } from 'vue'
import { Gantt } from '@expcat/tigercat-vue/Gantt'
import type { GanttScale, GanttTask } from '@expcat/tigercat-core'

const tasks: GanttTask[] = [
  { id: 'research', label: '需求调研', start: '2026-01-02', end: '2026-01-08', progress: 100 },
  {
    id: 'design',
    label: '交互设计',
    start: '2026-01-07',
    end: '2026-01-16',
    progress: 80,
    dependencies: ['research']
  },
  {
    id: 'build',
    label: '功能开发',
    start: '2026-01-14',
    end: '2026-01-27',
    progress: 45,
    dependencies: ['design']
  }
]

const scaleOptions: Array<{ value: GanttScale; label: string }> = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' }
]

const scale = ref<GanttScale>('week')
const selectedId = ref<string | number | null>('design')
const selectionStatus = ref('已选择：交互设计')

const formatDate = (date: Date, currentScale: GanttScale) => {
  if (currentScale === 'month') return `${date.getMonth() + 1}月`
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const handleSelectedIdChange = (nextId: string | number | null) => {
  selectedId.value = nextId
  const selectedTask = tasks.find((task) => task.id === nextId)
  selectionStatus.value = selectedTask ? `已选择：${selectedTask.label}` : '已清除选择'
}
</script>

<template>
  <div class="space-y-4 overflow-x-auto">
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex gap-2" role="group" aria-label="甘特图时间刻度">
        <button
          v-for="option in scaleOptions"
          :key="option.value"
          type="button"
          class="rounded px-3 py-1.5 text-sm"
          :class="
            scale === option.value
              ? 'bg-blue-600 text-white'
              : 'border border-gray-300 dark:border-gray-600'
          "
          :aria-pressed="scale === option.value"
          @click="scale = option.value">
          {{ option.label }}
        </button>
      </div>
      <span class="text-sm text-gray-500" aria-live="polite">{{ selectionStatus }}</span>
    </div>

    <Gantt
      :data="tasks"
      :width="860"
      :height="280"
      :scale="scale"
      min-date="2026-01-01"
      max-date="2026-02-01"
      :date-formatter="formatDate"
      selectable
      :selected-id="selectedId"
      title="R34 delivery plan"
      desc="Switchable time scale with controlled task selection"
      @update:selected-id="handleSelectedIdChange" />
  </div>
</template>
