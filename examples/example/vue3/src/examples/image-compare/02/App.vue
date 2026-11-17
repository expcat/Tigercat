<script setup lang="ts">
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { demoImageBefore as before, demoImageAfter as after } from '@demo-shared/demo-images'
</script>

<template>
  <div class="py-2">
    <ImageCompare
      :before-src="before"
      :after-src="after"
      before-alt="上半部分"
      after-alt="下半部分"
      orientation="vertical"
      :default-position="40"
      :width="480"
      :height="280" />
  </div>
</template>
