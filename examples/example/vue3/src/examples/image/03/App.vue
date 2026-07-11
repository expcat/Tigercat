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
    <div class="flex gap-4 items-start">
      <div class="text-center">
        <Image
          src="/broken.jpg"
          :fallback-src="PHOTOS[0]"
          :width="150"
          :height="100"
          alt="回退示例"
          :preview="false" />
        <p class="text-xs text-gray-500 mt-1">fallbackSrc 回退</p>
      </div>
      <div class="text-center">
        <Image src="/broken.jpg" :width="150" :height="100" alt="错误插槽" :preview="false">
          <template #error>
            <div
              class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 text-sm rounded">
              加载失败
            </div>
          </template>
        </Image>
        <p class="text-xs text-gray-500 mt-1">错误插槽</p>
      </div>
    </div>
  </div>
</template>
