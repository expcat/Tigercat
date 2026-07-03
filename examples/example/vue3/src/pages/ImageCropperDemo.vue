<script setup lang="ts">
import { ref } from 'vue'
import { ImageCropper } from '@expcat/tigercat-vue/ImageCropper'
import type { CropRect, CropResult } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './ImageCropperDemo.vue?raw'

const PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#bae6fd" />
      <stop offset="1" stop-color="#0f766e" />
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fef3c7" />
      <stop offset="1" stop-color="#f97316" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#sky)" />
  <circle cx="620" cy="120" r="58" fill="#facc15" />
  <path d="M0 420 C130 340 210 420 330 350 C470 270 560 380 800 290 L800 600 L0 600 Z" fill="url(#ground)" />
  <path d="M0 470 C140 390 260 500 420 420 C560 350 640 450 800 390 L800 600 L0 600 Z" fill="#14532d" opacity="0.72" />
  <rect x="120" y="180" width="170" height="220" rx="24" fill="#ffffff" opacity="0.86" />
  <rect x="150" y="220" width="110" height="28" rx="14" fill="#0ea5e9" />
  <rect x="150" y="268" width="80" height="80" rx="18" fill="#f97316" />
  <path d="M500 220 L570 350 L430 350 Z" fill="#0f172a" opacity="0.72" />
  <path d="M546 245 L610 350 L480 350 Z" fill="#334155" opacity="0.8" />
</svg>`
const PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PHOTO_SVG)}`

const cropperRef = ref()
const cropperSquareRef = ref()
const resultUrl = ref('')
const squareResultUrl = ref('')
const cropRect = ref<CropRect | null>(null)
const cropError = ref('')
const squareCropError = ref('')

const handleCrop = async () => {
  try {
    const result: CropResult = await cropperRef.value.getCropResult()
    resultUrl.value = result.dataUrl
    cropError.value = ''
  } catch {
    cropError.value = '图片仍在加载或加载失败，请稍后重试。'
  }
}

const handleSquareCrop = async () => {
  try {
    const result: CropResult = await cropperSquareRef.value.getCropResult()
    squareResultUrl.value = result.dataUrl
    squareCropError.value = ''
  } catch {
    squareCropError.value = '图片仍在加载或加载失败，请稍后重试。'
  }
}

const basicSnippet = `<ImageCropper
  ref="cropperRef"
  :src="photo"
  @crop-change="(rect) => (cropRect = rect)" />
<button @click="handleCrop">裁剪</button>
<img v-if="resultUrl" :src="resultUrl" />`

const basicScriptSnippet = `import { ref } from 'vue'
import type { CropRect, CropResult } from '@expcat/tigercat-core'

const cropperRef = ref()
const resultUrl = ref('')
const cropRect = ref<CropRect | null>(null)

const handleCrop = async () => {
  const result: CropResult = await cropperRef.value.getCropResult()
  resultUrl.value = result.dataUrl
}`

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

    <DemoBlock title="基本用法" description="自由裁剪，拖拽和缩放裁剪区域" :code="fullPageSnippet">
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
        <p v-if="cropError" class="text-sm text-red-600">{{ cropError }}</p>
        <div v-if="resultUrl" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img :src="resultUrl" class="max-w-xs border border-gray-200 rounded" alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock
      title="固定宽高比"
      description="设置 aspectRatio 为 1 实现正方形裁剪"
      :code="fullPageSnippet">
      <div class="space-y-4">
        <ImageCropper ref="cropperSquareRef" :src="PHOTO" :aspect-ratio="1" />
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          @click="handleSquareCrop">
          裁剪为正方形
        </button>
        <p v-if="squareCropError" class="text-sm text-red-600">{{ squareCropError }}</p>
        <div v-if="squareResultUrl" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img
            :src="squareResultUrl"
            class="max-w-[200px] border border-gray-200 rounded"
            alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock title="隐藏辅助线" description="guides=false 隐藏三分线" :code="fullPageSnippet">
      <ImageCropper :src="PHOTO" :guides="false" />
    </DemoBlock>

    <DemoBlock
      title="JPEG 输出"
      description="指定 outputType='image/jpeg' 和 quality"
      :code="fullPageSnippet">
      <ImageCropper :src="PHOTO" output-type="image/jpeg" :quality="0.8" />
    </DemoBlock>
  </div>
</template>
