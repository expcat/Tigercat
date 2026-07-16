<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
</script>

<template>
  <div class="space-y-4">
    <div class="flex h-8 items-center gap-3 text-sm">
      <span>首页</span>
      <Divider orientation="vertical" class="h-4" />
      <span>文档</span>
      <Divider orientation="vertical" class="h-4" />
      <span>关于</span>
    </div>
    <div>
      <p class="text-sm text-gray-500">color + thickness</p>
      <Divider color="#7c3aed" thickness="3px" spacing="sm" />
    </div>
  </div>
</template>
