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
      <Badge :content="5" :standalone="false" position="top-right">
        <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右上</div>
      </Badge>

      <Badge :content="5" :standalone="false" position="top-left">
        <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左上</div>
      </Badge>

      <Badge :content="5" :standalone="false" position="bottom-right">
        <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">右下</div>
      </Badge>

      <Badge :content="5" :standalone="false" position="bottom-left">
        <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">左下</div>
      </Badge>
    </Space>
  </div>
</template>
