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
          variant="shadow"
          hoverable
          cover="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop"
          cover-alt="科技产品">
          <template #header>
            <h3 class="text-lg font-semibold">智能设备</h3>
          </template>
          <p class="text-gray-600 mb-4">最新的智能科技产品，为您的生活带来便利。</p>
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥299</span>
              <span class="text-sm text-gray-500">已售 1.2k</span>
            </div>
          </template>
          <template #actions>
            <Button variant="ghost" size="sm" @click="recordAction('收藏', '基础套餐')">
              收藏
            </Button>
            <Button variant="primary" size="sm" @click="recordAction('购买', '基础套餐')">
              购买
            </Button>
          </template>
        </Card>

        <Card
          variant="shadow"
          hoverable
          cover="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop"
          cover-alt="科技背景">
          <template #header>
            <h3 class="text-lg font-semibold">创新方案</h3>
          </template>
          <p class="text-gray-600 mb-4">为企业提供全方位的数字化转型解决方案。</p>
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥999</span>
              <span class="text-sm text-gray-500">已售 856</span>
            </div>
          </template>
          <template #actions>
            <Button variant="ghost" size="sm" @click="recordAction('收藏', '创新方案')">
              收藏
            </Button>
            <Button variant="primary" size="sm" @click="recordAction('购买', '创新方案')">
              购买
            </Button>
          </template>
        </Card>

        <Card
          variant="shadow"
          hoverable
          cover="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop"
          cover-alt="专业服务">
          <template #header>
            <h3 class="text-lg font-semibold">专业服务</h3>
          </template>
          <p class="text-gray-600 mb-4">专业团队为您提供一对一的咨询和技术支持。</p>
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-xl font-bold text-[var(--tiger-primary,#2563eb)]">¥1999</span>
              <span class="text-sm text-gray-500">已售 562</span>
            </div>
          </template>
          <template #actions>
            <Button variant="ghost" size="sm" @click="recordAction('收藏', '专业服务')">
              收藏
            </Button>
            <Button variant="primary" size="sm" @click="recordAction('购买', '专业服务')">
              购买
            </Button>
          </template>
        </Card>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300" role="status">
        操作反馈：{{ lastAction }}
      </p>
    </div>
  </div>
</template>
