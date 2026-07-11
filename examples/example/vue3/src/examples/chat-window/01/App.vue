<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    content: '有什么可以帮你？',
    direction: 'other',
    user: { name: '客服' },
    time: new Date('2026-01-01T09:30:00'),
    status: 'sent'
  }
])
const input = ref('')

const handleSend = (content: string) => {
  messages.value = [
    ...messages.value,
    {
      id: Date.now(),
      content,
      direction: 'self',
      user: { name: '我' },
      time: new Date(),
      status: 'sent'
    }
  ]
}
</script>

<template>
  <ChatWindow
    v-model="input"
    class="h-96"
    :messages="messages"
    show-time
    placeholder="输入消息"
    @send="handleSend" />
</template>
