<script setup lang="ts">
import { Image } from '@expcat/tigercat-vue/Image'

const fallbackPhoto = 'https://picsum.photos/seed/tiger-fallback/600/400'
</script>

<template>
  <Image
    src="/missing-photo.jpg"
    :fallback-src="fallbackPhoto"
    alt="加载失败时显示的回退图片"
    :width="240"
    :height="150"
    :preview="false" />
</template>
