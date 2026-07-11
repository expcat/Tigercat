<script setup lang="ts">
import { ref } from 'vue'
import { Empty } from '@expcat/tigercat-vue/Empty'
import { Button } from '@expcat/tigercat-vue/Button'
import { Space } from '@expcat/tigercat-vue/Space'

const lastAction = ref('尚未执行操作')
</script>

<template>
  <div class="min-w-0">
    <Space direction="vertical" :size="24" class="w-full">
      <div class="border rounded-lg p-6">
        <Empty description="这里什么都没有">
          <template #extra>
            <Button variant="primary" @click="lastAction = '已创建一条新内容'">立即创建</Button>
          </template>
        </Empty>
        <p class="mt-3 text-center text-sm text-gray-600 dark:text-gray-300" role="status">
          操作反馈：{{ lastAction }}
        </p>
      </div>
      <div class="border rounded-lg p-6">
        <Empty :show-image="false" description="无图片模式，仅显示文字描述" />
      </div>
    </Space>
  </div>
</template>
