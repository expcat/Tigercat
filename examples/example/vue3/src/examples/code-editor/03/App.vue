<script setup lang="ts">
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'
import { builtinCodeHighlighter } from '@expcat/tigercat-core'

const jsCode = `const release = { version: '2.2.0', ready: true }`
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm text-[var(--tiger-text-secondary)]">
      highlighter 返回 token，由编辑器画成文本。这里显式传入内置引擎。
    </p>
    <CodeEditor
      :model-value="jsCode"
      language="javascript"
      :highlighter="builtinCodeHighlighter"
      :min-lines="4"
      :max-lines="8"
      read-only />
  </div>
</template>
