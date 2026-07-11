<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const clickCount = ref(0)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full" size="lg">
      <Space direction="vertical" class="w-full">
        <Button variant="primary" block>block 主要按钮</Button>
        <Button variant="secondary" block>block 次要按钮</Button>
      </Space>
      <Space direction="vertical" class="w-full">
        <Button variant="primary" class="w-1/2">50% 宽度</Button>
        <Button variant="secondary" class="w-3/4">75% 宽度</Button>
        <Button variant="outline" class="w-full">100% 宽度</Button>
      </Space>
    </Space>
  </div>
</template>
