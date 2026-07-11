<script setup lang="ts">
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
import { ref } from 'vue'
import { Image } from '@expcat/tigercat-vue/Image'

const PHOTOS = [
  'https://picsum.photos/seed/tiger1/600/400',
  'https://picsum.photos/seed/tiger2/600/400',
  'https://picsum.photos/seed/tiger3/600/400',
  'https://picsum.photos/seed/tiger4/600/400',
  'https://picsum.photos/seed/tiger5/600/400',
  'https://picsum.photos/seed/tiger6/600/400'
]

const previewOpen = ref(false)
</script>

<template>
  <div class="min-w-0">
    <div class="flex gap-4 flex-wrap">
      <Image :src="PHOTOS[0]" alt="示例图片" :width="200" :height="150" :preview="false" />
      <Image :src="PHOTOS[1]" alt="示例图片 2" :width="200" :height="150" :preview="false" />
    </div>
  </div>
</template>
