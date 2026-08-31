<script setup lang="ts">
import { Divider } from '@expcat/tigercat-vue/Divider'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="space-y-4">
    <Space size="sm">
      <span>首页</span>
      <Divider orientation="vertical" spacing="none" />
      <span>文档</span>
      <Divider orientation="vertical" spacing="none" />
      <span>关于</span>
    </Space>
    <div>
      <p class="text-sm text-gray-500 dark:text-gray-400">color + thickness</p>
      <Divider color="#7c3aed" thickness="3px" spacing="sm" />
    </div>
  </div>
</template>
