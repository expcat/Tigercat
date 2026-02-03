<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue'
import type { ChatMessage } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'

const baseMessages: ChatMessage[] = [
  {
    id: 1,
    content: '你好，我是 Tigercat。',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(Date.now() - 1000 * 60 * 5),
    status: 'sent'
  },
  {
    id: 2,
    content: '请问有什么可以帮助？',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(Date.now() - 1000 * 60 * 4),
    status: 'sent'
  }
]

const messages = ref<ChatMessage[]>([...baseMessages])
const input = ref('')

const quickMessages = ref<ChatMessage[]>([...baseMessages])
const quickInput = ref('')

const handleSend = (value: string) => {
  messages.value = [
    ...messages.value,
    {
      id: Date.now(),
      content: value,
      direction: 'self',
      user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=5' },
      time: new Date(),
      status: 'sent'
    }
  ]
  setTimeout(() => {
    messages.value = [
      ...messages.value,
      {
        id: Date.now() + 1,
        content: '已收到消息，正在处理中。',
        direction: 'other',
        user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
        time: new Date(),
        status: 'sent'
      }
    ]
  }, 600)
}

const handleQuickSend = (value: string) => {
  quickMessages.value = [
    ...quickMessages.value,
    {
      id: Date.now(),
      content: value,
      direction: 'self',
      user: { name: '我' },
      time: new Date(),
      status: 'sent'
    }
  ]
}

const basicSnippet = `<ChatWindow
  v-model="input"
  :messages="messages"
  show-time
  allow-shift-enter
  status-text="对方正在输入..."
  message-list-aria-label="会话消息"
  input-aria-label="输入消息"
  send-aria-label="发送消息"
  @send="handleSend"
>
  <template #message="{ message }">
    <span>{{ message.content }}</span>
  </template>
</ChatWindow>`

const inputSnippet = `<ChatWindow
  v-model="quickInput"
  input-type="input"
  placeholder="输入并回车发送"
  :messages="quickMessages"
  send-on-enter
  @send="handleQuickSend"
/>`
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">ChatWindow 聊天窗口</h1>
      <p class="text-gray-600">组合组件，用于构建完整聊天交互区域。</p>
    </div>

    <DemoBlock title="基础用法"
               description="默认 textarea 输入，支持 Shift+Enter 换行。"
               :code="basicSnippet">
      <ChatWindow v-model="input"
                  class="h-[520px]"
                  :messages="messages"
                  show-time
                  allow-shift-enter
                  status-text="对方正在输入..."
                  message-list-aria-label="会话消息"
                  input-aria-label="输入消息"
                  send-aria-label="发送消息"
                  @send="handleSend">
        <template #message="{ message }">
          <span>{{ message.content }}</span>
        </template>
      </ChatWindow>
    </DemoBlock>

    <DemoBlock title="单行输入"
               description="使用 input 模式，回车即可发送。"
               :code="inputSnippet">
      <ChatWindow v-model="quickInput"
                  class="h-[420px]"
                  input-type="input"
                  placeholder="输入并回车发送"
                  :messages="quickMessages"
                  send-on-enter
                  @send="handleQuickSend" />
    </DemoBlock>
  </div>
</template>
