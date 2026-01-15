# Alert 警告提示

用于页面中展示重要的提示信息，支持成功、警告、失败、信息等多种状态。

## 基本用法

### Vue 3

```vue
<script setup>
import { Alert } from '@expcat/tigercat-vue'
</script>

<template>
  <Alert title="这是一条提示信息" />
  <Alert title="成功提示" type="success" />
  <Alert title="警告提示" type="warning" />
  <Alert title="错误提示" type="error" />
</template>
```

### React

```tsx
import { Alert } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Alert title="这是一条提示信息" />
      <Alert title="成功提示" type="success" />
      <Alert title="警告提示" type="warning" />
      <Alert title="错误提示" type="error" />
    </>
  )
}
```

## 提示类型 (Types)

Alert 组件支持 4 种不同的类型：

- `info` - 信息提示（默认）
- `success` - 成功提示
- `warning` - 警告提示
- `error` - 错误提示

每种类型都有对应的图标和颜色方案。

### Vue 3

```vue
<template>
  <Alert type="info" title="信息提示" description="这是一条信息提示的详细内容" />
  <Alert type="success" title="成功提示" description="操作成功完成" />
  <Alert type="warning" title="警告提示" description="请注意相关事项" />
  <Alert type="error" title="错误提示" description="操作失败，请重试" />
</template>
```

### React

```tsx
<Alert type="info" title="信息提示" description="这是一条信息提示的详细内容" />
<Alert type="success" title="成功提示" description="操作成功完成" />
<Alert type="warning" title="警告提示" description="请注意相关事项" />
<Alert type="error" title="错误提示" description="操作失败，请重试" />
```

## 尺寸 (Sizes)

Alert 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Alert size="sm" title="小尺寸提示" />
  <Alert size="md" title="中等尺寸提示" />
  <Alert size="lg" title="大尺寸提示" />
</template>
```

### React

```tsx
<Alert size="sm" title="小尺寸提示" />
<Alert size="md" title="中等尺寸提示" />
<Alert size="lg" title="大尺寸提示" />
```

## 带图标

默认情况下，Alert 会根据类型显示对应的图标。可以通过 `showIcon` 属性控制是否显示图标。

### Vue 3

```vue
<template>
  <!-- 显示图标（默认） -->
  <Alert type="success" title="带图标的提示" :show-icon="true" />

  <!-- 隐藏图标 -->
  <Alert type="warning" title="不带图标的提示" :show-icon="false" />
</template>
```

### React

```tsx
{
  /* 显示图标（默认） */
}
;<Alert type="success" title="带图标的提示" showIcon={true} />

{
  /* 隐藏图标 */
}
;<Alert type="warning" title="不带图标的提示" showIcon={false} />
```

## 可关闭

通过设置 `closable` 属性可以让 Alert 显示关闭按钮，点击后提示会消失。

### Vue 3

```vue
<script setup>
import { Alert } from '@expcat/tigercat-vue'

const handleClose = (event) => {
  console.log('Alert closed', event)
}
</script>

<template>
  <Alert
    title="可关闭的提示"
    description="点击右侧关闭按钮可以关闭此提示"
    closable
    @close="handleClose" />
</template>
```

### React

```tsx
import { Alert } from '@expcat/tigercat-react'

function App() {
  const handleClose = (event) => {
    console.log('Alert closed', event)
  }

  return (
    <Alert
      title="可关闭的提示"
      description="点击右侧关闭按钮可以关闭此提示"
      closable
      onClose={handleClose}
    />
  )
}
```

## 带描述信息

使用 `description` 属性可以添加详细的描述内容。

### Vue 3

```vue
<template>
  <Alert
    type="success"
    title="操作成功"
    description="您的订单已成功提交，我们将尽快为您处理。订单号：202312310001" />

  <!-- 使用插槽自定义描述内容 -->
  <Alert type="warning" title="注意事项">
    <template #description>
      <p>请注意以下几点：</p>
      <ul>
        <li>请确保填写的信息准确无误</li>
        <li>操作过程中请勿关闭页面</li>
      </ul>
    </template>
  </Alert>
