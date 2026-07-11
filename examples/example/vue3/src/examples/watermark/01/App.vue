<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'

const font = { color: 'rgba(37, 99, 235, 0.16)', fontWeight: 700 as const }
</script>

<template>
  <Watermark content="Tigercat" :rotate="-24" :gap-x="110" :gap-y="80" :font="font">
    <div class="h-56 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      文字水印会重复覆盖整个内容区域。
    </div>
  </Watermark>
</template>
