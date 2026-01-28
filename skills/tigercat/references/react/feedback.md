---
name: tigercat-react-feedback
description: React feedback components - Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip
---

# Feedback Components (React)

反馈组件：Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip

## Modal 对话框

```tsx
import { useState } from 'react'
import { Modal, Button, Space } from '@expcat/tigercat-react'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>

      <Modal
        open={open}
        title="Modal Title"
        onOk={() => {
          console.log('OK clicked')
          setOpen(false)
        }}
        onCancel={() => setOpen(false)}
        footer={
          <Space>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </Space>
        }>
        <p>Modal content goes here.</p>
      </Modal>
    </>
  )
}
```

### Different Sizes

```tsx
<Modal open={open} title="Small Modal" size="sm" onCancel={() => setOpen(false)}>...</Modal>
<Modal open={open} title="Medium Modal" size="md" onCancel={() => setOpen(false)}>...</Modal>
<Modal open={open} title="Large Modal" size="lg" onCancel={() => setOpen(false)}>...</Modal>
<Modal open={open} title="Extra Large" size="xl" onCancel={() => setOpen(false)}>...</Modal>
<Modal open={open} title="Fullscreen" size="full" onCancel={() => setOpen(false)}>...</Modal>
```

**Props:**

| Prop         | Type                                     | Default    | Description  |
| ------------ | ---------------------------------------- | ---------- | ------------ |
| open         | `boolean`                                | `false`    | 显示状态     |
| title        | `string`                                 | -          | 标题         |
| size         | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`     | 尺寸         |
| okText       | `string`                                 | `'OK'`     | 确认按钮文案 |
| cancelText   | `string`                                 | `'Cancel'` | 取消按钮文案 |
| closable     | `boolean`                                | `true`     | 显示关闭按钮 |
| maskClosable | `boolean`                                | `true`     | 点击遮罩关闭 |
| footer       | `ReactNode`                              | -          | 自定义底部   |
| locale       | `{ modal: ModalLocale }`                 | -          | 国际化       |

**Callbacks:** `onOk`, `onCancel`

---

## Drawer 抽屉

```tsx
import { useState } from 'react'
import { Drawer, Button } from '@expcat/tigercat-react'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>

      <Drawer open={open} title="Drawer Title" placement="right" onClose={() => setOpen(false)}>
        <p>Drawer content</p>
      </Drawer>
    </>
  )
}
```

**Props:**

| Prop         | Type                                     | Default   | Description           |
| ------------ | ---------------------------------------- | --------- | --------------------- |
| open         | `boolean`                                | `false`   | 显示状态              |
| title        | `string`                                 | -         | 标题                  |
| placement    | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 弹出位置              |
| width        | `string \| number`                       | `300`     | 宽度（left/right 时） |
| height       | `string \| number`                       | `300`     | 高度（top/bottom 时） |
| closable     | `boolean`                                | `true`    | 显示关闭按钮          |
| maskClosable | `boolean`                                | `true`    | 点击遮罩关闭          |

**Callbacks:** `onClose`

---

## Message 消息提示

```tsx
import { Message, Button } from '@expcat/tigercat-react'

function App() {
  const showMessage = () => {
    Message.success('Operation successful')
    Message.error('Operation failed')
    Message.info('Information')
    Message.warning('Warning message')
  }

  const showWithDuration = () => {
    Message.success({
      content: 'This will close after 5 seconds',
      duration: 5000
    })
  }

  return <Button onClick={showMessage}>Show Messages</Button>
}
```

**API Methods:**

| Method                                | Description |
| ------------------------------------- | ----------- |
| `Message.success(content \| options)` | 成功提示    |
| `Message.error(content \| options)`   | 错误提示    |
| `Message.info(content \| options)`    | 信息提示    |
| `Message.warning(content \| options)` | 警告提示    |

**Options:**

| Option   | Type     | Default | Description    |
| -------- | -------- | ------- | -------------- |
| content  | `string` | -       | 消息内容       |
| duration | `number` | `3000`  | 显示时长（ms） |

---

## Notification 通知

```tsx
import { Notification, Button } from '@expcat/tigercat-react'

