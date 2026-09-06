<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'
import type { CodeHighlighter } from '@expcat/tigercat-core'

const json = `{ "ok": true, "count": 2 }`

const highlighter: CodeHighlighter = {
  name: 'demo',
  highlightCode(code, language) {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<span data-language="${language}">${escaped}</span>`
  }
}
</script>

<template>
  <Code :code="json" language="json" :highlighter="highlighter" />
</template>
