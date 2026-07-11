<script setup lang="ts">
import { ref } from 'vue'
import type { UploadFile } from '@expcat/tigercat-vue'
import { Upload } from '@expcat/tigercat-vue/Upload'

const files = ref<UploadFile[]>([
  {
    uid: 'cover',
    name: 'cover.png',
    status: 'success',
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=240&h=160&fit=crop'
  }
])
</script>

<template>
  <Upload v-model:file-list="files" list-type="picture-card" accept="image/*" :limit="4">
    添加图片
  </Upload>
</template>
