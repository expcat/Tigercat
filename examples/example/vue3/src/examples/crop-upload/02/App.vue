<script setup lang="ts">
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
</script>

<template>
  <div class="min-w-0">
    <CropUpload @crop-complete="console.log($event)">
      <span
        class="inline-flex cursor-pointer items-center gap-2 rounded bg-green-600 px-4 py-2 text-white">
        📷 上传头像
      </span>
    </CropUpload>
  </div>
</template>
