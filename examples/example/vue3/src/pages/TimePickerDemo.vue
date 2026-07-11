<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TimePickerDemo
const modules = getDemoModules('timepicker')
</script>

<template>
  <DemoPage title="TimePicker 时间选择器" description="用于选择或输入时间。" :modules="modules" />
</template>
