<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'

const before = 'https://picsum.photos/seed/tiger-compare-rtl-before/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-rtl-after/800/500'
</script>

<template>
  <ImageCompare
    dir="rtl"
    :before-src="before"
    :after-src="after"
    before-alt="改造前"
    after-alt="改造后"
    :width="480"
    :height="280" />
</template>
