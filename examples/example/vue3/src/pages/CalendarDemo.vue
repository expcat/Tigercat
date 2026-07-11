<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CalendarDemo
const modules = getDemoModules('calendar')
</script>

<template>
  <DemoPage
    title="Calendar 日历"
    description="按月/年展示日期的日历面板，支持日期选择和禁用。"
    :modules="modules" />
</template>
