<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'
</script>

<template>
  <Watermark content="Tigercat" :row-gap="16" :density="2" :print-visible="false">
    <div class="h-40">页面内容</div>
  </Watermark>
</template>
