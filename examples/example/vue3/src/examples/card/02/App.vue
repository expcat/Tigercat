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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="default">
          <h3 class="font-semibold mb-2">默认卡片</h3>
          <p class="text-gray-600 dark:text-gray-400">带细边框的基础卡片样式。</p>
        </Card>
        <Card variant="bordered">
          <h3 class="font-semibold mb-2">带边框卡片</h3>
          <p class="text-gray-600 dark:text-gray-400">带粗边框的卡片样式。</p>
        </Card>
        <Card variant="shadow">
          <h3 class="font-semibold mb-2">带阴影卡片</h3>
          <p class="text-gray-600 dark:text-gray-400">带阴影效果的卡片样式。</p>
        </Card>
        <Card variant="elevated">
          <h3 class="font-semibold mb-2">浮起卡片</h3>
          <p class="text-gray-600 dark:text-gray-400">带大阴影的浮起卡片样式。</p>
        </Card>
      </div>
    </div>
  </div>
</template>
