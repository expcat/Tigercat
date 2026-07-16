import { useState } from 'react'
import { ChatWindow } from '@expcat/tigercat-react/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'

const initialMessages: ChatMessage[] = Array.from({ length: 120 }, (_, index) => ({
  id: index + 1,
  content: `这是虚拟列表中的第 ${index + 1} 条消息。`,
  direction: index % 3 === 0 ? 'self' : 'other',
  user: { name: index % 3 === 0 ? '我' : '协作者' },
  time: `09:${String(index % 60).padStart(2, '0')}`,
  status: 'sent'
}))

export default function App() {
  const [messages, setMessages] = useState(initialMessages)
  const [value, setValue] = useState('')
  const [inputType, setInputType] = useState<'input' | 'textarea'>('input')

  const handleSend = (content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        content,
        direction: 'self',
        user: { name: '我' },
        time: '刚刚',
        status: 'sent'
      }
    ])
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        输入模式
        <select
          className="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600"
          value={inputType}
          onChange={(event) => setInputType(event.currentTarget.value as 'input' | 'textarea')}>
          <option value="input">单行 input</option>
          <option value="textarea">多行 textarea</option>
        </select>
      </label>
      <ChatWindow
        className="h-[32rem]"
        messages={messages}
        value={value}
        onChange={setValue}
        onSend={handleSend}
        inputType={inputType}
        inputRows={2}
        virtual
        virtualItemHeight={88}
        virtualHeight={320}
        showTime
        statusText={`已虚拟渲染 ${messages.length} 条消息 · ${inputType === 'input' ? '单行' : '多行'}输入`}
        placeholder={inputType === 'input' ? '按 Enter 发送' : 'Enter 发送，Shift+Enter 换行'}
      />
    </div>
  )
}
