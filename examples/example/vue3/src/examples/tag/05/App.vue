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
      <Tag variant="info" closable closeAriaLabel="移除标签：JavaScript">JavaScript</Tag>
      <Tag variant="success" closable closeAriaLabel="移除标签：已完成">已完成</Tag>
    </Space>
  </div>
</template>
