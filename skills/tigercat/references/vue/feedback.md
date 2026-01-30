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
  <Button @click="visible = true">Open Modal</Button>
  <Modal v-model:visible="visible" title="Title" @ok="handleOk">
    <p>Modal content</p>
    <template #footer="{ ok, cancel }">
      <Button variant="secondary" @click="cancel()">Cancel</Button>
      <Button @click="ok()">OK</Button>
    </template>
  </Modal>
</template>
```

---

## Drawer 抽屉

```vue
<template>
  <Drawer v-model:visible="visible" title="Title" placement="right">
    <p>Drawer content</p>
  </Drawer>
</template>
```

---

## Message 消息提示

```vue
<script setup>
import { Message } from '@expcat/tigercat-vue'

Message.success('Operation successful')
Message.error({ content: 'Error', duration: 5000 })
</script>
```

---

## Notification 通知

```vue
<script setup>
import { Notification } from '@expcat/tigercat-vue'

Notification.open({
  title: 'Title',
  description: 'Content',
  type: 'success',
  placement: 'top-right'
})
</script>
```

---

## Popconfirm 气泡确认框

```vue
<template>
  <Popconfirm title="Are you sure?" @confirm="handleConfirm">
    <Button variant="outline">Delete</Button>
  </Popconfirm>
</template>
```

---

## Popover 气泡卡片

```vue
<template>
  <Popover content="Simple content">
    <Button>Hover me</Button>
  </Popover>
  <Popover trigger="click" placement="bottom">
    <template #content><div>Custom content</div></template>
    <Button>Click me</Button>
  </Popover>
</template>
```

---

## Tooltip 文字提示

```vue
<template>
  <Tooltip content="Tooltip text">
    <Button>Hover</Button>
  </Tooltip>
</template>
```

---

## Loading 加载

```vue
<template>
  <Loading :spinning="loading" text="Loading...">
    <div>Content</div>
  </Loading>
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
