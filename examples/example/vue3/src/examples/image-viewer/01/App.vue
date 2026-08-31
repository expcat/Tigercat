<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'

const open = ref(false)
const images = [
  { src: 'https://picsum.photos/seed/tiger-viewer-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-viewer-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-viewer-3/800/600', alt: '山脊云雾' }
]
</script>

<template>
  <Button @click="open = true">查看图片</Button>
  <ImageViewer v-model:open="open" :images="images" :current-index="1" :show-nav="false" />
</template>
