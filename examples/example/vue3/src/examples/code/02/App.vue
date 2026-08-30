<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'

const snippet = `function sum(a, b) {
  return a + b
}

sum(2, 3) // 5`
</script>

<template>
  <div class="space-y-4">
    <Code
      :code="snippet"
      :labels="{
        copyLabel: 'Copy snippet',
        copiedLabel: 'Copied',
        copyFailedLabel: 'Copy failed'
      }" />
    <Code code="npm i @expcat/tigercat-vue" :copyable="false" />
  </div>
</template>
