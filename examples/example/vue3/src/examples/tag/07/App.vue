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
      <Tag variant="default" closable>默认标签</Tag>
      <Tag variant="primary" closable>主要标签</Tag>
      <Tag variant="success" closable>成功标签</Tag>
      <Tag variant="warning" closable>警告标签</Tag>
      <Tag variant="danger" closable>危险标签</Tag>
      <Tag variant="info" closable>信息标签</Tag>
    </Space>
  </div>
</template>
