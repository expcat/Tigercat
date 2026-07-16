<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'

const snippet = `const greeting = 'Hello Tigercat'`
</script>

<template>
  <Code :code="snippet" copy-label="复制代码" />
</template>
