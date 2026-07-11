<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full">
      <Text>这是一段默认段落文本。</Text>
      <Text tag="span" class="block">这是一段 span 文本（通过 class 设置为 block）。</Text>
      <Text tag="div">这是一段 div 文本。</Text>
    </Space>
  </div>
</template>
