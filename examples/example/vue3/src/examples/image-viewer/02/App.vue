<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'

const images = [
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-1/800/600', alt: '林间小径' },
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-2/800/600', alt: '湖面倒影' },
  { src: 'https://picsum.photos/seed/tiger-controlled-viewer-3/800/600', alt: '山脊云雾' }
]

const open = ref(false)
const currentIndex = ref(0)
const status = ref('选择一张图片打开查看器')

const openImage = (index: number) => {
  currentIndex.value = index
  open.value = true
  status.value = `已打开第 ${index + 1} 张图片`
}

const handleOpenChange = (nextOpen: boolean) => {
  open.value = nextOpen
  if (!nextOpen) {
    status.value = `查看器已从第 ${currentIndex.value + 1} 张图片关闭`
  }
}

const handleCurrentIndexChange = (nextIndex: number) => {
  currentIndex.value = nextIndex
  status.value = `已切换到第 ${nextIndex + 1} 张图片`
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2" role="group" aria-label="选择要查看的图片">
      <Button
        v-for="(image, index) in images"
        :key="image.src"
        size="sm"
        :variant="currentIndex === index ? 'primary' : 'secondary'"
        @click="openImage(index)">
        打开 {{ image.alt }}
      </Button>
    </div>

    <p class="text-sm text-[var(--tiger-text-secondary,#6b7280)]" aria-live="polite">
      {{ status }}；缩放范围 0.75×–2×，遮罩点击不会关闭。切图后缩放回到 1。
    </p>

    <ImageViewer
      :images="images"
      :open="open"
      :current-index="currentIndex"
      :min-zoom="0.75"
      :max-zoom="2"
      :mask-closable="false"
      @update:open="handleOpenChange"
      @update:current-index="handleCurrentIndexChange" />
  </div>
</template>
