<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { Button } from '@expcat/tigercat-vue/Button'
import { ref } from 'vue'
import { Badge } from '@expcat/tigercat-vue/Badge'

const notificationCount = ref(5)
const messageCount = ref(99)
const cartItems = ref(3)

const incrementNotifications = () => {
  notificationCount.value++
}

const clearNotifications = () => {
  notificationCount.value = 0
}
</script>

<template>
  <div class="min-w-0">
    <Space>
      <Badge :content="5" :standalone="false">
        <Button>通知</Button>
      </Badge>

      <Badge :content="99" :standalone="false" variant="danger">
        <Button variant="secondary">消息</Button>
      </Badge>

      <Badge type="dot" :standalone="false" variant="danger">
        <Button variant="outline">邮件</Button>
      </Badge>
    </Space>
  </div>
</template>
