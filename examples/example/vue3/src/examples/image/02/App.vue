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
      <div
        v-for="mode in ['contain', 'cover', 'fill', 'none', 'scale-down'] as const"
        :key="mode"
        class="text-center">
        <Image
          :src="PHOTOS[0]"
          :alt="mode"
          :width="120"
          :height="120"
          :fit="mode"
          :preview="false"
          class="border border-gray-200 rounded" />
        <p class="text-xs text-gray-500 mt-1">{{ mode }}</p>
      </div>
    </div>
  </div>
</template>
