<script setup lang="ts">
import { Signature } from '@expcat/tigercat-vue/Signature'
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div class="space-y-1">
      <Signature :width="280" :height="140" pen-color="#dc2626" :line-width="2" aria-label="红色细笔" />
      <p class="text-xs text-gray-500">penColor 红 · lineWidth 2</p>
    </div>
    <div class="space-y-1">
      <Signature
        :width="280"
        :height="140"
        pen-color="#f8fafc"
        background-color="#0f172a"
        :line-width="4"
        aria-label="深色背景画板" />
      <p class="text-xs text-gray-500">backgroundColor 深色 · lineWidth 4</p>
    </div>
  </div>
</template>
