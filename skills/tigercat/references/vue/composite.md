---
name: tigercat-vue-composite
description: Vue 3 composite components usage
---

# Composite Components (Vue 3)

组合组件：ChatWindow

> **Props Reference**: [shared/props/composite.md](../shared/props/composite.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## ChatWindow 聊天窗口

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue'
import type { ChatMessage } from '@expcat/tigercat-core'

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    content: '你好，我是 Tigercat。',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(),
    status: 'sent'
  },
  {
    id: 2,
    content: '请问有什么可以帮助？',
    direction: 'self',
    user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=5' },
    time: new Date(),
    status: 'sending'
  }
])

const input = ref('')

const handleSend = (value: string) => {
  messages.value = [
    ...messages.value,
    {
      id: Date.now(),
      content: value,
      direction: 'self',
      user: { name: '我' },
      time: new Date(),
      status: 'sending'
    }
  ]
}
</script>

<template>
  <ChatWindow
    v-model="input"
    :messages="messages"
    status-text="对方正在输入..."
    allow-shift-enter
    message-list-aria-label="会话消息"
    input-aria-label="输入消息"
    send-aria-label="发送消息"
    @send="handleSend">
    <template #message="{ message }">
      <span>{{ message.content }}</span>
    </template>
  </ChatWindow>
</template>
```
