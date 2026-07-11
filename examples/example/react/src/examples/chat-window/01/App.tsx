import { useState } from 'react'
import { ChatWindow } from '@expcat/tigercat-react/ChatWindow'
import type { ChatMessage } from '@expcat/tigercat-core'

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    content: '有什么可以帮你？',
    direction: 'other',
    user: { name: '客服' },
    time: new Date('2026-01-01T09:30:00'),
    status: 'sent'
  }
]

export default function App() {
  const [messages, setMessages] = useState(initialMessages)
  const [value, setValue] = useState('')

  const handleSend = (content: string) => {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        content,
        direction: 'self',
        user: { name: '我' },
        time: new Date(),
        status: 'sent'
      }
    ])
  }

  return (
    <ChatWindow
      className="h-96"
      messages={messages}
      value={value}
      onChange={setValue}
      onSend={handleSend}
      showTime
      placeholder="输入消息"
    />
  )
}
