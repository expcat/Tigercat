<script setup lang="ts">
import { Gallery } from '@expcat/tigercat-vue/Gallery'

const items = [
  { src: 'https://picsum.photos/seed/gallery-1/640/400', alt: '林间' },
  { src: 'https://picsum.photos/seed/gallery-2/640/400', alt: '湖面' },
  { src: 'https://picsum.photos/seed/gallery-3/640/400', alt: '山脊' }
]
</script>

<template>
  <Gallery :items="items" />
</template>
