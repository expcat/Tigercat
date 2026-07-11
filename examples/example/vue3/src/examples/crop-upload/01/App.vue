<script setup lang="ts">
import { ref } from 'vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

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
</script>

<template>
  <div class="min-w-0">
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
  </div>
</template>
