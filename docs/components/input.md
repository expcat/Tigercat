# Input 输入框

基础的输入框组件，支持多种类型和尺寸，支持受控和非受控模式。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue'

const inputValue = ref('')
</script>

<template>
  <Input v-model="inputValue" placeholder="请输入内容" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Input } from '@expcat/tigercat-react'

function App() {
  const [value, setValue] = useState('')

  return <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="请输入内容" />
}
```

## 输入框尺寸 (Sizes)

Input 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <div class="space-y-4">
    <Input size="sm" placeholder="Small input" />
    <Input size="md" placeholder="Medium input" />
    <Input size="lg" placeholder="Large input" />
  </div>
</template>
```

### React

```tsx
<div className="space-y-4">
  <Input size="sm" placeholder="Small input" />
  <Input size="md" placeholder="Medium input" />
  <Input size="lg" placeholder="Large input" />
</div>
```

## 输入框类型 (Types)

Input 组件支持多种 HTML5 输入类型：

- `text` - 文本输入（默认）
- `password` - 密码输入
- `email` - 邮箱输入
- `number` - 数字输入
- `tel` - 电话号码输入
- `url` - URL 输入
- `search` - 搜索输入

### Vue 3

```vue
<template>
  <div class="space-y-4">
    <Input type="text" placeholder="Text input" />
    <Input type="password" placeholder="Password input" />
    <Input type="email" placeholder="Email input" />
    <Input type="number" placeholder="Number input" />
    <Input type="tel" placeholder="Phone input" />
    <Input type="url" placeholder="URL input" />
    <Input type="search" placeholder="Search input" />
  </div>
</template>
```

### React

```tsx
<div className="space-y-4">
  <Input type="text" placeholder="Text input" />
  <Input type="password" placeholder="Password input" />
  <Input type="email" placeholder="Email input" />
  <Input type="number" placeholder="Number input" />
  <Input type="tel" placeholder="Phone input" />
  <Input type="url" placeholder="URL input" />
  <Input type="search" placeholder="Search input" />
</div>
```

## 前缀与后缀 (Prefix & Suffix)

可以在输入框的前后添加图标或文本。

### Vue 3

支持通过 props 传入字符串，或通过 slots 传入复杂内容。

```vue
<template>
  <div class="space-y-4">
    <!-- 使用 props -->
    <Input prefix="￥" suffix="RMB" />

    <!-- 使用 slots -->
    <Input>
      <template #prefix>
        <span class="text-gray-500">https://</span>
      </template>
      <template #suffix>
        <span>.com</span>
      </template>
    </Input>
  </div>
</template>
```

### React

通过 `prefix` 和 `suffix` 属性传入。

```tsx
<div className="space-y-4">
  <Input prefix="￥" suffix="RMB" />

  <Input prefix={<span className="text-gray-500">https://</span>} suffix={<span>.com</span>} />
</div>
```

## 状态与校验 (Status & Validation)

通过 `status` 属性设置校验状态，支持显示错误信息。

### Vue 3

```vue
<template>
  <div class="space-y-4">
    <Input status="error" errorMessage="邮箱格式不正确" />
    <Input status="warning" placeholder="Warning status" />
    <Input status="success" placeholder="Success status" />
  </div>
</template>
```

### React

```tsx
<div className="space-y-4">
  <Input status="error" errorMessage="邮箱格式不正确" />
  <Input status="warning" placeholder="Warning status" />
  <Input status="success" placeholder="Success status" />
</div>
```

## 禁用状态 (Disabled)

通过 `disabled` 属性禁用输入框。

### Vue 3

```vue
<template>
  <Input disabled placeholder="Disabled input" />
</template>
```

### React

```tsx
<Input disabled placeholder="Disabled input" />
```

## 只读状态 (Readonly)

通过 `readonly` 属性设置输入框为只读。

### Vue 3

```vue
<template>
  <Input readonly modelValue="Readonly value" />
</template>
```

### React

```tsx
<Input readonly value="Readonly value" />
```

## 必填项 (Required)

通过 `required` 属性标记输入框为必填项。

### Vue 3

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <Input required placeholder="Required field" />
    <button type="submit">Submit</button>
  </form>
</template>
```

### React

```tsx
<form onSubmit={handleSubmit}>
  <Input required placeholder="Required field" />
  <button type="submit">Submit</button>
</form>
```

## 字符长度限制

使用 `maxLength` 和 `minLength` 属性限制输入长度。

### Vue 3

```vue
<template>
  <Input :maxLength="10" placeholder="最多输入10个字符" />
