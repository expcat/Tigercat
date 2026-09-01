<script setup lang="ts">
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'

const jsCode = `const release = {
  version: '2.0.4',
  ready: true
}`

const htmlCode = `<div class="card">
  <h1>Release</h1>
</div>`
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <section class="space-y-2">
      <h3 class="text-sm font-medium">只读代码</h3>
      <p class="text-xs text-gray-500">可以选择和复制。Tab 会离开焦点，不会改只读内容。</p>
      <CodeEditor
        :model-value="jsCode"
        language="javascript"
        :min-lines="6"
        :max-lines="8"
        read-only />
    </section>

    <section class="space-y-2">
      <h3 class="text-sm font-medium">HTML 高亮</h3>
      <p class="text-xs text-gray-500">禁用状态不接受聚焦或输入。</p>
      <CodeEditor :model-value="htmlCode" language="html" :min-lines="6" :max-lines="8" disabled />
    </section>
  </div>
</template>
