<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
      <MarkdownEditor v-model:value="content" :height="360" />
    </section>
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">模式切换</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <MarkdownEditor :value="readOnlyMarkdown" mode="preview" :height="220" read-only />
        <MarkdownEditor :default-value="readOnlyMarkdown" default-mode="edit" :height="220" />
      </div>
    </section>
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展渲染器</h3>
      <MarkdownEditor :value="content" :renderer="renderer" mode="preview" :height="180" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MarkdownEditor } from '@expcat/tigercat-vue/MarkdownEditor'

const content = ref(`# Release notes

Tigercat now supports **Markdown editing** with live preview.`)

const readOnlyMarkdown = `## Component brief

Use split mode while drafting, then switch to preview before publishing.`

const renderer = {
  render(markdown: string) {
    return `<p><strong>Custom renderer:</strong> ${markdown.split('\n')[0]}</p>`
  }
}
</script>
