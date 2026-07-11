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
    <Space wrap>
      <Tag variant="default">默认标签</Tag>
      <Tag variant="primary">主要标签</Tag>
      <Tag variant="success">成功标签</Tag>
      <Tag variant="warning">警告标签</Tag>
      <Tag variant="danger">危险标签</Tag>
      <Tag variant="info">信息标签</Tag>
    </Space>
  </div>
</template>
