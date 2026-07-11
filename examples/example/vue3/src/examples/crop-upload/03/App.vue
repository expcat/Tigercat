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
    <CropUpload @crop-complete="handleCropComplete">
      <span
        class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 transition-colors">
        📷 上传头像
      </span>
    </CropUpload>
  </div>
</template>
