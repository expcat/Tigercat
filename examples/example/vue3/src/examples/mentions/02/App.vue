<script setup lang="ts">
import { ref } from 'vue'
import { Mentions } from '@expcat/tigercat-vue/Mentions'

const value = ref('')
const topics = [
  { label: '前端', value: 'frontend' },
  { label: '设计系统', value: 'design-system' },
  { label: '可访问性', value: 'a11y' }
]
</script>

<template>
  <Mentions
    v-model="value"
    :options="topics"
    prefix="#"
    placeholder="输入 # 添加话题"
    class="w-full max-w-lg" />
</template>
