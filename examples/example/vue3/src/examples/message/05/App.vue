<script setup lang="ts">
import { ref } from 'vue'
import type { MessageInstance } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { MessageContainer } from '@expcat/tigercat-vue/MessageContainer'

const createMessages = (): MessageInstance[] => [
  {
    id: 'saved',
    type: 'success',
    content: '草稿已保存',
    duration: 0,
    closable: true,
    closeAriaLabel: '关闭保存成功消息'
  },
  {
    id: 'syncing',
    type: 'loading',
    content: '正在同步云端数据',
    duration: 0,
    closable: false
  }
]

const messages = ref<MessageInstance[]>(createMessages())

const removeMessage = (id: string | number) => {
  messages.value = messages.value.filter((message) => message.id !== id)
}
</script>

<template>
  <div style="min-height: 180px">
    <div class="flex items-center justify-end gap-3">
      <span role="status" class="text-sm text-gray-500">当前 {{ messages.length }} 条</span>
      <Button size="sm" @click="messages = createMessages()">重置消息</Button>
    </div>
    <MessageContainer position="bottom-left" :messages="messages" :on-close="removeMessage" />
  </div>
</template>
