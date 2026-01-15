# Button 按钮

基础的按钮组件，支持多种样式和尺寸。

## 基本用法

### Vue 3

```vue
<script setup>
import { Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Button>Default Button</Button>
  <Button variant="primary">Primary Button</Button>
  <Button variant="secondary">Secondary Button</Button>
</template>
```

### React

```tsx
import { Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Button>Default Button</Button>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </>
  )
}
```

## 按钮变体 (Variants)

Button 组件支持 5 种不同的变体：

- `primary` - 主要按钮，蓝色背景
- `secondary` - 次要按钮，灰色背景
- `outline` - 边框按钮，带蓝色边框
- `ghost` - 幽灵按钮，无背景只有文字
- `link` - 链接样式按钮，下划线效果

### Vue 3

```vue
<template>
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
</template>
```

### React

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## 按钮尺寸 (Sizes)

Button 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Button size="sm">Small Button</Button>
  <Button size="md">Medium Button</Button>
  <Button size="lg">Large Button</Button>
</template>
```

### React

```tsx
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>
<Button size="lg">Large Button</Button>
```

## 禁用状态 (Disabled)

通过 `disabled` 属性禁用按钮。

### Vue 3

```vue
<template>
  <Button disabled>Disabled Button</Button>
  <Button variant="primary" disabled>Disabled Primary</Button>
</template>
```

### React

```tsx
<Button disabled>Disabled Button</Button>
<Button variant="primary" disabled>Disabled Primary</Button>
```

## 加载状态 (Loading)

通过 `loading` 属性显示加载状态，按钮会显示一个旋转的加载图标。

### a11y 说明

- 当 `loading=true` 时，组件会默认设置 `disabled`，并添加 `aria-busy="true"` 与 `aria-disabled="true"`（除非你显式传入这些 aria 属性进行覆盖）。
- 加载图标默认带 `aria-hidden="true"`，避免被屏幕阅读器重复朗读。

### Vue 3

```vue
<template>
  <Button loading>Loading...</Button>
  <Button variant="primary" loading>Submitting...</Button>
</template>
```

### React

```tsx
<Button loading>Loading...</Button>
<Button variant="primary" loading>Submitting...</Button>

// 覆盖 aria-busy（仅当你有明确需求时）
<Button loading aria-busy="false">
  Loading...
</Button>
```

## 点击事件 (Click Event)

### Vue 3

```vue
<script setup>
import { Button } from '@expcat/tigercat-vue'

const handleClick = (event) => {
  console.log('Button clicked!', event)
}
</script>

<template>
  <Button @click="handleClick">Click Me</Button>
</template>
```

### React

```tsx
import { Button } from '@expcat/tigercat-react'