</template>
```

### React

```tsx
<Input maxLength={10} placeholder="最多输入10个字符" />
```

## 受控与非受控模式

### 受控模式 (Controlled)

在受控模式下，输入框的值由父组件控制。

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue'

const value = ref('')

const handleChange = () => {
  console.log('Value:', value.value)
}
</script>

<template>
  <Input v-model="value" @change="handleChange" />
  <p>Current value: {{ value }}</p>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Input } from '@expcat/tigercat-react'

function ControlledExample() {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value)
    console.log('Value:', e.target.value)
  }

  return (
    <>
      <Input value={value} onChange={handleChange} />
      <p>Current value: {value}</p>
    </>
  )
}
```

### 非受控模式 (Uncontrolled)

在非受控模式下，输入框自己管理状态。

#### Vue 3

在 Vue 中，如果不使用 `v-model`，组件将以非受控模式运行：

```vue
<script setup>
import { Input } from '@expcat/tigercat-vue'

const handleInput = (event) => {
  console.log('Input value:', event.target.value)
}
</script>

<template>
  <Input @input="handleInput" placeholder="Uncontrolled input" />
</template>
```

#### React

在 React 中，使用 `defaultValue` 而不是 `value` 来创建非受控组件：

```tsx
import { Input } from '@expcat/tigercat-react'

function UncontrolledExample() {
  const handleChange = (e) => {
    console.log('Value:', e.target.value)
  }

  return <Input defaultValue="Initial value" onChange={handleChange} />
}
```

## 事件处理

### Vue 3

Vue 组件支持以下事件：

```vue
<script setup>
import { Input } from '@expcat/tigercat-vue'

const handleInput = (event) => {
  console.log('Input event:', event.target.value)
}

const handleChange = (event) => {
  console.log('Change event:', event.target.value)
}

const handleFocus = (event) => {
  console.log('Input focused')
}

const handleBlur = (event) => {
  console.log('Input blurred')
}
</script>

<template>
  <Input @input="handleInput" @change="handleChange" @focus="handleFocus" @blur="handleBlur" />
</template>
```

### React

React 组件支持标准的事件处理器：

```tsx
import { Input } from '@expcat/tigercat-react'

function EventExample() {
  const handleInput = (e) => {
    console.log('Input event:', e.currentTarget.value)
  }

  const handleChange = (e) => {
    console.log('Change event:', e.target.value)
  }

  const handleFocus = (e) => {
    console.log('Input focused')
  }

  const handleBlur = (e) => {
    console.log('Input blurred')
  }

  return (
    <Input
      onInput={handleInput}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  )
}
```

## API

### Props / 属性

| 属性         | 说明             | 类型          | 默认值      | 可选值                                                                                  |
| ------------ | ---------------- | ------------- | ----------- | --------------------------------------------------------------------------------------- |
| size         | 输入框尺寸       | `InputSize`   | `'md'`      | `'sm'` \| `'md'` \| `'lg'`                                                              |
| type         | 输入框类型       | `InputType`   | `'text'`    | `'text'` \| `'password'` \| `'email'` \| `'number'` \| `'tel'` \| `'url'` \| `'search'` |
| status       | 校验状态         | `InputStatus` | `'default'` | `'default'` \| `'error'` \| `'warning'` \| `'success'`                                  |
| errorMessage | 错误提示信息     | `string`      | -           | -                                                                                       |
| placeholder  | 占位符文本       | `string`      | `''`        | -                                                                                       |
| disabled     | 是否禁用         | `boolean`     | `false`     | `true` \| `false`                                                                       |
| readonly     | 是否只读         | `boolean`     | `false`     | `true` \| `false`                                                                       |
| required     | 是否必填         | `boolean`     | `false`     | `true` \| `false`                                                                       |
| maxLength    | 最大长度         | `number`      | -           | -                                                                                       |
| minLength    | 最小长度         | `number`      | -           | -                                                                                       |
| name         | 输入框 name 属性 | `string`      | -           | -                                                                                       |
| id           | 输入框 id 属性   | `string`      | -           | -                                                                                       |
| autoComplete | 自动完成属性     | `string`      | -           | -                                                                                       |
| autoFocus    | 是否自动聚焦     | `boolean`     | `false`     | `true` \| `false`                                                                       |

#### Vue 专属属性

| 属性 | 说明 | 类型 | 默认值 |
| prefix | 前缀内容 | `string` | - |
| suffix | 后缀内容 | `string` | - |

#### React 专属属性

