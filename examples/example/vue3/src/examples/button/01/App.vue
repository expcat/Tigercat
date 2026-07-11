<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const clickCount = ref(0)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full" size="lg">
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">类型</h3>
        <Space wrap>
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
        </Space>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">尺寸</h3>
        <Space align="center">
          <Button size="sm">小按钮</Button>
          <Button size="md">中按钮</Button>
          <Button size="lg">大按钮</Button>
        </Space>
      </div>
      <div>
        <h3 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">状态</h3>
        <Space wrap>
          <Button variant="primary">主要按钮</Button>
          <Button variant="secondary" disabled>禁用按钮</Button>
          <Button variant="outline" loading>加载中</Button>
          <Button variant="primary" loading>
            <template #loading-icon>
              <span class="animate-spin inline-block">↻</span>
            </template>
            自定义加载图标
          </Button>
        </Space>
      </div>
    </Space>
  </div>
</template>
