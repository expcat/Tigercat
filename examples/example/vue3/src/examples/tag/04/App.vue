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
      <Tag
        v-for="(tag, index) in tags"
        :key="tag"
        variant="primary"
        closable
        @close="handleClose(index)">
        {{ tag }}
      </Tag>
      <p v-if="tags.length === 0" class="text-gray-500">所有标签已被移除</p>
    </Space>
  </div>
</template>
