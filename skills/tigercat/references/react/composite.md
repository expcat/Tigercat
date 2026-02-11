---
name: tigercat-react-composite
description: React composite components usage
---

# Composite Components (React)

组合组件：ChatWindow / ActivityFeed / CommentThread / NotificationCenter / FormWizard / DataTableWithToolbar / CropUpload

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

---

## CommentThread 评论线程

```tsx
import React from 'react'
import { CommentThread } from '@expcat/tigercat-react'
import type { CommentNode } from '@expcat/tigercat-core'

const nodes: CommentNode[] = [
  {
    id: 1,
    content: '这个功能点考虑得很周到。',
    user: { name: 'Ada', avatar: 'https://i.pravatar.cc/40?img=12', title: '产品经理' },
    time: '10:25',
    likes: 3,
    children: [
      {
        id: 2,
        parentId: 1,
        content: '赞同，尤其是回复区的设计。',
        user: { name: 'Ben', avatar: 'https://i.pravatar.cc/40?img=32' },
        time: '10:30'
      }
    ]
  }
]

export default function CommentThreadDemo() {
  return <CommentThread nodes={nodes} defaultExpandedKeys={[1]} />
}
```

---

## NotificationCenter 通知中心

```tsx
import React, { useMemo, useState } from 'react'
import { NotificationCenter } from '@expcat/tigercat-react'
import type { NotificationItem } from '@expcat/tigercat-core'

export default function NotificationCenterDemo() {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 1,
      title: '系统维护提醒',
      description: '今晚 23:00-01:00 系统维护，请提前保存工作。',
      time: '10:30',
      type: '系统',
      read: false
    },
    {
      id: 2,
      title: '评论回复',
      description: '你在「设计文档」的评论有新回复。',
      time: '09:12',
      type: '评论',
      read: true
    },
    {
      id: 3,
      title: '任务到期',
      description: '任务「月度总结」将在 2 天后到期。',
      time: '昨天',
      type: '任务',
      read: false
    }
  ])

  const handleReadChange = (item: NotificationItem, read: boolean) => {
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, read } : entry)))
  }

  const handleMarkAllRead = (
    groupKey: string | number | undefined,
    groupItems: NotificationItem[]
  ) => {
    const ids = new Set(groupItems.map((entry) => entry.id))
    setItems((prev) => prev.map((entry) => (ids.has(entry.id) ? { ...entry, read: true } : entry)))
  }

  const groupOrder = useMemo(() => ['系统', '评论', '任务'], [])

  return (
    <NotificationCenter
      items={items}
      groupOrder={groupOrder}
      onItemReadChange={handleReadChange}
      onMarkAllRead={handleMarkAllRead}
    />
  )
}
```

---

## FormWizard 表单向导

```tsx
import React, { useRef, useState } from 'react'
import {
  FormWizard,
  Form,
  FormItem,
  Input,
  type FormHandle,
  type WizardStep
} from '@expcat/tigercat-react'

const steps: WizardStep[] = [
  { title: '基本信息', description: '填写姓名与邮箱', fields: ['name', 'email'] },
  { title: '确认信息', description: '确认后提交', fields: [] }
]

export default function FormWizardDemo() {
  const [current, setCurrent] = useState(0)
  const [model, setModel] = useState({ name: '', email: '' })
  const formRef = useRef<FormHandle | null>(null)

  const handleBeforeNext = async (_current: number, step: WizardStep) => {
    const fields = step.fields ?? []
    if (fields.length === 0) {
      return true
    }
    const valid = await formRef.current?.validateFields(fields)
    return valid ?? true
  }

  return (
    <FormWizard
      steps={steps}
      current={current}
      onChange={setCurrent}
      beforeNext={handleBeforeNext}
      onFinish={() => alert('完成提交')}
      renderStep={(_step, index) => (
        <Form ref={formRef} model={model} onChange={setModel} className="w-full max-w-[520px]">
          {index === 0 ? (
            <>
              <FormItem
                name="name"
                label="姓名"
                rules={{ required: true, message: '请输入姓名' }}
                showMessage={false}>
                <Input
                  value={model.name}
                  onChange={(event) => setModel((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="请输入姓名"
                />
              </FormItem>
              <FormItem
                name="email"
                label="邮箱"
                rules={{ required: true, message: '请输入邮箱' }}
                showMessage={false}>
                <Input
                  value={model.email}
                  onChange={(event) => setModel((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="请输入邮箱"
                />
              </FormItem>
            </>
          ) : (
            <div className="text-sm text-gray-600">请确认信息无误后完成提交。</div>
          )}
        </Form>
      )}
    />
  )
}
```

---

## DataTableWithToolbar 表格工具栏

```tsx
import React, { useMemo, useState } from 'react'
import {
  DataTableWithToolbar,
  type TableColumn,
  type TableToolbarFilterValue
} from '@expcat/tigercat-react'

interface UserRow extends Record<string, unknown> {
  id: number
  name: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
}

const columns: TableColumn<UserRow>[] = [
  { key: 'name', title: '姓名' },
  { key: 'role', title: '角色' },
  { key: 'status', title: '状态' }
]

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'disabled' }
]

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑', value: 'editor' },
  { label: '访客', value: 'viewer' }
]

const data: UserRow[] = [
  { id: 1, name: 'A', role: 'admin', status: 'active' },
  { id: 2, name: 'B', role: 'editor', status: 'disabled' }
]

export default function DataTableWithToolbarDemo() {
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<Record<string, TableToolbarFilterValue>>({
    status: null,
    role: null
  })
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchKeyword = !keyword || item.name.includes(keyword)
      const matchStatus = !filters.status || item.status === filters.status
      const matchRole = !filters.role || item.role === filters.role
      return matchKeyword && matchStatus && matchRole
    })
  }, [keyword, filters])

  return (
    <DataTableWithToolbar<UserRow>
      columns={columns}
      dataSource={filtered}
      toolbar={{
        searchValue: keyword,
        searchPlaceholder: '搜索姓名',
        filters: [
          { key: 'status', label: '状态', options: statusOptions },
          { key: 'role', label: '角色', options: roleOptions }
        ]
      }}
      onSearchChange={setKeyword}
      onSearch={setKeyword}
      onFiltersChange={setFilters}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: filtered.length,
        showTotal: true
      }}
      onPageChange={(current, pageSize) => setPagination({ current, pageSize })}
      onPageSizeChange={(current, pageSize) => setPagination({ current, pageSize })}
    />
  )
}
```

---

## CropUpload 裁剪上传

```tsx
import { CropUpload } from '@expcat/tigercat-react'

function handleCrop(result) {
  console.log(result.blob, result.dataURL)
  // 可配合上传逻辑使用 result.blob
}

{
  /* 基本用法 */
}
;<CropUpload onCropComplete={handleCrop} />

{
  /* 指定宽高比 */
}
;<CropUpload aspectRatio={1} onCropComplete={handleCrop} />

{
  /* 自定义触发按钮 */
}
;<CropUpload onCropComplete={handleCrop}>
  <span>上传头像</span>
</CropUpload>

{
  /* 禁用 */
}
;<CropUpload disabled />
```
