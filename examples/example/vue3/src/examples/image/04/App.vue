<script setup lang="ts">
import { Image } from '@expcat/tigercat-vue/Image'
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'

const photos = [
  'https://picsum.photos/seed/tiger-group-1/600/400',
  'https://picsum.photos/seed/tiger-group-2/600/400',
  'https://picsum.photos/seed/tiger-group-1/600/400'
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <ImageGroup class="flex flex-wrap gap-3" aria-label="风景组图">
      <Image
        v-for="(src, index) in photos"
        :key="`${src}-${index}`"
        :src="src"
        :alt="`组图 ${index + 1}`"
        :width="120"
        :height="80" />
    </ImageGroup>
    <ImageGroup :preview="false" class="flex flex-wrap gap-3" aria-label="仅展示">
      <Image
        src="https://picsum.photos/seed/tiger-group-3/600/400"
        alt="不可预览"
        :width="120"
        :height="80" />
    </ImageGroup>
  </div>
</template>
