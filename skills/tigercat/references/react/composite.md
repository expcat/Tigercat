---
name: tigercat-react-composite
description: React composite components usage
---

# Composite Components (React)

组合组件：ChatWindow

> **Props Reference**: [shared/props/composite.md](../shared/props/composite.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## ChatWindow 聊天窗口

```tsx
import React, { useState } from 'react'
import { ChatWindow } from '@expcat/tigercat-react'
import type { ChatMessage } from '@expcat/tigercat-core'

export default function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: '你好，我是 Tigercat。',
      direction: 'other',
      user: { name: 'Tigercat', avatar: 'https://i.pravatar.cc/40?img=3' },
      time: new Date(),
      status: 'sent'
    }
  ])
  const [value, setValue] = useState('')

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        direction: 'self',
        user: { name: '我' },
        time: new Date(),
        status: 'sending'
      }
    ])
  }

  return (
    <ChatWindow
      value={value}
      onChange={setValue}
      onSend={handleSend}
      messages={messages}
      statusText="对方正在输入..."
      renderMessage={(message) => <span>{message.content}</span>}
    />
  )
}
```
