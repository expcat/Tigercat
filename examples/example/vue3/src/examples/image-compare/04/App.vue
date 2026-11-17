<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'
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
