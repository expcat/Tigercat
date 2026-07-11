<script setup lang="ts">
import { Gantt } from '@expcat/tigercat-vue/Gantt'
import type { GanttTask } from '@expcat/tigercat-core'

const tasks: GanttTask[] = [
  { id: 'research', label: '需求调研', start: '2026-01-01', end: '2026-01-07', progress: 100 },
  {
    id: 'design',
    label: '交互设计',
    start: '2026-01-06',
    end: '2026-01-15',
    progress: 75,
    dependencies: ['research']
  },
  {
    id: 'build',
    label: '功能开发',
    start: '2026-01-13',
    end: '2026-02-05',
    progress: 45,
    dependencies: ['design']
  }
]
const formatMonth = (date: Date) => `${date.getMonth() + 1}月`
</script>

<template>
  <Gantt
    :data="tasks"
    :width="820"
    :height="280"
    scale="month"
    min-date="2026-01-01"
    max-date="2026-03-01"
    :date-formatter="formatMonth"
    hoverable
    selectable
    title="Release plan"
    desc="Feature delivery timeline" />
</template>