</template>
```

### React

```tsx
;<Alert
  type="success"
  title="操作成功"
  description="您的订单已成功提交，我们将尽快为您处理。订单号：202312310001"
/>

{
  /* 使用 descriptionSlot 自定义描述内容 */
}
;<Alert
  type="warning"
  title="注意事项"
  descriptionSlot={
    <>
      <p>请注意以下几点：</p>
      <ul>
        <li>请确保填写的信息准确无误</li>
        <li>操作过程中请勿关闭页面</li>
      </ul>
    </>
  }
/>
```

## 自定义内容

### Vue 3

可以使用默认插槽、title 插槽和 description 插槽来自定义内容。

```vue
<template>
  <!-- 使用默认插槽 -->
  <Alert type="info"> 这是通过默认插槽传入的内容 </Alert>

  <!-- 使用 title 插槽 -->
  <Alert type="success">
    <template #title>
      <strong>自定义标题</strong>
    </template>
    <template #description> 自定义描述内容 </template>
  </Alert>
</template>
```

### React

可以使用 children、titleSlot 和 descriptionSlot 属性来自定义内容。

```tsx
{
  /* 使用 children */
}
;<Alert type="info">这是通过 children 传入的内容</Alert>

{
  /* 使用自定义插槽 */
}
;<Alert
  type="success"
  titleSlot={<strong>自定义标题</strong>}
  descriptionSlot={<span>自定义描述内容</span>}
/>
```

## 完整示例

### Vue 3

```vue
<script setup>
import { Alert } from '@expcat/tigercat-vue'
import { ref } from 'vue'

const showAlert = ref(true)

const handleClose = () => {
  console.log('Alert will be closed')
}
</script>

<template>
  <div class="space-y-4">
    <!-- 基础用法 -->
    <Alert title="基础提示" />

    <!-- 不同类型 -->
    <Alert type="success" title="成功提示" />
    <Alert type="warning" title="警告提示" />
    <Alert type="error" title="错误提示" />

    <!-- 带描述 -->
    <Alert type="info" title="详细提示" description="这是一条包含详细描述信息的提示" />

    <!-- 可关闭 -->
    <Alert v-if="showAlert" type="success" title="可关闭的提示" closable @close="handleClose" />

    <!-- 完整功能 -->
    <Alert
      type="warning"
      size="lg"
      title="重要提示"
      description="这是一条重要的警告信息，请仔细阅读"
      show-icon
      closable />
  </div>
</template>
```

### React

```tsx
import { Alert } from '@expcat/tigercat-react'
import { useState } from 'react'

