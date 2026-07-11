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
    <Mentions v-model="val2" :options="users" prefix="#" placeholder="输入 # 提及话题" />
  </div>
</template>
