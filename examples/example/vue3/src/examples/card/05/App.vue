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
        <Card
          cover="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop"
          cover-alt="代码编辑器">
          <h3 class="font-semibold mb-2">开发工具</h3>
          <p class="text-gray-600 dark:text-gray-400">现代化的开发环境</p>
        </Card>
        <Card
          cover="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop"
          cover-alt="笔记本电脑">
          <h3 class="font-semibold mb-2">移动办公</h3>
          <p class="text-gray-600 dark:text-gray-400">随时随地高效工作</p>
        </Card>
        <Card
          cover="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
          cover-alt="数据分析">
          <h3 class="font-semibold mb-2">数据分析</h3>
          <p class="text-gray-600 dark:text-gray-400">洞察数据价值</p>
        </Card>
      </div>
    </div>
  </div>
</template>
