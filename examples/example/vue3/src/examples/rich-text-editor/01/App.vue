<script setup lang="ts">
import { ref } from 'vue'
import { RichTextEditor } from '@expcat/tigercat-vue/RichTextEditor'

const content = ref('<p>Hello <strong>Tigercat</strong>!</p>')
</script>

<template>
  <RichTextEditor v-model:value="content" :height="260" placeholder="在这里编辑富文本..." />
</template>
