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
const [visible, setVisible] = useState(false)

{/* 基本用法：自定义页脚 */}
<Button onClick={() => setVisible(true)}>Open Modal</Button>
<Modal
  visible={visible}
  title="Title"
  onOk={() => setVisible(false)}
  onCancel={() => setVisible(false)}
  footer={<><Button onClick={() => setVisible(false)}>OK</Button></>}>
  <p>Modal content</p>
</Modal>

{/* 使用内置默认页脚 */}
<Modal
  visible={visible}
  title="Title"
  showDefaultFooter
  onOk={() => setVisible(false)}
  onCancel={() => setVisible(false)}
/>
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

// 基本用法
Message.info('信息提示')
Message.success('操作成功')
Message.warning('警告信息')
Message.error('操作失败')

// 加载状态（默认不自动关闭）
const close = Message.loading('加载中...')
setTimeout(close, 3000)

// 完整配置
Message.success({
  content: '操作成功',
  duration: 5000,
  closable: true,
  icon: 'M5 13l4 4L19 7',
  className: 'shadow-2xl',
  onClose: () => console.log('已关闭')
})

// 清空所有消息
Message.clear()
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
{/* 基本用法 */}
<Popconfirm title="确定要删除吗？" onConfirm={handleConfirm}>
  <Button variant="secondary">删除</Button>
</Popconfirm>

{/* 危险操作 + 描述 */}
<Popconfirm
  title="确定要删除用户吗？"
  description="此操作不可撤销。"
  icon="error"
  okType="danger"
  okText="删除"
  onConfirm={handleDelete}>
  <Button variant="secondary">删除用户</Button>
</Popconfirm>

{/* 受控模式 */}
<Popconfirm
  visible={showConfirm}
  onVisibleChange={setShowConfirm}
  title="确定继续吗？">
  <Button>操作</Button>
</Popconfirm>

{/* 隐藏图标 / 禁用 */}
<Popconfirm title="确认？" showIcon={false}><Button>无图标</Button></Popconfirm>
<Popconfirm title="已禁用" disabled><Button disabled>禁用</Button></Popconfirm>
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
