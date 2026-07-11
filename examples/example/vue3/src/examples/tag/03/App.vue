<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Tag } from '@expcat/tigercat-vue/Tag'

const tags = ref(['标签一', '标签二', '标签三'])

const handleClose = (index: number) => {
  tags.value.splice(index, 1)
}
</script>

<template>
  <div class="min-w-0">
    <Space align="center">
      <Tag size="sm" variant="primary">小标签</Tag>
      <Tag size="md" variant="primary">中标签</Tag>
      <Tag size="lg" variant="primary">大标签</Tag>
    </Space>
  </div>
</template>
