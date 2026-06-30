<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">MarkdownEditor Markdown 编辑器</h1>
    <p class="text-gray-500 mb-8">支持编辑、分屏预览、工具栏插入和自定义预览渲染。</p>

    <DemoBlock title="基础用法" description="v-model:value 绑定 Markdown" :code="fullPageSnippet">
      <MarkdownEditor v-model:value="content" :height="360" placeholder="Write markdown..." />
    </DemoBlock>

    <DemoBlock title="模式切换" description="edit / split / preview" :code="fullPageSnippet">
      <div class="grid gap-4 md:grid-cols-2">
        <MarkdownEditor :value="readOnlyMarkdown" mode="preview" :height="220" read-only />
        <MarkdownEditor :default-value="readOnlyMarkdown" default-mode="edit" :height="220" />
      </div>
    </DemoBlock>

    <DemoBlock
      title="扩展渲染器"
      description="renderer 接管预览 HTML，组件仍会清理危险内容"
      :code="fullPageSnippet">
      <MarkdownEditor :value="content" :renderer="renderer" mode="preview" :height="180" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MarkdownEditor } from '@expcat/tigercat-vue/MarkdownEditor'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './MarkdownEditorDemo.vue?raw'

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

const basicSnippet = `<MarkdownEditor v-model:value="content" :height="360" placeholder="Write markdown..." />`

const scriptSnippet = `import { ref } from 'vue'

const content = ref(initialMarkdown)`

const modeSnippet = `<MarkdownEditor :value="markdown" mode="preview" :height="220" read-only />
<MarkdownEditor :default-value="markdown" default-mode="edit" :height="220" />`

const rendererSnippet = `<MarkdownEditor :value="content" :renderer="renderer" mode="preview" :height="180" />`
</script>
