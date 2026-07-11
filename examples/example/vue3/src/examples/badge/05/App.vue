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
      <Badge type="text" content="NEW" variant="danger" />
      <Badge type="text" content="HOT" variant="warning" />
      <Badge type="text" content="VIP" variant="primary" />
      <Badge type="text" content="推荐" variant="success" />
    </Space>
  </div>
</template>
