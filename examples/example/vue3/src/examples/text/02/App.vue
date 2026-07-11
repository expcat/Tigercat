<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full">
      <Text tag="h3" size="lg" weight="semibold">Heading (h3)</Text>
      <Text tag="label" size="sm" color="muted">Label text</Text>
      <Text tag="p">Paragraph text</Text>
    </Space>
  </div>
</template>
