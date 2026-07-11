<script setup lang="ts">
import { Text } from '@expcat/tigercat-vue/Text'
import { Space } from '@expcat/tigercat-vue/Space'
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full">
      <div class="w-64">
        <Text truncate> 这是一段很长很长的文本，会在容器宽度不足时显示省略号。 </Text>
      </div>
      <Text italic>这是一段斜体文本。</Text>
      <Text underline>这是一段带下划线的文本。</Text>
      <Text lineThrough>这是一段带删除线的文本。</Text>
    </Space>
  </div>
</template>
