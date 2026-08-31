<script setup lang="ts">
import { Watermark } from '@expcat/tigercat-vue/Watermark'

const font = { fontWeight: 700 as const }
</script>

<template>
  <Watermark content="Tigercat" :rotate="-24" :gap-x="110" :gap-y="80" :font="font">
    <div class="h-56 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      文字水印按 gap 留白平铺，默认墨水跟 --tiger-text。
    </div>
  </Watermark>
</template>
