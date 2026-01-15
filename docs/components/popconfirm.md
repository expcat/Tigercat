# Popconfirm

弹出确认组件，用于在执行敏感操作时向用户确认。相比 Modal，Popconfirm 更轻量，适用于简单的确认场景。

## 基本用法

### Vue 3

```vue
<template>
  <div>
    <Popconfirm title="确定要删除这条记录吗？" @confirm="handleConfirm" @cancel="handleCancel">
      <Button variant="danger">删除</Button>
    </Popconfirm>
  </div>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handleConfirm = () => {
  console.log('确认删除')
  // 执行删除操作
}

const handleCancel = () => {
  console.log('取消删除')
}
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const handleConfirm = () => {
    console.log('确认删除')
    // 执行删除操作
  }

  const handleCancel = () => {
    console.log('取消删除')
  }

  return (
    <div>
      <Popconfirm title="确定要删除这条记录吗？" onConfirm={handleConfirm} onCancel={handleCancel}>
        <Button variant="danger">删除</Button>
      </Popconfirm>
    </div>
  )
}
```

## 不同位置

通过 `placement` 属性设置弹出位置。

### Vue 3

```vue
<template>
  <div class="space-x-2">
    <Popconfirm title="确定要删除吗？" placement="top">
      <Button>上方</Button>
    </Popconfirm>

    <Popconfirm title="确定要删除吗？" placement="bottom">
      <Button>下方</Button>
    </Popconfirm>

    <Popconfirm title="确定要删除吗？" placement="left">
      <Button>左侧</Button>
    </Popconfirm>

    <Popconfirm title="确定要删除吗？" placement="right">
      <Button>右侧</Button>
    </Popconfirm>
  </div>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div className="space-x-2">
      <Popconfirm title="确定要删除吗？" placement="top">
        <Button>上方</Button>
      </Popconfirm>

      <Popconfirm title="确定要删除吗？" placement="bottom">
        <Button>下方</Button>
      </Popconfirm>

      <Popconfirm title="确定要删除吗？" placement="left">
        <Button>左侧</Button>
      </Popconfirm>

      <Popconfirm title="确定要删除吗？" placement="right">
        <Button>右侧</Button>
      </Popconfirm>
    </div>
  )
}
```

## 不同图标类型

通过 `icon` 属性设置图标类型，支持 `warning`、`info`、`error`、`success`、`question`。

### Vue 3

```vue
<template>
  <div class="space-x-2">
    <Popconfirm title="这是警告信息" icon="warning">
      <Button>警告</Button>
    </Popconfirm>

    <Popconfirm title="这是提示信息" icon="info">
      <Button>信息</Button>
    </Popconfirm>

    <Popconfirm title="这是错误信息" icon="error">
      <Button variant="danger">错误</Button>
    </Popconfirm>

    <Popconfirm title="操作成功" icon="success">
      <Button>成功</Button>
    </Popconfirm>

    <Popconfirm title="确定继续吗？" icon="question">
      <Button>疑问</Button>
    </Popconfirm>
  </div>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div className="space-x-2">
      <Popconfirm title="这是警告信息" icon="warning">
        <Button>警告</Button>
      </Popconfirm>

      <Popconfirm title="这是提示信息" icon="info">
        <Button>信息</Button>
      </Popconfirm>

      <Popconfirm title="这是错误信息" icon="error">
        <Button variant="danger">错误</Button>
      </Popconfirm>

      <Popconfirm title="操作成功" icon="success">
        <Button>成功</Button>
      </Popconfirm>

      <Popconfirm title="确定继续吗？" icon="question">
        <Button>疑问</Button>
      </Popconfirm>
    </div>
  )
}
```

## 自定义按钮文字

通过 `okText` 和 `cancelText` 属性自定义按钮文字。

### Vue 3

```vue
<template>
  <Popconfirm
    title="确定要提交这个表单吗？"
    ok-text="提交"
    cancel-text="取消"
    @confirm="handleSubmit">
    <Button>提交表单</Button>
  </Popconfirm>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handleSubmit = () => {
  console.log('表单已提交')
}
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const handleSubmit = () => {
    console.log('表单已提交')
  }

  return (
    <Popconfirm
      title="确定要提交这个表单吗？"
      okText="提交"
      cancelText="取消"
      onConfirm={handleSubmit}>
      <Button>提交表单</Button>
    </Popconfirm>
  )
}
```

