<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'
</script>

<template>
  <ImageCompare
    :before-src="before"
    :after-src="after"
    before-title="原图"
    after-title="处理后"
    before-alt="原图"
    after-alt="处理后" />
</template>
