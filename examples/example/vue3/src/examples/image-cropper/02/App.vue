<script setup lang="ts">
import { ImageCropper } from '@expcat/tigercat-vue/ImageCropper'

const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="#ddd6fe"/><circle cx="180" cy="130" r="70" fill="#f97316"/><path d="M0 340 250 170l120 110 90-70 180 190H0Z" fill="#4f46e5"/></svg>'
)}`
</script>

<template>
  <ImageCropper :src="source" output-type="image/jpeg" :quality="0.8" />
</template>
