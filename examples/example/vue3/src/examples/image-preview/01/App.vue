<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'

const open = ref(false)
const images = [
  { src: 'https://picsum.photos/seed/tiger-preview-nav-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-preview-nav-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-preview-nav-3/800/600', alt: '山脊云雾' }
]
</script>

<template>
  <Button @click="open = true">查看图片</Button>
  <ImagePreview v-model:open="open" :images="images" :current-index="1" :show-nav="false" />
</template>
