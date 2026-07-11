<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from '@expcat/tigercat-vue'
import { Upload } from '@expcat/tigercat-vue/Upload'

const files = ref<UploadFile[]>([])
</script>

<template>
  <Upload v-model:file-list="files" drag multiple accept=".pdf,.doc,.docx">
    点击或拖拽文档到此处
  </Upload>
</template>
