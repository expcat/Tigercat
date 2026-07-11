<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// RichTextEditorDemo
const modules = getDemoModules('rich-text-editor')
</script>

<template>
  <DemoPage
    title="RichTextEditor 富文本编辑器"
    description="所见即所得的富文本编辑器，带工具栏。"
    :modules="modules" />
</template>
