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
    <button
      class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      @click="previewOpen = true">
      打开预览</button
    ><ImagePreview v-model:open="previewOpen" :images="PHOTOS" :current-index="0" />
  </div>
</template>
