<script setup lang="ts">
import { ref } from 'vue'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'

const images = [
  'https://picsum.photos/seed/tiger-controlled-viewer-1/800/600',
  'https://picsum.photos/seed/tiger-controlled-viewer-2/800/600',
  'https://picsum.photos/seed/tiger-controlled-viewer-3/800/600'
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
}

const handleCurrentIndexChange = (nextIndex: number) => {
  currentIndex.value = nextIndex
  status.value = `已切换到第 ${nextIndex + 1} 张图片`
}

const handleClose = () => {
  status.value = `查看器已从第 ${currentIndex.value + 1} 张图片关闭`
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2" role="group" aria-label="选择要查看的图片">
      <button
        v-for="(_, index) in images"
        :key="index"
        type="button"
        class="rounded px-3 py-1.5 text-sm"
        :class="
          currentIndex === index
            ? 'bg-blue-600 text-white'
            : 'border border-gray-300 dark:border-gray-600'
        "
        :aria-pressed="currentIndex === index"
        @click="openImage(index)">
        打开图片 {{ index + 1 }}
      </button>
    </div>

    <p class="text-sm text-gray-500" aria-live="polite">
      {{ status }}；缩放范围 0.75×–2×，遮罩点击不会关闭。
    </p>

    <ImageViewer
      :images="images"
      :open="open"
      :current-index="currentIndex"
      :min-zoom="0.75"
      :max-zoom="2"
      :mask-closable="false"
      @update:open="handleOpenChange"
      @update:current-index="handleCurrentIndexChange"
      @close="handleClose" />
  </div>
</template>
