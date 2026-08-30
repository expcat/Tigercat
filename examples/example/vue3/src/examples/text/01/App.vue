<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
</script>

<template>
  <div class="space-y-4">
    <Text tag="h1" size="2xl" weight="semibold">页面标题</Text>
    <Text tag="label" html-for="display-name">显示名（需配 htmlFor）</Text>
    <div dir="rtl" class="space-y-1">
      <Text align="start">start 贴起始边</Text>
      <Text align="end">end 贴结束边</Text>
    </div>
  </div>
</template>