## 危险操作

通过 `okType="danger"` 将确认按钮设置为危险样式。

### Vue 3

```vue
<template>
  <Popconfirm
    title="确定要删除这个用户吗？"
    description="此操作不可撤销，用户的所有数据将被永久删除。"
    icon="error"
    ok-type="danger"
    ok-text="删除"
    @confirm="handleDelete">
    <Button variant="danger">删除用户</Button>
  </Popconfirm>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handleDelete = () => {
  console.log('用户已删除')
}
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const handleDelete = () => {
    console.log('用户已删除')
  }

  return (
    <Popconfirm
      title="确定要删除这个用户吗？"
      description="此操作不可撤销，用户的所有数据将被永久删除。"
      icon="error"
      okType="danger"
      okText="删除"
      onConfirm={handleDelete}>
      <Button variant="danger">删除用户</Button>
    </Popconfirm>
  )
}
```

## 带描述信息

通过 `description` 属性添加详细描述。

### Vue 3

```vue
<template>
  <Popconfirm
    title="确定要发布这篇文章吗？"
    description="发布后，文章将对所有用户可见。"
    @confirm="handlePublish">
    <Button>发布文章</Button>
  </Popconfirm>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handlePublish = () => {
  console.log('文章已发布')
}
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const handlePublish = () => {
    console.log('文章已发布')
  }

  return (
    <Popconfirm
      title="确定要发布这篇文章吗？"
      description="发布后，文章将对所有用户可见。"
      onConfirm={handlePublish}>
      <Button>发布文章</Button>
    </Popconfirm>
  )
}
```

## 受控模式

通过 `visible` 属性控制 Popconfirm 的显示状态。

### Vue 3

```vue
<template>
  <div>
    <Popconfirm
      v-model:visible="visible"
      title="确定要执行此操作吗？"
      @confirm="handleConfirm"
      @cancel="handleCancel">
      <Button>受控弹窗</Button>
    </Popconfirm>

    <Button @click="visible = true" class="ml-2"> 外部控制打开 </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const visible = ref(false)

const handleConfirm = () => {
  console.log('确认')
  visible.value = false
}

const handleCancel = () => {
  console.log('取消')
  visible.value = false
}
</script>
```

### React

```tsx
import React, { useState } from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const [visible, setVisible] = useState(false)

  const handleConfirm = () => {
    console.log('确认')
    setVisible(false)
  }

  const handleCancel = () => {
    console.log('取消')
    setVisible(false)
  }

  return (
    <div>
      <Popconfirm
        visible={visible}
        onVisibleChange={setVisible}
        title="确定要执行此操作吗？"
        onConfirm={handleConfirm}
        onCancel={handleCancel}>
        <Button>受控弹窗</Button>
      </Popconfirm>

      <Button onClick={() => setVisible(true)} className="ml-2">
        外部控制打开
      </Button>
    </div>
  )
}
```

## 隐藏图标

通过 `showIcon={false}` 隐藏图标。

### Vue 3

```vue
<template>
  <Popconfirm title="确定要继续吗？" :show-icon="false" @confirm="handleConfirm">
    <Button>无图标</Button>
  </Popconfirm>
</template>

<script setup>
import { Popconfirm, Button } from '@expcat/tigercat-vue'

const handleConfirm = () => {
  console.log('确认')
}
</script>
```

### React

```tsx
import React from 'react'
import { Popconfirm, Button } from '@expcat/tigercat-react'

function App() {
  const handleConfirm = () => {
    console.log('确认')
  }

  return (
    <Popconfirm title="确定要继续吗？" showIcon={false} onConfirm={handleConfirm}>
      <Button>无图标</Button>
    </Popconfirm>
  )
}
```

## Props

