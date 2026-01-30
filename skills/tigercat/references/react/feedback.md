---
name: tigercat-react-feedback
description: React feedback components usage
---

# Feedback Components (React)

反馈组件：Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip

> **Props Reference**: [shared/props/feedback.md](../shared/props/feedback.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Modal 对话框

```tsx
const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Open Modal</Button>
<Modal
  open={open}
  title="Title"
  onOk={() => setOpen(false)}
  onCancel={() => setOpen(false)}
  footer={<><Button onClick={() => setOpen(false)}>OK</Button></>}>
  <p>Modal content</p>
</Modal>
```

---

## Drawer 抽屉

```tsx
<Drawer open={open} title="Title" placement="right" onClose={() => setOpen(false)}>
  <p>Drawer content</p>
</Drawer>
```

---

## Message 消息提示

```tsx
import { Message } from '@expcat/tigercat-react'

Message.success('Operation successful')
Message.error({ content: 'Error', duration: 5000 })
```

---

## Notification 通知

```tsx
import { Notification } from '@expcat/tigercat-react'

Notification.open({
  title: 'Title',
  description: 'Content',
  type: 'success',
  placement: 'top-right'
})
```

---

## Popconfirm 气泡确认框

```tsx
<Popconfirm title="Are you sure?" onConfirm={handleConfirm}>
  <Button variant="outline">Delete</Button>
</Popconfirm>
```

---

## Popover 气泡卡片

```tsx
<Popover content="Simple content"><Button>Hover me</Button></Popover>
<Popover trigger="click" placement="bottom" content={<div>Custom</div>}>
  <Button>Click me</Button>
</Popover>
```

---

## Tooltip 文字提示

```tsx
<Tooltip content="Tooltip text"><Button>Hover</Button></Tooltip>
```

---

## Loading 加载

```tsx
<Loading spinning={loading} text="Loading...">
  <div>Content</div>
</Loading>
```

---

## Progress 进度条

```tsx
<Progress value={30} />
<Progress value={70} status="success" />
<Progress value={75} type="circle" />
```
