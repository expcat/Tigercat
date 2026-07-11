<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// CheckboxDemo
const modules = getDemoModules('checkbox')
</script>

<template>
  <DemoPage title="Checkbox 多选框" description="在一组可选项中进行多项选择。" :modules="modules" />
</template>