| 属性           | 说明                       | 类型                                                                                                                                                                 | 默认值                   |
| -------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| visible        | 是否显示（受控模式）       | `boolean`                                                                                                                                                            | `undefined`              |
| defaultVisible | 默认是否显示（非受控模式） | `boolean`                                                                                                                                                            | `false`                  |
| title          | 确认框标题                 | `string`                                                                                                                                                             | `'确定要执行此操作吗？'` |
| description    | 确认框描述信息             | `string`                                                                                                                                                             | `undefined`              |
| icon           | 图标类型                   | `'warning' \| 'info' \| 'error' \| 'success' \| 'question'`                                                                                                          | `'warning'`              |
| showIcon       | 是否显示图标               | `boolean`                                                                                                                                                            | `true`                   |
| okText         | 确认按钮文字               | `string`                                                                                                                                                             | `'确定'`                 |
| cancelText     | 取消按钮文字               | `string`                                                                                                                                                             | `'取消'`                 |
| okType         | 确认按钮类型               | `'primary' \| 'danger'`                                                                                                                                              | `'primary'`              |
| placement      | 弹出位置                   | `'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end'` | `'top'`                  |
| disabled       | 是否禁用                   | `boolean`                                                                                                                                                            | `false`                  |
| className      | 自定义类名                 | `string`                                                                                                                                                             | `undefined`              |

## Events (Vue) / Callbacks (React)

### Vue 3

| 事件名         | 说明               | 回调参数             |
| -------------- | ------------------ | -------------------- |
| update:visible | 显示状态改变时触发 | `(visible: boolean)` |
| visible-change | 显示状态改变时触发 | `(visible: boolean)` |
| confirm        | 点击确认按钮时触发 | `()`                 |
| cancel         | 点击取消按钮时触发 | `()`                 |

### React

| 回调函数        | 说明               | 参数                 |
| --------------- | ------------------ | -------------------- |
| onVisibleChange | 显示状态改变时触发 | `(visible: boolean)` |
| onConfirm       | 点击确认按钮时触发 | `()`                 |
| onCancel        | 点击取消按钮时触发 | `()`                 |

## Slots (Vue) / Props (React)

### Vue 3

| 插槽名      | 说明                       |
| ----------- | -------------------------- |
| default     | 触发 Popconfirm 显示的元素 |
| title       | 自定义标题内容             |
| description | 自定义描述内容             |

### React

| 属性               | 说明                       | 类型        |
| ------------------ | -------------------------- | ----------- |
| children           | 触发 Popconfirm 显示的元素 | `ReactNode` |
| titleContent       | 自定义标题内容             | `ReactNode` |
| descriptionContent | 自定义描述内容             | `ReactNode` |

## 样式定制

Popconfirm 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题定制：

- `--tiger-surface`: 面板背景色
- `--tiger-surface-muted`: 次级/悬停背景色（用于取消按钮 hover）
- `--tiger-border`: 边框色（面板边框/箭头边框）
- `--tiger-text`: 主文本色（标题/取消按钮文字）
- `--tiger-text-muted`: 次级文本色（描述/部分 focus ring）

- `--tiger-primary`: 主按钮背景色
- `--tiger-primary-hover`: 主按钮悬停背景色

- `--tiger-error`: 危险按钮背景色（`okType="danger"`）
- `--tiger-error-hover`: 危险按钮悬停背景色（`okType="danger"`）

## 最佳实践

1. **简单确认场景**：Popconfirm 适用于简单的确认操作，如删除、提交等。对于复杂的确认场景，建议使用 Modal。

2. **危险操作提示**：对于删除、清空等危险操作，建议设置 `okType="danger"` 和 `icon="error"`，并提供详细的 `description`。

3. **合理的按钮文字**：根据具体场景自定义按钮文字，使操作意图更明确。例如删除操作使用"删除"而不是"确定"。

4. **位置选择**：根据触发元素的位置选择合适的 `placement`，避免弹出层被遮挡或超出视口。

5. **可访问性**：确保触发元素有明确的文字或 aria-label，让屏幕阅读器用户也能理解操作意图。

## 注意事项

- Popconfirm 会在点击外部区域时自动关闭
- Popconfirm 支持按 `Esc` 键关闭
- 点击确认或取消按钮后会自动关闭 Popconfirm
- 触发元素应该是一个可交互的元素（如 Button、Link 等）
- 为了可访问性，触发器会带上 `aria-haspopup="dialog"` / `aria-expanded` / `aria-controls`；弹层使用 `role="dialog"` 并通过 `aria-labelledby` / `aria-describedby` 关联标题与描述
- 不要在 Popconfirm 中嵌套另一个 Popconfirm 或 Modal
