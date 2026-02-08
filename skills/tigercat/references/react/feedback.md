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
const [visible, setVisible] = useState(false)

{/* 基本用法 */}
<Drawer
  visible={visible}
  title="Title"
  placement="right"
  size="md"
  footer={<Button variant="secondary" onClick={() => setVisible(false)}>关闭</Button>}
  onClose={() => setVisible(false)}>
  <p>Drawer content</p>
</Drawer>

{/* 自定义头部 */}
<Drawer
  visible={visible}
  header={<span>⚙️ 设置</span>}
  onClose={() => setVisible(false)}>
  <p>Content</p>
</Drawer>

{/* 无蒙层 / 点击蒙层不关闭 / 隐藏关闭按钮 */}
<Drawer visible={visible} mask={false} title="无蒙层" onClose={() => setVisible(false)} />
<Drawer visible={visible} maskClosable={false} title="蒙层不可关" onClose={() => setVisible(false)} />
<Drawer visible={visible} closable={false} title="无关闭按钮" onClose={() => setVisible(false)} />

{/* 关闭时销毁内容 */}
<Drawer visible={visible} destroyOnClose title="销毁模式" onClose={() => setVisible(false)}>
  <FormContent />
</Drawer>

{/* 动画回调 */}
<Drawer
  visible={visible}
  title="动画"
  onClose={() => setVisible(false)}
  onAfterEnter={() => console.log('opened')}
  onAfterLeave={() => console.log('closed')}>
  <p>Content</p>
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
import { notification } from '@expcat/tigercat-react'

// 基本用法
notification.info('信息通知')
notification.success({ title: '操作成功', description: '操作已完成' })
notification.warning({ title: '警告', position: 'top-left' })
notification.error({ title: '失败', duration: 0, closable: true })

// 手动关闭
const close = notification.info({ title: '处理中', duration: 0 })
close()

// 清空
notification.clear()
notification.clear('top-right')
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
{/* 基本用法（默认 click 触发） */}
<Popover title="标题" content="气泡卡片内容">
  <Button>点击触发</Button>
</Popover>

{/* 自定义内容 + hover 触发 */}
<Popover
  trigger="hover"
  placement="bottom"
  titleContent={<span style={{ color: '#2563eb' }}>自定义标题</span>}
  contentContent={<div>自定义内容</div>}>
  <Button>悬停触发</Button>
</Popover>

{/* 受控模式 */}
<Popover visible={visible} onVisibleChange={setVisible} trigger="manual" content="手动控制">
  <Button onClick={() => setVisible(!visible)}>手动触发</Button>
</Popover>
```

---

## Tooltip 文字提示

```tsx
{/* 基本用法 */}
<Tooltip content="提示文字">
  <Button>Hover</Button>
</Tooltip>

{/* 不同位置 */}
<Tooltip content="底部" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>

{/* 触发方式 */}
<Tooltip content="点击触发" trigger="click">
  <Button>Click</Button>
</Tooltip>

{/* 自定义内容（ReactNode） */}
<Tooltip content={<strong>自定义内容</strong>}>
  <Button>Custom</Button>
</Tooltip>

{/* 受控模式 */}
<Tooltip visible={visible} onVisibleChange={setVisible} content="受控提示">
  <Button>Controlled</Button>
</Tooltip>

{/* 禁用 */}
<Tooltip content="禁用" disabled>
  <Button>Disabled</Button>
</Tooltip>

{/* 偏移距离 */}
<Tooltip content="偏移 16px" offset={16}>
  <Button>Offset</Button>
</Tooltip>
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
