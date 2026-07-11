<script setup lang="ts">
import { ref } from 'vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

const result = ref<CropResult | null>(null)
const error = ref('')
</script>

<template>
  <div class="min-w-0">
    <div class="space-y-4">
      <CropUpload
        :max-size="2 * 1024 * 1024"
        :cropper-props="{ aspectRatio: 1 }"
        @crop-complete="result = $event"
        @error="error = $event.message" />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <img v-if="result" :src="result.dataUrl" class="max-w-48 rounded" alt="裁剪结果" />
    </div>
  </div>
</template>
