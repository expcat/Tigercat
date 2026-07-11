<script setup lang="ts">
import { ref } from 'vue'
import { Mentions } from '@expcat/tigercat-vue/Mentions'

const value = ref('')
const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' }
]
</script>

<template>
  <Mentions
    v-model="value"
    :options="users"
    placeholder="输入 @ 提及成员"
    class="w-full max-w-lg" />
</template>
