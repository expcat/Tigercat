<script setup lang="ts">
import { ref } from 'vue'
import { MarkdownEditor } from '@expcat/tigercat-vue/MarkdownEditor'

const content = ref('# Release notes\n\nTigercat supports **Markdown editing** with live preview.')
</script>

<template>
  <MarkdownEditor
    v-model:value="content"
    default-mode="split"
    :height="320"
    placeholder="Write markdown..." />
</template>
