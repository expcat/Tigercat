<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// ButtonDemo
const modules = getDemoModules('button')
</script>

<template>
  <DemoPage title="Button 按钮" description="按钮用于触发一个操作。" :modules="modules" />
</template>
