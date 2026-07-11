<script setup lang="ts">
import DemoPage from '../components/DemoPage.vue'
import { getDemoModules } from '../playground/registry'

// MarkdownEditorDemo
const modules = getDemoModules('markdown-editor')
</script>

<template>
  <DemoPage
    title="MarkdownEditor Markdown 编辑器"
    description="支持编辑、分屏预览、工具栏插入和自定义预览渲染。"
    :modules="modules" />
</template>
