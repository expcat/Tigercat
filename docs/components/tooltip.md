# Tooltip

气泡提示组件，用于显示简洁的文本提示信息。当用户需要对某个元素进行说明或提供额外信息时使用。

## 基本用法

### Vue 3

```vue
<template>
  <div>
    <Tooltip content="这是一个气泡提示">
      <Button>悬停显示提示</Button>
    </Tooltip>
  </div>
</template>

<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div>
      <Tooltip content="这是一个气泡提示">
        <Button>悬停显示提示</Button>
      </Tooltip>
    </div>
  )
}
```

## 多种方向

通过 `placement` 属性设置气泡提示的显示位置。

### Vue 3

```vue
<template>
  <div class="grid grid-cols-3 gap-4 p-8">
    <div class="flex justify-center">
      <Tooltip content="顶部提示" placement="top">
        <Button>Top</Button>
      </Tooltip>
    </div>

    <div class="flex justify-center">
      <Tooltip content="底部提示" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
    </div>

    <div class="flex justify-center">
      <Tooltip content="左侧提示" placement="left">
        <Button>Left</Button>
      </Tooltip>
    </div>

    <div class="flex justify-center">
      <Tooltip content="右侧提示" placement="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  </div>
</template>

<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      <div className="flex justify-center">
        <Tooltip content="顶部提示" placement="top">
          <Button>Top</Button>
        </Tooltip>
      </div>

      <div className="flex justify-center">
        <Tooltip content="底部提示" placement="bottom">
          <Button>Bottom</Button>
        </Tooltip>
      </div>

      <div className="flex justify-center">
        <Tooltip content="左侧提示" placement="left">
          <Button>Left</Button>
        </Tooltip>
      </div>

      <div className="flex justify-center">
        <Tooltip content="右侧提示" placement="right">
          <Button>Right</Button>
        </Tooltip>
      </div>
    </div>
  )
}
```

## 触发方式

支持 `hover`（默认）、`click`、`focus` 三种触发方式。

### Vue 3

```vue
<template>
  <div class="flex gap-4">
    <Tooltip content="悬停触发（默认）" trigger="hover">
      <Button>Hover</Button>
    </Tooltip>

    <Tooltip content="点击触发" trigger="click">
      <Button>Click</Button>
    </Tooltip>

    <Tooltip content="聚焦触发" trigger="focus">
      <Button>Focus</Button>
    </Tooltip>
  </div>
</template>

<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div className="flex gap-4">
      <Tooltip content="悬停触发（默认）" trigger="hover">
        <Button>Hover</Button>
      </Tooltip>

      <Tooltip content="点击触发" trigger="click">
        <Button>Click</Button>
      </Tooltip>

      <Tooltip content="聚焦触发" trigger="focus">
        <Button>Focus</Button>
      </Tooltip>
    </div>
  )
}
```

## 自定义内容

可以通过插槽（Vue）或 props（React）自定义提示内容。

### Vue 3

```vue
<template>
  <div>
    <Tooltip>
      <template #content>
        <div>
          <strong>自定义内容</strong>
          <p>这里可以包含任何内容</p>
        </div>
      </template>
      <Button>自定义提示</Button>
    </Tooltip>
  </div>
</template>

<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div>
      <Tooltip
        content={
          <div>
            <strong>自定义内容</strong>
            <p>这里可以包含任何内容</p>
          </div>
        }>
        <Button>自定义提示</Button>
      </Tooltip>
    </div>
  )
}
```

## 受控模式

可以通过 `visible` 属性控制气泡提示的显示和隐藏。

### Vue 3

```vue
<template>
  <div class="flex gap-4 items-center">
    <Tooltip v-model:visible="visible" content="受控的气泡提示">
      <Button>受控提示</Button>
    </Tooltip>

    <Button @click="visible = !visible">
      {{ visible ? '隐藏' : '显示' }}
    </Button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Tooltip, Button } from '@expcat/tigercat-vue'

const visible = ref(false)
</script>
```

### React

