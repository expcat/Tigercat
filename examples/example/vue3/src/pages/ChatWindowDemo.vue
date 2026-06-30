<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './ChatWindowDemo.vue?raw'

const baseMessages: ChatMessage[] = [
  {
    id: 1,
    content: '你好！欢迎使用 Tigercat 组件库 👋',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(Date.now() - 1000 * 60 * 5),
    status: 'sent'
  },
  {
    id: 2,
    content: '请问有什么可以帮助你的？',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(Date.now() - 1000 * 60 * 4),
    status: 'sent'
  },
  {
    id: 3,
    content: '我想了解一下 ChatWindow 组件的用法',
    direction: 'self',
    user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=5' },
    time: new Date(Date.now() - 1000 * 60 * 3),
    status: 'sent'
  },
  {
    id: 4,
    content:
      'ChatWindow 是一个开箱即用的聊天窗口组件，支持 textarea 和 input 两种输入模式，可以自定义消息气泡渲染。',
    direction: 'other',
    user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
    time: new Date(Date.now() - 1000 * 60 * 2),
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
</script>

<template>
  <div class="max-w-6xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">ChatWindow 聊天窗口</h1>
      <p class="text-gray-600 dark:text-gray-400">组合组件，用于构建完整聊天交互区域。</p>
    </div>

    <DemoBlock
      title="组合展示"
      description="合并展示 textarea 与单行 input 两种聊天输入模式。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            默认 textarea 输入，支持 Shift+Enter 换行。
          </p>
          <ChatWindow
            v-model="input"
            class="h-[480px]"
            :messages="messages"
            show-time
            allow-shift-enter
            status-text="对方正在输入..."
            @send="handleSend" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">单行输入</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">使用 input 模式，回车即可发送。</p>
          <ChatWindow
            v-model="quickInput"
            class="h-[380px]"
            input-type="input"
            placeholder="输入并回车发送"
            :messages="quickMessages"
            send-on-enter
            @send="handleQuickSend" />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>
