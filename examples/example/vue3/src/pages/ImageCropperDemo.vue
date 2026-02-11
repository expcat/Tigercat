<script setup lang="ts">
import { ref } from 'vue'
import { ImageCropper } from '@expcat/tigercat-vue'
import type { CropRect, CropResult } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const PHOTO = 'https://picsum.photos/seed/cropper/800/600'

const cropperRef = ref()
const cropperSquareRef = ref()
const resultUrl = ref('')
const squareResultUrl = ref('')
const cropRect = ref<CropRect | null>(null)

const handleCrop = async () => {
  const result: CropResult = await cropperRef.value.getCropResult()
  resultUrl.value = result.dataUrl
}

const handleSquareCrop = async () => {
  const result: CropResult = await cropperSquareRef.value.getCropResult()
  squareResultUrl.value = result.dataUrl
}

const basicSnippet = `<ImageCropper
  ref="cropperRef"
  :src="photo"
  @crop-change="(rect) => (cropRect = rect)" />
<button @click="handleCrop">裁剪</button>
<img v-if="resultUrl" :src="resultUrl" />`

const aspectRatioSnippet = `<!-- 1:1 正方形裁剪 -->
<ImageCropper
  ref="cropperSquareRef"
  :src="photo"
  :aspect-ratio="1" />
<button @click="handleSquareCrop">裁剪为正方形</button>`

const noGuidesSnippet = `<!-- 隐藏辅助线 -->
<ImageCropper :src="photo" :guides="false" />`

const jpegSnippet = `<!-- 输出 JPEG 格式，质量 0.8 -->
<ImageCropper :src="photo" output-type="image/jpeg" :quality="0.8" />`
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">ImageCropper 图片裁剪</h1>
    <p class="text-gray-600 mb-8">
      交互式图片裁剪组件，支持自由裁剪、固定宽高比、辅助线、Canvas 输出。
    </p>

    <DemoBlock title="基本用法" description="自由裁剪，拖拽和缩放裁剪区域" :code="basicSnippet">
      <div class="space-y-4">
        <ImageCropper
          ref="cropperRef"
          :src="PHOTO"
          @crop-change="(rect: CropRect) => (cropRect = rect)" />
        <div class="flex items-center gap-4">
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            @click="handleCrop">
            裁剪
          </button>
          <span v-if="cropRect" class="text-sm text-gray-500">
            {{ Math.round(cropRect.x) }}, {{ Math.round(cropRect.y) }} —
            {{ Math.round(cropRect.width) }} × {{ Math.round(cropRect.height) }}
          </span>
        </div>
        <div v-if="resultUrl" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img :src="resultUrl" class="max-w-xs border border-gray-200 rounded" alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="固定宽高比" description="设置 aspectRatio 为 1 实现正方形裁剪" :code="aspectRatioSnippet">
      <div class="space-y-4">
        <ImageCropper ref="cropperSquareRef" :src="PHOTO" :aspect-ratio="1" />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          @click="handleSquareCrop">
          裁剪为正方形
        </button>
        <div v-if="squareResultUrl" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img :src="squareResultUrl" class="max-w-[200px] border border-gray-200 rounded" alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="隐藏辅助线" description="guides=false 隐藏三分线" :code="noGuidesSnippet">
      <ImageCropper :src="PHOTO" :guides="false" />
    </DemoBlock>

    <DemoBlock title="JPEG 输出" description="指定 outputType='image/jpeg' 和 quality" :code="jpegSnippet">
      <ImageCropper :src="PHOTO" output-type="image/jpeg" :quality="0.8" />
    </DemoBlock>
  </div>
</template>
