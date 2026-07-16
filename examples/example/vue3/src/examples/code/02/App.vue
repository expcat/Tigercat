<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'

const snippet = `function sum(a, b) {
  return a + b
}

sum(2, 3) // 5`
</script>

<template>
  <div class="space-y-4">
    <Code :code="snippet" copy-label="复制" />
    <Code code="npm i @expcat/tigercat-vue" :copyable="false" />
  </div>
</template>
