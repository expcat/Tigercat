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
      allowShiftEnter
      messageListAriaLabel="会话消息"
      inputAriaLabel="输入消息"
      sendAriaLabel="发送消息"
      renderMessage={(message) => <span>{message.content}</span>}
    />
  )
}
```

---

## ActivityFeed 活动动态流

```tsx
import React from 'react'
import { ActivityFeed } from '@expcat/tigercat-react'
import type { ActivityGroup } from '@expcat/tigercat-core'

const groups: ActivityGroup[] = [
  {
    key: 'today',
    title: '今天',
    items: [
      {
        id: 1,
        title: '更新访问策略',
        description: '安全组策略已更新并生效。',
        time: '09:30',
        user: { name: '管理员', avatar: 'https://i.pravatar.cc/40?img=12' },
        status: { label: '已完成', variant: 'success' },
        actions: [{ label: '查看详情', href: '#' }]
      },
      {
        id: 2,
        title: '导入审计日志',
        description: '共导入 24 条记录。',
        time: '10:05',
        user: { name: '系统' },
        status: { label: '处理中', variant: 'warning' },
        actions: [{ label: '重试', href: '#' }]
      }
    ]
  },
  {
    key: 'yesterday',
    title: '昨天',
    items: [
      {
        id: 3,
        title: '发布版本 2.1',
        description: '包含安全修复与性能优化。',
        time: '16:45',
        user: { name: 'DevOps', avatar: 'https://i.pravatar.cc/40?img=6' },
        status: { label: '成功', variant: 'primary' },
        actions: [{ label: '变更记录', href: '#' }]
      }
    ]
  }
]

export default function ActivityFeedDemo() {
  return <ActivityFeed groups={groups} />
}
```
