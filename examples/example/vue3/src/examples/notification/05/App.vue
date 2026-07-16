<script setup lang="ts">
import { ref } from 'vue'
import type { NotificationInstance } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { NotificationContainer } from '@expcat/tigercat-vue/NotificationContainer'

const status = ref('等待操作')

const createNotifications = (): NotificationInstance[] => [
  {
    id: 'review',
    type: 'warning',
    title: '发布前检查',
    description: '还有两项检查尚未完成。',
    duration: 0,
    closable: true,
    position: 'bottom-right',
    closeAriaLabel: '关闭发布检查通知',
    onClick: () => {
      status.value = '已打开检查列表'
    },
    actions: [
      {
        key: 'details',
        label: '查看详情',
        type: 'primary',
        onClick: () => {
          status.value = '已查看检查详情'
        }
      }
    ]
  },
  {
    id: 'backup',
    type: 'success',
    title: '备份完成',
    description: '项目快照已安全保存。',
    duration: 0,
    closable: false,
    position: 'bottom-right'
  }
]

const notifications = ref<NotificationInstance[]>(createNotifications())

const removeNotification = (id: string | number) => {
  notifications.value = notifications.value.filter((notification) => notification.id !== id)
  status.value = `已关闭通知：${id}`
}
</script>

<template>
  <div style="min-height: 260px">
    <div class="flex items-center justify-between gap-3">
      <span role="status" class="text-sm text-gray-500">
        {{ status }}，剩余 {{ notifications.length }} 条
      </span>
      <Button size="sm" @click="notifications = createNotifications()">重置通知</Button>
    </div>
    <NotificationContainer
      position="bottom-right"
      :notifications="notifications"
      :on-close="removeNotification" />
  </div>
</template>
