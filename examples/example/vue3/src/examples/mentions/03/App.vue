<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Mentions } from '@expcat/tigercat-vue/Mentions'

const value = ref('hello @')
const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' }
]
</script>

<template>
  <div class="w-full max-w-lg space-y-4">
    <FormItem label="字数与清空">
      <Mentions
        v-model="value"
        :options="users"
        :max-length="80"
        show-count
        clearable
        placeholder="输入 @ 提及；可清空" />
    </FormItem>
    <FormItem label="只读">
      <Mentions model-value="已锁定 @zhangsan " :options="users" readonly />
    </FormItem>
  </div>
</template>
