<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Mentions } from '@expcat/tigercat-vue/Mentions'

const value = ref('')
const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]
</script>

<template>
  <div class="w-full max-w-lg space-y-2">
    <FormItem label="提及成员">
      <Mentions v-model="value" :options="users" placeholder="输入 @ 提及成员" />
    </FormItem>
    <p class="text-sm text-gray-600 dark:text-gray-300">
      搜「张」或「zhang」都能出张三；选中插入
      <code>@zhangsan</code>
      。当前：{{ value || '暂无' }}
    </p>
  </div>
</template>
