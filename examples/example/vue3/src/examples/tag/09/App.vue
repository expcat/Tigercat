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
    <Space direction="vertical" class="w-full">
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700">状态标签</h3>
        <Space>
          <Tag variant="success">已完成</Tag>
          <Tag variant="warning">进行中</Tag>
          <Tag variant="danger">已取消</Tag>
          <Tag variant="info">待审核</Tag>
        </Space>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700">分类标签</h3>
        <Space wrap>
          <Tag variant="primary">前端开发</Tag>
          <Tag variant="primary">后端开发</Tag>
          <Tag variant="primary">UI设计</Tag>
          <Tag variant="primary">产品经理</Tag>
        </Space>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700">可移除的兴趣标签</h3>
        <Space wrap>
          <Tag variant="info" closable>JavaScript</Tag>
          <Tag variant="info" closable>TypeScript</Tag>
          <Tag variant="info" closable>React</Tag>
          <Tag variant="info" closable>Vue</Tag>
          <Tag variant="info" closable>Node.js</Tag>
        </Space>
      </div>
    </Space>
  </div>
</template>
