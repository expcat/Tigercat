<script setup lang="ts">
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'

const code = `const release = {
  version: '2.0.4',
  ready: true
}`
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <section class="space-y-2">
      <h3 class="text-sm font-medium">只读代码</h3>
      <p class="text-xs text-gray-500">可以选择和复制内容，但不能修改。</p>
      <CodeEditor :value="code" language="javascript" :min-lines="6" :max-lines="8" read-only />
    </section>

    <section class="space-y-2">
      <h3 class="text-sm font-medium">禁用编辑器</h3>
      <p class="text-xs text-gray-500">禁用状态不接受聚焦或输入。</p>
      <CodeEditor
        :value="code"
        language="javascript"
        theme="dark"
        :min-lines="6"
        :max-lines="8"
        disabled />
    </section>
  </div>
</template>
