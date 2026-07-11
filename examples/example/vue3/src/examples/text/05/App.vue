<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full">
      <Text weight="normal">Normal</Text>
      <Text weight="semibold">Semibold</Text>
      <Text weight="bold">Bold</Text>
    </Space>
  </div>
</template>
