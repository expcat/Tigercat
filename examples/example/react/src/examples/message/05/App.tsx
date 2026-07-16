import { useState } from 'react'
import type { MessageInstance } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { MessageContainer } from '@expcat/tigercat-react/MessageContainer'

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

export default function MessageContainerExample() {
  const [messages, setMessages] = useState<MessageInstance[]>(createMessages)

  const removeMessage = (id: string | number) => {
    setMessages((current) => current.filter((message) => message.id !== id))
  }

  return (
    <div style={{ minHeight: 180 }}>
      <div className="flex items-center justify-end gap-3">
        <span role="status" className="text-sm text-gray-500">
          当前 {messages.length} 条
        </span>
        <Button size="sm" onClick={() => setMessages(createMessages())}>
          重置消息
        </Button>
      </div>
      <MessageContainer position="bottom-left" messages={messages} onClose={removeMessage} />
    </div>
  )
}
