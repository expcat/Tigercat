<script setup lang="ts">
import { ref } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'

const messages = ref<ChatMessage[]>(
  Array.from({ length: 120 }, (_, index) => ({
    id: index + 1,
    content: `这是虚拟列表中的第 ${index + 1} 条消息。`,
    direction: index % 3 === 0 ? 'self' : 'other',
    user: { name: index % 3 === 0 ? '我' : '协作者' },
    time: `09:${String(index % 60).padStart(2, '0')}`,
    status: 'sent'
  }))
)
const input = ref('')
const inputType = ref<'input' | 'textarea'>('input')

const handleSend = (content: string) => {
  messages.value = [
    ...messages.value,
    {
      id: messages.value.length + 1,
      content,
      direction: 'self',
      user: { name: '我' },
      time: '刚刚',
      status: 'sent'
    }
  ]
}
</script>

<template>
  <div class="space-y-3">
    <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      输入模式
      <select
        v-model="inputType"
        class="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600">
        <option value="input">单行 input</option>
        <option value="textarea">多行 textarea</option>
      </select>
    </label>
    <ChatWindow
      v-model="input"
      class="h-[32rem]"
      :messages="messages"
      :input-type="inputType"
      :input-rows="2"
      virtual
      :virtual-item-height="88"
      :virtual-height="320"
      show-time
      :status-text="`已虚拟渲染 ${messages.length} 条消息 · ${inputType === 'input' ? '单行' : '多行'}输入`"
      :placeholder="inputType === 'input' ? '按 Enter 发送' : 'Enter 发送，Shift+Enter 换行'"
      @send="handleSend" />
  </div>
</template>
