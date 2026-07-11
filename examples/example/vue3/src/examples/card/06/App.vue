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
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">卡片标题</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">这是卡片的主体内容区域，可以放置任何内容。</p>
          <template #footer>
            <p class="text-sm text-gray-500">创建于 2024-01-01</p>
          </template>
        </Card>

        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">操作卡片</h3>
          </template>
          <p class="text-gray-600 dark:text-gray-400">这个卡片包含操作按钮。</p>
          <template #actions>
            <Button variant="ghost" size="sm" @click="recordAction('取消', '操作卡片')">
              取消
            </Button>
            <Button variant="primary" size="sm" @click="recordAction('确认', '操作卡片')">
              确认
            </Button>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
