<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from '@expcat/tigercat-vue'
import type { UploadRequestOptions } from '@expcat/tigercat-core'
import { Upload } from '@expcat/tigercat-vue/Upload'

const files = ref<UploadFile[]>([])

const upload = (options: UploadRequestOptions) => {
  window.setTimeout(() => {
    options.onProgress?.(100)
    options.onSuccess?.({ name: options.file.name })
  }, 600)
}
</script>

<template>
  <Upload v-model:file-list="files" :custom-request="upload">使用自定义请求上传</Upload>
</template>
