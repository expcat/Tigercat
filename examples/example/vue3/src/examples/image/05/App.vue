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
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 flex-wrap">
        <Image
          v-for="(src, i) in PHOTOS.slice(0, 4)"
          :key="i"
          :src="src"
          :width="120"
          :height="80"
          alt="点击预览" />
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">悬停预览：</span>
        <Image :src="PHOTOS[0]" :width="120" :height="80" preview-trigger="hover" alt="悬停预览" />
      </div>
    </div>
  </div>
</template>
