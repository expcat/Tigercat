<script setup lang="ts">
import { ref } from 'vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './CropUploadDemo.vue?raw'

const result1 = ref<CropResult | null>(null)
const result2 = ref<CropResult | null>(null)
const errorMsg = ref('')

const handleCropComplete = (r: CropResult) => {
  result1.value = r
  console.log('CropUpload result:', r)
}

const handleSquareCrop = (r: CropResult) => {
  result2.value = r
}

const handleError = (err: Error) => {
  errorMsg.value = err.message
  setTimeout(() => (errorMsg.value = ''), 3000)
}

const basicSnippet = `<CropUpload @crop-complete="handleCropComplete" @error="handleError" />
<img v-if="result" :src="result.dataUrl" />`

const basicScriptSnippet = `import { ref } from 'vue'
import type { CropResult } from '@expcat/tigercat-core'

const result1 = ref<CropResult | null>(null)`

const aspectRatioSnippet = `<!-- 强制正方形裁剪 -->
<CropUpload :cropper-props="{ aspectRatio: 1 }" @crop-complete="handleSquareCrop" />`

const customTriggerSnippet = `<!-- 自定义触发按钮 -->
<CropUpload @crop-complete="handleCropComplete">
  <span class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600">
    📷 上传头像
  </span>
</CropUpload>`

const disabledSnippet = `<CropUpload disabled />`

const maxSizeSnippet = `<!-- 限制文件大小 2MB -->
<CropUpload :max-size="2 * 1024 * 1024" @error="handleError" />`
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">CropUpload 裁剪上传</h1>
    <p class="text-gray-600 mb-8">
      组合组件：选择图片 → 弹窗裁剪 → 输出裁剪结果。适用于头像上传、封面裁剪等场景。
    </p>

    <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
      {{ errorMsg }}
    </div>

    <DemoBlock
      title="基本用法"
      description="点击按钮选择图片，弹窗中裁剪后获取结果"
      :code="fullPageSnippet">
      <div class="space-y-4">
        <CropUpload @crop-complete="handleCropComplete" @error="handleError" />
        <div v-if="result1" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img
            :src="result1.dataUrl"
            class="max-w-xs border border-gray-200 rounded"
            alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock
      title="固定宽高比"
      description="通过 cropperProps 传递 aspectRatio 实现正方形裁剪"
      :code="fullPageSnippet">
      <div class="space-y-4">
        <CropUpload :cropper-props="{ aspectRatio: 1 }" @crop-complete="handleSquareCrop" />
        <div v-if="result2" class="mt-4">
          <p class="text-sm text-gray-600 mb-2">裁剪结果：</p>
          <img
            :src="result2.dataUrl"
            class="max-w-[200px] border border-gray-200 rounded"
            alt="裁剪结果" />
        </div>
      </div>
    </DemoBlock>

    <DemoBlock
      title="自定义触发按钮"
      description="通过默认插槽自定义触发按钮"
      :code="fullPageSnippet">
      <CropUpload @crop-complete="handleCropComplete">
        <span
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition-colors">
          📷 上传头像
        </span>
      </CropUpload>
    </DemoBlock>

    <DemoBlock
      title="限制文件大小"
      description="maxSize 限制文件大小（字节），超出触发 error 事件"
      :code="fullPageSnippet">
      <CropUpload
        :max-size="2 * 1024 * 1024"
        @crop-complete="handleCropComplete"
        @error="handleError" />
    </DemoBlock>

    <DemoBlock title="禁用状态" description="disabled 禁用触发按钮" :code="fullPageSnippet">
      <CropUpload disabled />
    </DemoBlock>
  </div>
</template>
