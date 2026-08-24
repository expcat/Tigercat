<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'

const before = 'https://picsum.photos/seed/tiger-compare-top/800/500'
const after = 'https://picsum.photos/seed/tiger-compare-bottom/800/500'
</script>

<template>
  <ImageCompare
    :before-src="before"
    :after-src="after"
    before-alt="上半部分"
    after-alt="下半部分"
    orientation="vertical"
    :default-position="40"
    :width="480"
    :height="280" />
</template>
