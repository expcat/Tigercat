<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// TextareaDemo
const modules = getDemoModules('textarea')
</script>

<template>
  <DemoPage title="Textarea 文本域" description="输入多行文本时使用。" :modules="modules" />
</template>