function App() {
  const showNotification = () => {
    Notification.open({
      title: 'Notification Title',
      description: 'This is the notification content',
      type: 'success'
    })
  }

  const showWithPlacement = () => {
    Notification.open({
      title: 'Top Right',
      description: 'Placed at top right',
      placement: 'top-right'
    })
  }

  return <Button onClick={showNotification}>Show Notification</Button>
}
```

**API Methods:**

| Method                          | Description |
| ------------------------------- | ----------- |
| `Notification.open(options)`    | 打开通知    |
| `Notification.success(options)` | 成功通知    |
| `Notification.error(options)`   | 错误通知    |
| `Notification.info(options)`    | 信息通知    |
| `Notification.warning(options)` | 警告通知    |

**Options:**

| Option      | Type                                                           | Default       | Description |
| ----------- | -------------------------------------------------------------- | ------------- | ----------- |
| title       | `string`                                                       | -             | 标题        |
| description | `string`                                                       | -             | 描述        |
| type        | `'success' \| 'error' \| 'info' \| 'warning'`                  | -             | 类型        |
| duration    | `number`                                                       | `4500`        | 显示时长    |
| placement   | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | 位置        |

---

## Popconfirm 气泡确认框

```tsx
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <Popconfirm
      title="Are you sure to delete this?"
      onConfirm={() => console.log('Confirmed')}
      onCancel={() => console.log('Cancelled')}>
      <Button variant="outline">Delete</Button>
    </Popconfirm>
  )
}
```

**Props:**

| Prop       | Type                                     | Default    | Description  |
| ---------- | ---------------------------------------- | ---------- | ------------ |
| title      | `string`                                 | -          | 确认标题     |
| okText     | `string`                                 | `'OK'`     | 确认按钮文案 |
| cancelText | `string`                                 | `'Cancel'` | 取消按钮文案 |
| placement  | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`    | 弹出位置     |

**Callbacks:** `onConfirm`, `onCancel`

---

## Popover 气泡卡片

```tsx
import { Popover, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Popover content="Popover content">
        <Button>Hover me</Button>
      </Popover>

      <Popover
        trigger="click"
        placement="bottom"
        content={
          <div>
            <h4>Title</h4>
            <p>Custom content</p>
          </div>
        }>
        <Button>Click me</Button>
      </Popover>
    </>
  )
}
```

**Props:**

| Prop      | Type                                     | Default   | Description |
| --------- | ---------------------------------------- | --------- | ----------- |
| content   | `ReactNode`                              | -         | 内容        |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` | 触发方式    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   | 位置        |

---

## Tooltip 文字提示

```tsx
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Tooltip content="Tooltip text">
        <Button>Hover me</Button>
      </Tooltip>

      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
    </>
  )
}
```

**Props:**

| Prop      | Type                                     | Default   | Description |
| --------- | ---------------------------------------- | --------- | ----------- |
| content   | `string`                                 | -         | 提示内容    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   | 位置        |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` | 触发方式    |

---

## Loading 加载

```tsx
import { useState } from 'react'
import { Loading } from '@expcat/tigercat-react'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Loading spinning={loading}>
        <div>Content to be masked</div>
      </Loading>

      <Loading spinning={loading} text="Loading...">
        <div>Content</div>
      </Loading>
    </>
  )
}
```

**Props:**

| Prop     | Type      | Default | Description |
| -------- | --------- | ------- | ----------- |
| spinning | `boolean` | `false` | 加载状态    |
| text     | `string`  | -       | 加载文案    |

---

## Progress 进度条

```tsx
import { Progress } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Progress value={30} />
      <Progress value={70} status="success" />
      <Progress value={50} status="error" />

      {/* Circle */}
      <Progress value={75} type="circle" />

      {/* Without text */}
      <Progress value={60} showText={false} />
    </>
  )
}
```

**Props:**

| Prop        | Type                               | Default    | Description    |
| ----------- | ---------------------------------- | ---------- | -------------- |
| value       | `number`                           | `0`        | 进度值 (0-100) |
| type        | `'line' \| 'circle'`               | `'line'`   | 类型           |
| status      | `'normal' \| 'success' \| 'error'` | `'normal'` | 状态           |
| showText    | `boolean`                          | `true`     | 显示进度文本   |
| strokeWidth | `number`                           | `8`        | 线条宽度       |
