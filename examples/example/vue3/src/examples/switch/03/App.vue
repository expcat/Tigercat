<script setup lang="ts">
import { Switch } from '@expcat/tigercat-vue/Switch'
</script>

<template>
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-2">
      <Switch :model-value="true" disabled aria-label="禁用且开启" />
      <span class="text-sm text-gray-500">开 · disabled</span>
    </div>
    <div class="flex items-center gap-2">
      <Switch :model-value="false" disabled aria-label="禁用且关闭" />
      <span class="text-sm text-gray-500">关 · disabled</span>
    </div>
  </div>
</template>
