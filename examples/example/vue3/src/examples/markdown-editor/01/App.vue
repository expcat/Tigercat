<script setup lang="ts">
import { ref } from 'vue'
import { MarkdownEditor } from '@expcat/tigercat-vue/MarkdownEditor'

const initialMarkdown = `# Release notes

Tigercat now supports **Markdown editing** with live preview.

- Edit content
- Switch preview modes
- Extend rendering

| Area | Status |
| --- | --- |
| Vue | Ready |
| React | Ready |`

const readOnlyMarkdown = `## Component brief

Use split mode while drafting, then switch to preview before publishing.

> Custom renderers are sanitized before preview output.`

const content = ref(initialMarkdown)

const renderer = {
  render(markdown: string) {
    return `<p><strong>Custom renderer:</strong> ${markdown.split('\n')[0]}</p>`
  }
}
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-6">
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">v-model:value 绑定 Markdown</p>
        <MarkdownEditor v-model:value="content" :height="360" placeholder="Write markdown..." />
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">模式切换</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">edit / split / preview</p>
        <div class="grid gap-4 md:grid-cols-2">
          <MarkdownEditor :value="readOnlyMarkdown" mode="preview" :height="220" read-only />
          <MarkdownEditor :default-value="readOnlyMarkdown" default-mode="edit" :height="220" />
        </div>
      </section>
      <section class="space-y-3">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">扩展渲染器</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          renderer 接管预览 HTML，组件仍会清理危险内容
        </p>
        <MarkdownEditor :value="content" :renderer="renderer" mode="preview" :height="180" />
      </section>
    </div>
  </div>
</template>
