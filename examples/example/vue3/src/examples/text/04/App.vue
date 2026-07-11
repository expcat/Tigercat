<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" align="start">
      <Text size="sm">小号文本</Text>
      <Text size="base">中号文本</Text>
      <Text size="lg">大号文本</Text>
    </Space>
  </div>
</template>
