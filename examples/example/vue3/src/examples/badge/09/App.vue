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
      <div>
        <p class="text-sm text-gray-600 mb-2">默认（不显示零）</p>
        <Badge :content="0" />
        <span class="text-gray-500 ml-2">（无徽章）</span>
      </div>

      <div>
        <p class="text-sm text-gray-600 mb-2">显示零值</p>
        <Badge :content="0" :show-zero="true" />
      </div>
    </Space>
  </div>
</template>
