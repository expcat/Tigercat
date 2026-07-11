<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'

const code = ref("function greet(name) {\n  return 'Hello, ' + name\n}")
</script>

<template>
  <CodeEditor
    v-model:value="code"
    language="javascript"
    theme="dark"
    :tab-size="2"
    word-wrap
    :min-lines="6"
    :max-lines="12" />
</template>
