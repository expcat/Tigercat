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
    <div>
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">通知中心</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Badge :content="notificationCount" :standalone="false" variant="danger">
              <Button variant="primary" @click="incrementNotifications"> 通知 </Button>
            </Badge>

            <Button variant="secondary" @click="clearNotifications"> 清除通知 </Button>
          </Space>
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">消息和购物车</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space>
            <Badge :content="messageCount" :standalone="false" variant="primary" :max="99">
              <Button variant="primary">消息</Button>
            </Badge>

            <Badge :content="cartItems" :standalone="false" variant="danger">
              <Button variant="secondary">购物车</Button>
            </Badge>
          </Space>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-3">在线状态指示</h3>
        <div class="p-6 bg-gray-50 rounded-lg">
          <Space wrap>
            <div class="flex items-center gap-3">
              <Badge type="dot" variant="success" :standalone="false">
                <div
                  class="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  张三
                </div>
              </Badge>
              <span class="text-green-600 font-medium">在线</span>
            </div>

            <div class="flex items-center gap-3">
              <Badge type="dot" variant="default" :standalone="false">
                <div
                  class="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                  李四
                </div>
              </Badge>
              <span class="text-gray-500">离线</span>
            </div>

            <div class="flex items-center gap-3">
              <Badge type="dot" variant="warning" :standalone="false">
                <div
                  class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                  王五
                </div>
              </Badge>
              <span class="text-yellow-600">忙碌</span>
            </div>
          </Space>
        </div>
      </div>
    </div>
  </div>
</template>
