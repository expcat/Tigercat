<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// DatePickerDemo
const modules = getDemoModules('datepicker')
</script>

<template>
  <DemoPage title="DatePicker 日期选择器" description="用于选择或输入日期。" :modules="modules" />
</template>