function App() {
  const handleClick = (event) => {
    console.log('Button clicked!', event)
  }

  return <Button onClick={handleClick}>Click Me</Button>
}
```

## API

### Props / 属性

| 属性      | 说明                       | 类型                                  | 默认值      | 可选值                                                               |
| --------- | -------------------------- | ------------------------------------- | ----------- | -------------------------------------------------------------------- |
| variant   | 按钮变体                   | `ButtonVariant`                       | `'primary'` | `'primary'` \| `'secondary'` \| `'outline'` \| `'ghost'` \| `'link'` |
| size      | 按钮尺寸                   | `ButtonSize`                          | `'md'`      | `'sm'` \| `'md'` \| `'lg'`                                           |
| disabled  | 是否禁用                   | `boolean`                             | `false`     | `true` \| `false`                                                    |
| loading   | 是否加载中                 | `boolean`                             | `false`     | `true` \| `false`                                                    |
| block     | 是否块级（占满父容器宽度） | `boolean`                             | `false`     | `true` \| `false`                                                    |
| type      | HTML 按钮类型              | `'button'` \| `'submit'` \| `'reset'` | `'button'`  | -                                                                    |
| className | 额外的 CSS 类名            | `string`                              | -           | -                                                                    |
| style     | 内联样式                   | `Record<string, unknown>`             | -           | -                                                                    |

#### React 专属属性

| 属性      | 说明            | 类型                                                   | 默认值     |
| --------- | --------------- | ------------------------------------------------------ | ---------- |
| onClick   | 点击事件处理器  | `(event: React.MouseEvent<HTMLButtonElement>) => void` | -          |
| type      | HTML 按钮类型   | `'button'` \| `'submit'` \| `'reset'`                  | `'button'` |
| className | 额外的 CSS 类名 | `string`                                               | -          |
| children  | 按钮内容        | `React.ReactNode`                                      | -          |

### Events / 事件 (Vue)

| 事件名 | 说明                                             | 回调参数              |
| ------ | ------------------------------------------------ | --------------------- |
| click  | 点击按钮时触发（disabled 和 loading 状态不触发） | `(event: MouseEvent)` |

### Slots / 插槽 (Vue)

| 插槽名  | 说明     |
| ------- | -------- |
| default | 按钮内容 |

## 样式定制

Button 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置，无需重新编译即可实时更改颜色。

### 主题颜色配置

Button 组件支持通过 CSS 变量自定义主题颜色，可以实现实时主题切换。

#### 使用 CSS 变量

```css
/* 默认主题 */
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;
  --tiger-secondary: #4b5563;
  --tiger-secondary-hover: #374151;
  --tiger-secondary-disabled: #9ca3af;
  --tiger-outline-bg-hover: #eff6ff;
  --tiger-ghost-bg-hover: #eff6ff;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #ff6b6b;
  --tiger-primary-hover: #ee5a52;
  --tiger-primary-disabled: #ffc9c9;
}
```

#### 使用 JavaScript API

**Vue 3:**

```vue
<script setup>
import { Button, setThemeColors } from '@expcat/tigercat-vue'

const switchTheme = () => {
  setThemeColors({
    primary: '#10b981',
    primaryHover: '#059669',
    primaryDisabled: '#6ee7b7'
  })
}
</script>

<template>
  <Button @click="switchTheme">切换主题</Button>
</template>
```

**React:**

```tsx
import { Button, setThemeColors } from '@expcat/tigercat-react'

function App() {
  const switchTheme = () => {
    setThemeColors({
      primary: '#10b981',
      primaryHover: '#059669',
      primaryDisabled: '#6ee7b7'
    })
  }

  return <Button onClick={switchTheme}>切换主题</Button>
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

### React 额外样式

React 版本的 Button 组件支持 `className` 属性，可以传入额外的 CSS 类：

```tsx
<Button className="shadow-lg">Custom Styled Button</Button>
```

## 无障碍 (Accessibility)

- 按钮在禁用或加载状态下会自动设置 `disabled` 属性
- 支持键盘导航和焦点管理
- 使用 `focus:ring` 提供清晰的焦点指示器
- 禁用状态下会阻止点击事件触发

## TypeScript 支持

Button 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { ButtonVariant, ButtonSize } from '@expcat/tigercat-core'
// Vue
import type { VueButtonProps } from '@expcat/tigercat-vue'
// React
import type { ButtonProps } from '@expcat/tigercat-react'
```

## 示例

### 表单提交按钮

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Button } from '@expcat/tigercat-vue'

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    // 提交表单逻辑
    await submitForm()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Button type="submit" :loading="loading"> Submit </Button>
  </form>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Button } from '@expcat/tigercat-react'

function FormExample() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 提交表单逻辑
      await submitForm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  )
}
```

### 按钮组

#### Vue 3

```vue
<template>
  <div class="flex gap-2">
    <Button variant="outline" @click="handleCancel">Cancel</Button>
    <Button variant="primary" @click="handleConfirm">Confirm</Button>
  </div>
</template>
```

#### React

```tsx
<div className="flex gap-2">
  <Button variant="outline" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="primary" onClick={handleConfirm}>
    Confirm
  </Button>
</div>
```
