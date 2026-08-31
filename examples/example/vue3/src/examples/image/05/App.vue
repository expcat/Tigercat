<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'

const open = ref(false)
const photos = [
  { src: 'https://picsum.photos/seed/tiger-preview-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-preview-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-preview-3/800/600', alt: '山脊云雾' }
]
</script>

<template>
  <Button @click="open = true">打开图片预览</Button>
  <ImagePreview v-model:open="open" :images="photos" :current-index="1" />
</template>