function App() {
  const [showAlert, setShowAlert] = useState(true)

  const handleClose = () => {
    console.log('Alert will be closed')
  }

  return (
    <div className="space-y-4">
      {/* 基础用法 */}
      <Alert title="基础提示" />

      {/* 不同类型 */}
      <Alert type="success" title="成功提示" />
      <Alert type="warning" title="警告提示" />
      <Alert type="error" title="错误提示" />

      {/* 带描述 */}
      <Alert type="info" title="详细提示" description="这是一条包含详细描述信息的提示" />

      {/* 可关闭 */}
      {showAlert && <Alert type="success" title="可关闭的提示" closable onClose={handleClose} />}

      {/* 完整功能 */}
      <Alert
        type="warning"
        size="lg"
        title="重要提示"
        description="这是一条重要的警告信息，请仔细阅读"
        showIcon
        closable
      />
    </div>
  )
}
```

## API

### Props

| 参数           | 说明                                       | 类型      | 可选值                                      | 默认值        |
| -------------- | ------------------------------------------ | --------- | ------------------------------------------- | ------------- |
| type           | 提示类型                                   | `string`  | `info` \| `success` \| `warning` \| `error` | `info`        |
| size           | 提示尺寸                                   | `string`  | `sm` \| `md` \| `lg`                        | `md`          |
| title          | 提示标题                                   | `string`  | -                                           | -             |
| description    | 提示描述                                   | `string`  | -                                           | -             |
| showIcon       | 是否显示图标                               | `boolean` | -                                           | `true`        |
| closable       | 是否可关闭                                 | `boolean` | -                                           | `false`       |
| closeAriaLabel | 关闭按钮的无障碍标签（仅 closable 时生效） | `string`  | -                                           | `Close alert` |
| className      | 自定义 CSS 类名                            | `string`  | -                                           | -             |
| style          | 自定义内联样式                             | `object`  | -                                           | -             |

### Events (Vue)

| 事件名 | 说明           | 回调参数              |
| ------ | -------------- | --------------------- |
| close  | 关闭提示时触发 | `(event: MouseEvent)` |

### Events (React)

| 属性名  | 说明             | 类型                                                   |
| ------- | ---------------- | ------------------------------------------------------ |
| onClose | 关闭提示时的回调 | `(event: React.MouseEvent<HTMLButtonElement>) => void` |

### Slots (Vue)

| 插槽名      | 说明                                           |
| ----------- | ---------------------------------------------- |
| default     | 默认内容（当没有 title 和 description 时显示） |
| title       | 自定义标题内容                                 |
| description | 自定义描述内容                                 |

### Slots (React)

| 属性名          | 说明                                           | 类型              |
| --------------- | ---------------------------------------------- | ----------------- |
| children        | 默认内容（当没有 title 和 description 时显示） | `React.ReactNode` |
| titleSlot       | 自定义标题内容                                 | `React.ReactNode` |
| descriptionSlot | 自定义描述内容                                 | `React.ReactNode` |

## 样式定制

Alert 组件支持通过 CSS Variables 覆盖不同类型的颜色（都带 fallback），无需改动组件代码。

### 类型颜色

按类型可覆盖的变量（以 `info` 为例，其他类型把前缀替换为 `success/warning/error`）：

- `--tiger-alert-info-bg`
- `--tiger-alert-info-border`
- `--tiger-alert-info-icon`
- `--tiger-alert-info-title`
- `--tiger-alert-info-description`
- `--tiger-alert-info-close`
- `--tiger-alert-info-close-hover-bg`
- `--tiger-alert-info-ring`

示例：

```css
:root {
  --tiger-alert-info-bg: #eef2ff;
  --tiger-alert-info-border: #c7d2fe;
  --tiger-alert-info-icon: #6366f1;
  --tiger-alert-info-title: #312e81;
  --tiger-alert-info-description: #3730a3;
  --tiger-alert-info-close: #6366f1;
  --tiger-alert-info-close-hover-bg: #e0e7ff;
  --tiger-alert-info-ring: #6366f1;
}
```

### 尺寸大小

- **sm（小）**: `p-3 text-sm`
- **md（中）**: `p-4 text-base`
- **lg（大）**: `p-5 text-lg`

### 自定义样式

可以通过 `className` 属性添加自定义样式：

```vue
<Alert className="my-custom-alert" title="自定义样式" />
```

## 可访问性

Alert 组件遵循 WAI-ARIA 可访问性标准：

- 使用 `role="alert"` 属性标识为警告提示
- 关闭按钮包含 `aria-label`（默认 `Close alert`，可通过 `closeAriaLabel` 覆盖）
- 图标使用 SVG 格式，具有良好的可缩放性
- 支持键盘操作（关闭按钮可通过 Tab 键聚焦）

## 注意事项

1. Alert 组件适用于页面级的提示信息，对于临时性的操作反馈建议使用 Message 或 Notification 组件
2. 关闭按钮点击后会立即隐藏 Alert，如需要动画效果可以自行实现
3. 使用 `closable` 属性时，建议配合状态管理来控制 Alert 的显示/隐藏
4. 描述内容支持较长的文本，但建议保持简洁明了
5. 自定义插槽内容时，请注意保持与组件主题的一致性
