---
name: tigercat-vue-feedback
description: Vue 3 feedback components usage
---

# Feedback Components (Vue 3)

反馈组件：Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip

> **Props Reference**: [shared/props/feedback.md](../shared/props/feedback.md) | **Patterns**: [shared/patterns/common.md](../shared/patterns/common.md)

---

## Modal 对话框

```vue
<script setup>
import { ref } from 'vue'
const visible = ref(false)
</script>

<template>
  <!-- 基本用法 -->
  <Button @click="visible = true">Open Modal</Button>
  <Modal v-model:visible="visible" title="Title" @ok="handleOk">
    <p>Modal content</p>
    <template #footer="{ ok, cancel }">
      <Button variant="secondary" @click="cancel()">Cancel</Button>
      <Button @click="ok()">OK</Button>
    </template>
  </Modal>

  <!-- 使用内置默认页脚 -->
  <Modal v-model:visible="visible" title="Title" show-default-footer
         @ok="handleOk" @cancel="handleCancel" />
</template>
```

---

## Drawer 抽屉

```vue
<script setup>
import { ref } from 'vue'
const visible = ref(false)
</script>

<template>
  <!-- 基本用法 -->
  <Drawer v-model:visible="visible" title="Title" placement="right" size="md">
    <p>Drawer content</p>
    <template #footer>
      <Button variant="secondary" @click="visible = false">关闭</Button>
    </template>
  </Drawer>

  <!-- 自定义头部 -->
  <Drawer v-model:visible="visible">
    <template #header><span>⚙️ 设置</span></template>
    <p>Content</p>
  </Drawer>

  <!-- 无蒙层 / 点击蒙层不关闭 / 隐藏关闭按钮 -->
  <Drawer v-model:visible="visible" :mask="false" title="无蒙层" />
  <Drawer v-model:visible="visible" :mask-closable="false" title="蒙层不可关" />
  <Drawer v-model:visible="visible" :closable="false" title="无关闭按钮" />

  <!-- 关闭时销毁内容 -->
  <Drawer v-model:visible="visible" :destroy-on-close="true" title="销毁模式">
    <FormContent />
  </Drawer>

  <!-- 动画回调 -->
  <Drawer v-model:visible="visible" title="动画"
          @after-enter="onOpened" @after-leave="onClosed">
    <p>Content</p>
  </Drawer>
</template>
```

---

## Message 消息提示

```vue
<script setup>
import { Message } from '@expcat/tigercat-vue'

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
</script>
```

---

## Notification 通知

```vue
<script setup>
import { notification } from '@expcat/tigercat-vue'

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
</script>
```

---

## Popconfirm 气泡确认框

```vue
<template>
  <!-- 基本用法 -->
  <Popconfirm title="确定要删除吗？" @confirm="handleConfirm">
    <Button variant="secondary">删除</Button>
  </Popconfirm>

  <!-- 危险操作 + 描述 -->
  <Popconfirm
    title="确定要删除用户吗？"
    description="此操作不可撤销。"
    icon="error"
    ok-type="danger"
    ok-text="删除"
    @confirm="handleDelete">
    <Button variant="secondary">删除用户</Button>
  </Popconfirm>

  <!-- 受控模式 -->
  <Popconfirm
    v-model:visible="showConfirm"
    title="确定继续吗？"
    @confirm="showConfirm = false"
    @cancel="showConfirm = false">
    <Button>操作</Button>
  </Popconfirm>

  <!-- 隐藏图标 / 禁用 -->
  <Popconfirm title="确认？" :show-icon="false"><Button>无图标</Button></Popconfirm>
  <Popconfirm title="已禁用" :disabled="true"><Button disabled>禁用</Button></Popconfirm>
</template>
```

---

## Popover 气泡卡片

```vue
<template>
  <!-- 基本用法（默认 click 触发） -->
  <Popover title="标题" content="气泡卡片内容">
    <Button>点击触发</Button>
  </Popover>

  <!-- 自定义内容 + hover 触发 -->
  <Popover trigger="hover" placement="bottom">
    <template #title><span style="color: #2563eb">自定义标题</span></template>
    <template #content><div>自定义内容</div></template>
    <Button>悬停触发</Button>
  </Popover>

  <!-- 受控模式 -->
  <Popover v-model:visible="visible" trigger="manual" content="手动控制">
    <Button @click="visible = !visible">手动触发</Button>
  </Popover>
</template>
```

---

## Tooltip 文字提示

```vue
<template>
  <!-- 基本用法 -->
  <Tooltip content="提示文字">
    <Button>Hover</Button>
  </Tooltip>

  <!-- 不同位置 -->
  <Tooltip content="底部" placement="bottom">
    <Button>Bottom</Button>
  </Tooltip>

  <!-- 触发方式 -->
  <Tooltip content="点击触发" trigger="click">
    <Button>Click</Button>
  </Tooltip>

  <!-- 自定义内容（slot） -->
  <Tooltip>
    <template #content>
      <strong>自定义内容</strong>
    </template>
    <Button>Custom</Button>
  </Tooltip>

  <!-- 受控模式 -->
  <Tooltip v-model:visible="visible" content="受控提示">
    <Button>Controlled</Button>
  </Tooltip>

  <!-- 禁用 -->
  <Tooltip content="禁用" disabled>
    <Button>Disabled</Button>
  </Tooltip>

  <!-- 偏移距离 -->
  <Tooltip content="偏移 16px" :offset="16">
    <Button>Offset</Button>
  </Tooltip>
</template>
```

---

## Loading 加载

```vue
<template>
  <!-- 基本用法 -->
  <Loading />
  <Loading text="加载中..." />

  <!-- 动画变体 -->
  <Loading variant="spinner" />
  <Loading variant="ring" />
  <Loading variant="dots" />
  <Loading variant="bars" />
  <Loading variant="pulse" />

  <!-- 尺寸 -->
  <Loading size="sm" />
  <Loading size="lg" />

  <!-- 颜色 -->
  <Loading color="success" />
  <Loading custom-color="#ff6b6b" />

  <!-- 全屏遮罩 -->
  <Loading v-if="loading" fullscreen text="页面加载中..." />

  <!-- 延迟显示（避免闪烁） -->
  <Loading :delay="300" text="延迟 300ms" />
</template>
```

---

## Progress 进度条

```vue
<template>
  <Progress :value="30" />
  <Progress :value="70" status="success" />
  <Progress :value="75" type="circle" />
</template>
```
