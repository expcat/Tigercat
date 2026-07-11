<script setup lang="ts">
import { Image } from '@expcat/tigercat-vue/Image'
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'

const photos = [
  'https://picsum.photos/seed/tiger-group-1/600/400',
  'https://picsum.photos/seed/tiger-group-2/600/400',
  'https://picsum.photos/seed/tiger-group-3/600/400'
]
</script>

<template>
  <ImageGroup>
    <div class="flex flex-wrap gap-3">
      <Image
        v-for="(src, index) in photos"
        :key="src"
        :src="src"
        :alt="`组图 ${index + 1}`"
        :width="120"
        :height="80" />
    </div>
  </ImageGroup>
</template>
