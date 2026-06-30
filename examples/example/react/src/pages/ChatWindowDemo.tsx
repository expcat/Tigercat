import { useCallback, useState } from 'react'
import { ChatWindow } from '@expcat/tigercat-react/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './ChatWindowDemo.tsx?raw'

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

export default function ChatWindowDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>(baseMessages)
  const [value, setValue] = useState('')

  const [quickMessages, setQuickMessages] = useState<ChatMessage[]>(baseMessages)
  const [quickValue, setQuickValue] = useState('')

  const handleSend = useCallback(
    (text: string) => {
      const message: ChatMessage = {
        id: Date.now(),
        content: text,
        direction: 'self',
        user: { name: '我', avatar: 'https://i.pravatar.cc/40?img=5' },
        time: new Date(),
        status: 'sent'
      }
      setMessages((prev) => [...prev, message])
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            content: '已收到消息，正在处理中。',
            direction: 'other',
            user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
            time: new Date(),
            status: 'sent'
          }
        ])
      }, 600)
    },
    [setMessages]
  )

  const handleQuickSend = useCallback((text: string) => {
    const message: ChatMessage = {
      id: Date.now(),
      content: text,
      direction: 'self',
      user: { name: '我' },
      time: new Date(),
      status: 'sent'
    }
    setQuickMessages((prev) => [...prev, message])
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ChatWindow 聊天窗口</h1>
        <p className="text-gray-600 dark:text-gray-400">组合组件，用于构建完整聊天交互区域。</p>
      </div>

      <DemoBlock
        title="组合展示"
        description="合并展示 textarea 与单行 input 两种聊天输入模式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              默认 textarea 输入，支持 Shift+Enter 换行。
            </p>
            <ChatWindow
              className="h-[480px]"
              messages={messages}
              value={value}
              onChange={setValue}
              onSend={handleSend}
              showTime
              allowShiftEnter
              statusText="对方正在输入..."
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">单行输入</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              使用 input 模式，回车即可发送。
            </p>
            <ChatWindow
              className="h-[380px]"
              inputType="input"
              placeholder="输入并回车发送"
              messages={quickMessages}
              value={quickValue}
              onChange={setQuickValue}
              onSend={handleQuickSend}
              sendOnEnter
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}
