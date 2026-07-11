<script setup lang="ts">
import { ref } from 'vue'

const fullPageSnippet = `const greeting = 'Hello Tigercat'`
import { Code } from '@expcat/tigercat-vue/Code'

const lastCopied = ref('')
const handleCopy = (code: string) => {
  lastCopied.value = code
}
</script>

<template>
  <div class="min-w-0">
    <Code :code="fullPageSnippet" @copy="handleCopy" />
    <p v-if="lastCopied" class="mt-2 text-sm text-gray-500">上次复制: {{ lastCopied }}</p>
  </div>
</template>
