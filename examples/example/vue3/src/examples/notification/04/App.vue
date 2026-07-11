<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue/Button'
import { notification } from '@expcat/tigercat-vue'

const closeNotification = ref<(() => void) | null>(null)
const status = ref('尚未显示通知')

const showNotification = () => {
  closeNotification.value?.()
  status.value = '等待操作'
  closeNotification.value = notification.info({
    title: '发现新版本',
    description: '可先查看更新内容，再决定是否升级。',
    duration: 0,
    actions: [
      {
        label: '查看详情',
        type: 'primary',
        onClick: () => {
          status.value = '已查看更新详情'
        }
      }
    ],
    onClose: () => {
      status.value = '通知已关闭'
    }
  })
}
</script>

<template>
  <div class="space-y-3">
    <Button variant="primary" @click="showNotification">显示操作通知</Button>
    <p class="text-sm text-gray-500" role="status">{{ status }}</p>
  </div>
</template>
