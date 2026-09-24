<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
</script>

<template>
  <ImageCompare
    before-src="https://picsum.photos/seed/compare-before/640/360"
    after-src="https://picsum.photos/seed/compare-after/640/360"
    before-title="原图"
    after-title="处理后"
    before-alt="原图"
    after-alt="处理后" />
</template>
