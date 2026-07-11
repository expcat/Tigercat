<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from '@expcat/tigercat-vue'
import { Upload } from '@expcat/tigercat-vue/Upload'

const files = ref<UploadFile[]>([])
</script>

<template>
  <Upload
    v-model:file-list="files"
    accept=".jpg,.jpeg,.png"
    :max-size="2 * 1024 * 1024"
    :limit="3"
    multiple>
    选择图片
  </Upload>
</template>
