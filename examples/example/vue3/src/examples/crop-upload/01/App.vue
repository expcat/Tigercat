<script setup lang="ts">
import { ref, watch } from 'vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

const result = ref<CropResult | null>(null)
const error = ref('')
const previewUrl = ref('')

watch(result, (value, _previous, onCleanup) => {
  const url = value ? URL.createObjectURL(value.blob) : ''
  previewUrl.value = url
  onCleanup(() => {
    if (url) URL.revokeObjectURL(url)
  })
})
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
      <p v-if="result" class="text-sm text-[var(--tiger-text-secondary)]">
        {{ result.file?.name }}
      </p>
      <img v-if="previewUrl" :src="previewUrl" class="max-w-48 rounded" alt="裁剪结果" />
    </div>
  </div>
</template>
