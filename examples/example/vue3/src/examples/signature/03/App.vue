<script setup lang="ts">
import { Signature } from '@expcat/tigercat-vue/Signature'
</script>

<template>
  <div class="flex flex-wrap gap-4">
    <div class="space-y-1">
      <Signature :width="280" :height="140" readonly aria-label="只读画板" />
      <p class="text-xs text-gray-500">readonly：可展示不可绘制</p>
    </div>
    <div class="space-y-1">
      <Signature :width="280" :height="140" disabled :clearable="false" aria-label="禁用画板" />
      <p class="text-xs text-gray-500">disabled + 隐藏清除按钮</p>
    </div>
  </div>
</template>
