<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Mentions } from '@expcat/tigercat-vue/Mentions'

const val = ref('')
const val2 = ref('')
const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' }
]
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="12" class="w-full">
      <Mentions :options="users" size="sm" placeholder="小尺寸" />
      <Mentions :options="users" size="lg" placeholder="大尺寸" />
      <Mentions :options="users" disabled placeholder="禁用" />
    </Space>
  </div>
</template>
