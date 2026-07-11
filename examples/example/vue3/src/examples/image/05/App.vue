<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'

const open = ref(false)
const photos = [
  'https://picsum.photos/seed/tiger-preview-1/800/600',
  'https://picsum.photos/seed/tiger-preview-2/800/600',
  'https://picsum.photos/seed/tiger-preview-3/800/600'
]
</script>

<template>
  <Button @click="open = true">打开图片预览</Button>
  <ImagePreview v-model:open="open" :images="photos" :current-index="1" />
</template>
