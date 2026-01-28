---
name: tigercat-vue-feedback
description: Vue 3 feedback components - Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip
---

# Feedback Components (Vue 3)

反馈组件：Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip

## Modal 对话框

```vue
<script setup>
import { ref } from 'vue'
import { Modal, Button, Space } from '@expcat/tigercat-vue'

const visible = ref(false)
</script>

<template>
  <Button @click="visible = true">Open Modal</Button>

  <Modal v-model:visible="visible" title="Modal Title" @ok="handleOk" @cancel="handleCancel">
    <p>Modal content goes here.</p>

    <template #footer="{ ok, cancel }">
      <Space>
        <Button variant="secondary" @click="cancel()">Cancel</Button>
        <Button @click="ok()">OK</Button>
      </Space>
    </template>
  </Modal>
</template>
```

### Different Sizes

```vue
<template>
  <Modal v-model:visible="visible" title="Small Modal" size="sm">...</Modal>
  <Modal v-model:visible="visible" title="Medium Modal" size="md">...</Modal>
  <Modal v-model:visible="visible" title="Large Modal" size="lg">...</Modal>
  <Modal v-model:visible="visible" title="Extra Large" size="xl">...</Modal>
  <Modal v-model:visible="visible" title="Fullscreen" size="full">...</Modal>
</template>
```

**Props:**

| Prop              | Type                                     | Default    | Description                |
| ----------------- | ---------------------------------------- | ---------- | -------------------------- |
| visible           | `boolean`                                | `false`    | 显示状态 (v-model:visible) |
| title             | `string`                                 | -          | 标题                       |
| size              | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'`     | 尺寸                       |
| okText            | `string`                                 | `'OK'`     | 确认按钮文案               |
| cancelText        | `string`                                 | `'Cancel'` | 取消按钮文案               |
| closable          | `boolean`                                | `true`     | 显示关闭按钮               |
| maskClosable      | `boolean`                                | `true`     | 点击遮罩关闭               |
| showDefaultFooter | `boolean`                                | `false`    | 显示默认底部               |
| locale            | `{ modal: ModalLocale }`                 | -          | 国际化                     |

**Events:** `@update:visible`, `@ok`, `@cancel`, `@close`

**Slots:** `default`, `footer` (scoped: `{ ok, cancel }`)

---

## Drawer 抽屉

```vue
<script setup>
import { ref } from 'vue'
import { Drawer, Button } from '@expcat/tigercat-vue'

const visible = ref(false)
</script>

<template>
  <Button @click="visible = true">Open Drawer</Button>

  <Drawer v-model:visible="visible" title="Drawer Title" placement="right">
    <p>Drawer content</p>
  </Drawer>
</template>
```

**Props:**

| Prop         | Type                                     | Default   | Description                |
| ------------ | ---------------------------------------- | --------- | -------------------------- |
| visible      | `boolean`                                | `false`   | 显示状态 (v-model:visible) |
| title        | `string`                                 | -         | 标题                       |
| placement    | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 弹出位置                   |
| width        | `string \| number`                       | `300`     | 宽度（left/right 时）      |
| height       | `string \| number`                       | `300`     | 高度（top/bottom 时）      |
| closable     | `boolean`                                | `true`    | 显示关闭按钮               |
| maskClosable | `boolean`                                | `true`    | 点击遮罩关闭               |

**Events:** `@update:visible`, `@close`

---

## Message 消息提示

```vue
<script setup>
import { Message, Button } from '@expcat/tigercat-vue'

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
</script>

<template>
  <Button @click="showMessage">Show Messages</Button>
</template>
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

```vue
<script setup>
import { Notification, Button } from '@expcat/tigercat-vue'

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
</script>

<template>
  <Button @click="showNotification">Show Notification</Button>
</template>
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

```vue
<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handleConfirm = () => {
  console.log('Confirmed')
}
</script>

<template>
  <Popconfirm title="Are you sure to delete this?" @confirm="handleConfirm" @cancel="handleCancel">
    <Button variant="outline">Delete</Button>
  </Popconfirm>
</template>
```

**Props:**

| Prop       | Type                                     | Default    | Description  |
| ---------- | ---------------------------------------- | ---------- | ------------ |
| title      | `string`                                 | -          | 确认标题     |
| okText     | `string`                                 | `'OK'`     | 确认按钮文案 |
| cancelText | `string`                                 | `'Cancel'` | 取消按钮文案 |
| placement  | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`    | 弹出位置     |

**Events:** `@confirm`, `@cancel`

---

## Popover 气泡卡片

```vue
<script setup>
import { Popover, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Popover content="Popover content">
    <Button>Hover me</Button>
  </Popover>

  <Popover trigger="click" placement="bottom">
    <template #content>
      <div>
        <h4>Title</h4>
        <p>Custom content</p>
      </div>
    </template>
    <Button>Click me</Button>
  </Popover>
</template>
```

**Props:**

| Prop      | Type                                     | Default   | Description |
| --------- | ---------------------------------------- | --------- | ----------- |
| content   | `string`                                 | -         | 内容        |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` | 触发方式    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   | 位置        |

**Slots:** `default` (触发元素), `content`

---

## Tooltip 文字提示

```vue
<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Tooltip content="Tooltip text">
    <Button>Hover me</Button>
  </Tooltip>

  <Tooltip content="Bottom tooltip" placement="bottom">
    <Button>Bottom</Button>
  </Tooltip>
</template>
```

**Props:**

| Prop      | Type                                     | Default   | Description |
| --------- | ---------------------------------------- | --------- | ----------- |
| content   | `string`                                 | -         | 提示内容    |
| placement | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`   | 位置        |
| trigger   | `'hover' \| 'click' \| 'focus'`          | `'hover'` | 触发方式    |

---

## Loading 加载

```vue
<script setup>
import { ref } from 'vue'
import { Loading } from '@expcat/tigercat-vue'

const loading = ref(true)
</script>

<template>
  <Loading :spinning="loading">
    <div>Content to be masked</div>
  </Loading>

  <Loading :spinning="loading" text="Loading...">
    <div>Content</div>
  </Loading>
</template>
```

**Props:**

| Prop     | Type      | Default | Description |
| -------- | --------- | ------- | ----------- |
| spinning | `boolean` | `false` | 加载状态    |
| text     | `string`  | -       | 加载文案    |

---

## Progress 进度条

```vue
<script setup>
import { Progress } from '@expcat/tigercat-vue'
</script>

<template>
  <Progress :value="30" />
  <Progress :value="70" status="success" />
  <Progress :value="50" status="error" />

  <!-- Circle -->
  <Progress :value="75" type="circle" />

  <!-- Without text -->
  <Progress :value="60" :show-text="false" />
</template>
```

**Props:**

| Prop        | Type                               | Default    | Description    |
| ----------- | ---------------------------------- | ---------- | -------------- |
| value       | `number`                           | `0`        | 进度值 (0-100) |
| type        | `'line' \| 'circle'`               | `'line'`   | 类型           |
| status      | `'normal' \| 'success' \| 'error'` | `'normal'` | 状态           |
| showText    | `boolean`                          | `true`     | 显示进度文本   |
| strokeWidth | `number`                           | `8`        | 线条宽度       |
