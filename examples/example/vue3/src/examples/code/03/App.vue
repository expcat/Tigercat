<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'
import type { CodeHighlighter } from '@expcat/tigercat-core'

const json = `{ "ok": true, "count": 2 }`

const highlighter: CodeHighlighter = {
  name: 'demo',
  highlightCode(code, language) {
    return code.split('\n').map((line) => [{ text: line, className: `lang-${language}` }])
  }
}
</script>

<template>
  <Code :code="json" language="json" :highlighter="highlighter" />
</template>
