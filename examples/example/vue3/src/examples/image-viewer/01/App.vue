<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'

const open = ref(false)
const images = [
  'https://picsum.photos/seed/tiger-viewer-1/800/600',
  'https://picsum.photos/seed/tiger-viewer-2/800/600',
  'https://picsum.photos/seed/tiger-viewer-3/800/600'
]
</script>

<template>
  <Button @click="open = true">查看图片</Button>
  <ImageViewer
    v-model:open="open"
    :images="images"
    :current-index="1"
    :zoomable="true"
    :rotatable="true"
    :show-nav="true"
    :show-counter="true" />
</template>