```tsx
import React, { useState } from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex gap-4 items-center">
      <Tooltip visible={visible} content="受控的气泡提示" onVisibleChange={setVisible}>
        <Button>受控提示</Button>
      </Tooltip>

      <Button onClick={() => setVisible(!visible)}>{visible ? '隐藏' : '显示'}</Button>
    </div>
  )
}
```

## 禁用状态

通过 `disabled` 属性禁用气泡提示。

### Vue 3

```vue
<template>
  <div class="flex gap-4">
    <Tooltip content="正常提示">
      <Button>正常</Button>
    </Tooltip>

    <Tooltip content="禁用提示" disabled>
      <Button>禁用</Button>
    </Tooltip>
  </div>
</template>

<script setup>
import { Tooltip, Button } from '@expcat/tigercat-vue'
</script>
```

### React

```tsx
import React from 'react'
import { Tooltip, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <div className="flex gap-4">
      <Tooltip content="正常提示">
        <Button>正常</Button>
      </Tooltip>

      <Tooltip content="禁用提示" disabled>
        <Button>禁用</Button>
      </Tooltip>
    </div>
  )
}
```

## API

### Props

| 属性           | 说明                         | 类型                                                                                                                                                                 | 默认值    |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| content        | 提示内容                     | Vue: `string` / React: `ReactNode`                                                                                                                                   | -         |
| trigger        | 触发方式                     | `'hover' \| 'click' \| 'focus' \| 'manual'`                                                                                                                          | `'hover'` |
| placement      | 气泡提示显示位置             | `'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end'` | `'top'`   |
| visible        | 是否显示气泡提示（受控模式） | `boolean`                                                                                                                                                            | -         |
| defaultVisible | 默认是否显示（非受控模式）   | `boolean`                                                                                                                                                            | `false`   |
| disabled       | 是否禁用                     | `boolean`                                                                                                                                                            | `false`   |
| className      | 自定义类名                   | `string`                                                                                                                                                             | -         |
| style          | 自定义样式                   | Vue: `Record<string, string \| number>` / React: `CSSProperties`                                                                                                     | -         |

### Events (Vue)

| 事件名         | 说明               | 回调参数                     |
| -------------- | ------------------ | ---------------------------- |
| update:visible | 显示状态改变时触发 | `(visible: boolean) => void` |
| visible-change | 显示状态改变时触发 | `(visible: boolean) => void` |

### Events (React)

| 属性            | 说明                 | 类型                         |
| --------------- | -------------------- | ---------------------------- |
| onVisibleChange | 显示状态改变时的回调 | `(visible: boolean) => void` |

### Slots (Vue)

| 插槽名  | 说明               |
| ------- | ------------------ |
| default | 触发气泡提示的元素 |
| content | 自定义提示内容     |

### Children (React)

| 属性     | 说明               | 类型        |
| -------- | ------------------ | ----------- |
| children | 触发气泡提示的元素 | `ReactNode` |
| content  | 自定义提示内容     | `ReactNode` |

## 样式定制

Tooltip 组件使用 Tailwind CSS 实现样式，支持通过 CSS 变量进行主题配置。

### 主题变量

- `--tiger-tooltip-bg`：提示背景色（默认 `#111827`）
- `--tiger-tooltip-text`：提示文字色（默认 `#ffffff`）

### CSS 类

也可以通过覆盖相应的 CSS 类来自定义样式：

- `.tiger-tooltip` - 气泡提示容器
- `.tiger-tooltip-trigger` - 触发元素容器
- `.tiger-tooltip-content` - 提示内容

## 与 Popover 的区别

- **Tooltip**：用于显示简洁的文本提示，通常由 hover 触发，样式简单轻量
- **Popover**：用于显示更复杂的内容，支持标题、可包含交互元素，样式更丰富

## 可访问性

- 组件支持键盘导航
- 支持 focus 触发方式，适配键盘用户
- 建议为触发元素添加适当的 ARIA 属性以提升可访问性

## 最佳实践

1. 提示内容应简洁明了，避免过长的文本
2. 默认使用 hover 触发，适合大多数场景
3. 对于需要用户确认的操作，建议使用 Popconfirm
4. 对于复杂内容展示，建议使用 Popover
5. 确保触发元素有足够的可交互区域
