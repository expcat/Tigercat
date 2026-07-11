<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'

const clickCount = ref(0)
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" class="w-full" size="lg">
      <Space align="center">
        <Button variant="primary" @click="clickCount++">已点击 {{ clickCount }} 次</Button>
        <Button variant="secondary" @click="clickCount = 0">重置</Button>
      </Space>
      <form @submit.prevent>
        <Space>
          <Button htmlType="submit" variant="primary">提交</Button>
          <Button htmlType="reset" variant="outline">重置</Button>
          <Button htmlType="button" variant="ghost">普通按钮</Button>
        </Space>
      </form>
    </Space>
  </div>
</template>
