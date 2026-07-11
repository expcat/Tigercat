<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { Tour } from '@expcat/tigercat-vue/Tour'

const open = ref(false)
const steps = [
  { target: '#tour-start-vue', title: '开始', description: '从这里启动操作。' },
  { target: '#tour-result-vue', title: '结果', description: '在这里查看结果。' }
]
</script>

<template>
  <div class="flex items-center gap-4">
    <Button id="tour-start-vue" @click="open = true">开始引导</Button>
    <span id="tour-result-vue" class="rounded bg-gray-100 px-3 py-2">结果区域</span>
    <Tour
      v-model:open="open"
      :steps="steps"
      next-text="下一步"
      prev-text="上一步"
      finish-text="完成"
      show-indicators />
  </div>
</template>
