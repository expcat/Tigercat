<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">RichTextEditor 富文本编辑器</h1>
    <p class="text-gray-500 mb-8">所见即所得的富文本编辑器，带工具栏。</p>

    <DemoBlock title="基础用法" description="v-model 绑定 HTML 内容" :code="basicSnippet">
      <RichTextEditor v-model:value="content" :height="250" placeholder="在这里编辑..." />
    </DemoBlock>

    <DemoBlock title="只读 & 禁用" :code="readOnlySnippet">
      <div class="flex gap-4">
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-2">只读</p>
          <RichTextEditor :value="sampleHtml" :height="150" read-only />
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-500 mb-2">禁用</p>
          <RichTextEditor :value="sampleHtml" :height="150" disabled />
        </div>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RichTextEditor } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const content = ref('<p>Hello <strong>Tigercat</strong>!</p>')
const sampleHtml = '<p>这是一段<em>只读</em>的富文本内容。</p>'

const basicSnippet = `<RichTextEditor v-model:value="content" :height="250" placeholder="在这里编辑..." />`

const readOnlySnippet = `<RichTextEditor :value="html" :height="150" read-only />
<RichTextEditor :value="html" :height="150" disabled />`
</script>
