<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'

const open = ref(true)
const images = [
  { src: 'https://picsum.photos/seed/tiger-flip-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-flip-2/800/600', alt: '湖面倒影' }
]
</script>

<template>
  <Button @click="open = true">打开预览</Button>
  <ImagePreview v-model:open="open" :images="images" />
</template>
