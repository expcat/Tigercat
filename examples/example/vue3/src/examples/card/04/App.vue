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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hoverable variant="shadow">
          <h3 class="font-semibold mb-2">功能卡片 1</h3>
          <p class="text-gray-600 dark:text-gray-400">悬停查看效果</p>
        </Card>
        <Card hoverable variant="shadow">
          <h3 class="font-semibold mb-2">功能卡片 2</h3>
          <p class="text-gray-600 dark:text-gray-400">悬停查看效果</p>
        </Card>
        <Card hoverable variant="shadow">
          <h3 class="font-semibold mb-2">功能卡片 3</h3>
          <p class="text-gray-600 dark:text-gray-400">悬停查看效果</p>
        </Card>
      </div>
    </div>
  </div>
</template>
