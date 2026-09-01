<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'

const code = ref("function greet(name) {\n  return 'Hello, ' + name\n}")
</script>

<template>
  <CodeEditor v-model="code" />
</template>
