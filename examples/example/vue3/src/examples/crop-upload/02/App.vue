<script setup lang="ts">
import { ref } from 'vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import type { CropResult } from '@expcat/tigercat-core'

const result = ref<CropResult | null>(null)
</script>

<template>
  <div class="space-y-4">
    <CropUpload @crop-complete="result = $event">
      <span
        class="inline-flex cursor-pointer items-center gap-2 rounded bg-green-600 px-4 py-2 text-white">
        📷 上传头像
      </span>
    </CropUpload>
    <img v-if="result" :src="result.dataUrl" class="max-w-48 rounded" :alt="result.file.name" />
  </div>
</template>