| 属性         | 说明              | 类型                                                           | 默认值 |
| ------------ | ----------------- | -------------------------------------------------------------- | ------ |
| value        | 输入框值（受控）  | `string \| number`                                             | -      |
| defaultValue | 默认值（非受控）  | `string \| number`                                             | -      |
| prefix       | 前缀内容          | `React.ReactNode`                                              | -      |
| suffix       | 后缀内容          | `React.ReactNode` -------------------------------------------- | ------ |
| value        | 输入框值（受控）  | `string \| number`                                             | -      |
| defaultValue | 默认值（非受控）  | `string \| number`                                             | -      |
| onInput      | Input 事件处理器  | `(event: React.FormEvent<HTMLInputElement>) => void`           | -      |
| onChange     | Change 事件处理器 | `(event: React.ChangeEvent<HTMLInputElement>) => void`         | -      |
| onFocus      | Focus 事件处理器  | `(event: React.FocusEvent<HTMLInputElement>) => void`          | -      |
| onBlur       | Blur 事件处理器   | `(event: React.FocusEvent<HTMLInputElement>) => void`          | -      |
| className    | 额外的 CSS 类名   | `string`                                                       | -      |

> React 版本同时支持透传大部分原生 `input` 属性（如 `aria-*`、`data-*`、`title` 等）。

### Events / 事件 (Vue)

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |

| # Slots / 插槽 (Vue)

| 插槽名 | 说明     |
| ------ | -------- |
| prefix | 前缀内容 |
| suffix | 后缀内容 |

##update:modelValue | 值更新时触发（v-model） | `(value: string \| number)` |
| input | 输入时触发 | `(event: Event)` |
| change | 值改变时触发 | `(event: Event)` |
| focus | 获得焦点时触发 | `(event: FocusEvent)` |
| blur | 失去焦点时触发 | `(event: FocusEvent)` |

## 样式定制

Input 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 自定义样式

#### Vue 3

可以通过传递原生属性来自定义样式：

```vue
<template>
  <Input class="shadow-lg" placeholder="Custom styled input" />
</template>
```

#### React

React 版本支持 `className` 属性：

```tsx
<Input className="shadow-lg" placeholder="Custom styled input" />
```

### 主题颜色配置

Input 组件使用主题系统中的 CSS 变量控制边框、背景、文字、占位符与聚焦态：

- `--tiger-primary`：focus ring 颜色
- `--tiger-border`：默认边框颜色
- `--tiger-surface`：默认背景色
- `--tiger-surface-muted`：disabled 背景色
- `--tiger-text`：文字颜色
- `--tiger-text-muted`：placeholder/disabled 文字颜色

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-border: #e5e7eb;
  --tiger-surface: #ffffff;
  --tiger-surface-muted: #f3f4f6;
  --tiger-text: #111827;
  --tiger-text-muted: #6b7280;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981;
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

## 无障碍 (Accessibility)

- 支持完整的键盘导航
- 禁用状态下自动添加适当的 ARIA 属性
- 支持 `required` 属性用于表单验证
- 支持 `autocomplete` 属性提升用户体验
- 使用清晰的焦点指示器（focus ring）

## TypeScript 支持

Input 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { InputProps, InputSize, InputType } from '@expcat/tigercat-core'
// Vue
import type { Input, VueInputProps } from '@expcat/tigercat-vue'
// React
import type { Input, InputProps as ReactInputProps } from '@expcat/tigercat-react'
```

## 示例

### 登录表单

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Input, Button } from '@expcat/tigercat-vue'

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    // 登录逻辑
    console.log('Login:', { email: email.value, password: password.value })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-sm">
    <div>
      <label for="email" class="block text-sm font-medium mb-1">Email</label>
      <Input id="email" v-model="email" type="email" placeholder="your@email.com" required />
    </div>
    <div>
      <label for="password" class="block text-sm font-medium mb-1">Password</label>
      <Input id="password" v-model="password" type="password" placeholder="••••••••" required />
    </div>
    <Button type="submit" :loading="loading" class="w-full"> Login </Button>
  </form>
</template>
```

#### React

```tsx
import { useState, FormEvent } from 'react'
import { Input, Button } from '@expcat/tigercat-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 登录逻辑
      console.log('Login:', { email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Login
      </Button>
    </form>
  )
}
```

### 搜索框

#### Vue 3

```vue
<script setup>
import { ref, watch } from 'vue'
import { Input } from '@expcat/tigercat-vue'

const searchQuery = ref('')

watch(searchQuery, (newQuery) => {
  console.log('Searching for:', newQuery)
  // 实现搜索逻辑
})
</script>

<template>
  <Input v-model="searchQuery" type="search" placeholder="Search..." size="lg" />
</template>
```

#### React

```tsx
import { useState, useEffect } from 'react'
import { Input } from '@expcat/tigercat-react'

function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    console.log('Searching for:', searchQuery)
    // 实现搜索逻辑
  }, [searchQuery])

  return (
    <Input
      type="search"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
      size="lg"
    />
  )
}
```
