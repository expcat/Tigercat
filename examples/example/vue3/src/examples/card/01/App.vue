<script setup lang="ts">
import { ref } from 'vue'
import { Card } from '@expcat/tigercat-vue/Card'
import { Space } from '@expcat/tigercat-vue/Space'
import { Button } from '@expcat/tigercat-vue/Button'

const lastAction = ref('尚未执行卡片操作')
const recordAction = (action: string, target: string) => {
  lastAction.value = `${action}：${target}`
}
</script>

<template>
  <div class="min-w-0">
    <div class="p-6 bg-gray-50 rounded-lg">
      <Card>
        <p>这是一个基础的卡片组件，可以展示任何内容。</p>
      </Card>
    </div>
  </div>
</template>
