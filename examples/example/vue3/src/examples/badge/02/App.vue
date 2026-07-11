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
    <Space wrap>
      <Badge variant="default" :content="1" />
      <Badge variant="primary" :content="2" />
      <Badge variant="success" :content="3" />
      <Badge variant="warning" :content="4" />
      <Badge variant="danger" :content="5" />
      <Badge variant="info" :content="6" />
    </Space>
  </div>
</template>
