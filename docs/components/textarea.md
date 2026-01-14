# Textarea 多行文本框

多行文本输入组件，支持受控/非受控模式、自动高度调整和字符计数等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Textarea } from '@tigercat/vue'

const text = ref('')
</script>

<template>
  <Textarea v-model="text" placeholder="请输入内容..." />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Textarea } from '@tigercat/react'

function App() {
  const [text, setText] = useState('')

  return (
    <Textarea
      value={text}
      onInput={(e) => setText(e.currentTarget.value)}
      placeholder="请输入内容..."
    />
  )
}
```

## 尺寸 (Sizes)

Textarea 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Textarea size="sm" placeholder="Small textarea" />
  <Textarea size="md" placeholder="Medium textarea" />
  <Textarea size="lg" placeholder="Large textarea" />
</template>
```

### React

```tsx
<Textarea size="sm" placeholder="Small textarea" />
<Textarea size="md" placeholder="Medium textarea" />
<Textarea size="lg" placeholder="Large textarea" />
```

## 行数设置

通过 `rows` 属性设置可见的文本行数。

### Vue 3

```vue
<template>
  <Textarea :rows="5" placeholder="5 行高度" />
  <Textarea :rows="10" placeholder="10 行高度" />
</template>
```

### React

```tsx
<Textarea rows={5} placeholder="5 行高度" />
<Textarea rows={10} placeholder="10 行高度" />
```

## 自动高度

通过 `autoResize` 属性启用自动高度调整，文本框会根据内容自动调整高度。可以配合 `minRows` 和 `maxRows` 限制高度范围。

### Vue 3

```vue
<template>
  <!-- 基础自动高度 -->
  <Textarea autoResize placeholder="自动调整高度..." />

  <!-- 限制最小和最大行数 -->
  <Textarea autoResize :minRows="3" :maxRows="10" placeholder="最少 3 行，最多 10 行" />
</template>
```

### React

```tsx
{
  /* 基础自动高度 */
}
;<Textarea autoResize placeholder="自动调整高度..." />

{
  /* 限制最小和最大行数 */
}
;<Textarea autoResize minRows={3} maxRows={10} placeholder="最少 3 行，最多 10 行" />
```

## 字符计数

通过 `showCount` 属性显示字符计数，可以配合 `maxLength` 限制最大字符数。

### Vue 3

```vue
<template>
  <!-- 仅显示字符数 -->
  <Textarea showCount placeholder="显示字符数..." />

  <!-- 限制最大字符数 -->
  <Textarea showCount :maxLength="100" placeholder="最多 100 个字符" />
</template>
```

### React

```tsx
{
  /* 仅显示字符数 */
}
;<Textarea showCount placeholder="显示字符数..." />

{
  /* 限制最大字符数 */
}
;<Textarea showCount maxLength={100} placeholder="最多 100 个字符" />
```

## 禁用和只读状态

### Vue 3

```vue
<template>
  <!-- 禁用状态 -->
  <Textarea disabled placeholder="禁用状态" />

  <!-- 只读状态 -->
  <Textarea readonly modelValue="只读内容，无法编辑" />
</template>
```

### React

```tsx
{
  /* 禁用状态 */
}
;<Textarea disabled placeholder="禁用状态" />

{
  /* 只读状态 */
}
;<Textarea readonly value="只读内容，无法编辑" />
```

## 受控与非受控模式

### Vue 3

Vue 3 版本使用 `v-model` 进行双向绑定，始终是受控模式。

```vue
<script setup>
import { ref } from 'vue'
import { Textarea } from '@tigercat/vue'

const text = ref('初始内容')

const handleInput = (event) => {
  console.log('当前值:', event.target.value)
}
</script>

<template>
  <Textarea v-model="text" @input="handleInput" />
</template>
```

### React

React 版本支持受控和非受控两种模式。

#### 受控模式

```tsx
import { useState } from 'react'
import { Textarea } from '@tigercat/react'

function ControlledExample() {
  const [text, setText] = useState('初始内容')

  return <Textarea value={text} onInput={(e) => setText(e.currentTarget.value)} />
}
```

#### 非受控模式

```tsx
import { useRef } from 'react'
import { Textarea } from '@tigercat/react'

function UncontrolledExample() {
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    console.log('值:', textareaRef.current?.value)
  }

  return (
    <>
      <Textarea ref={textareaRef} defaultValue="初始内容" />
      <button onClick={handleSubmit}>提交</button>
    </>
  )
}
```

## 事件处理

### Vue 3

```vue
<script setup>
import { Textarea } from '@tigercat/vue'

const handleInput = (event) => {
  console.log('Input:', event.target.value)
}

const handleChange = (event) => {
  console.log('Change:', event.target.value)
}

const handleFocus = (event) => {
  console.log('Focus')
}

const handleBlur = (event) => {
  console.log('Blur')
}
</script>

<template>
  <Textarea @input="handleInput" @change="handleChange" @focus="handleFocus" @blur="handleBlur" />
</template>
```

### React

```tsx
import { Textarea } from '@tigercat/react'

function EventExample() {
  const handleInput = (event) => {
    console.log('Input:', event.currentTarget.value)
  }

  const handleChange = (event) => {
    console.log('Change:', event.currentTarget.value)
  }

  const handleFocus = (event) => {
    console.log('Focus')
  }

  const handleBlur = (event) => {
    console.log('Blur')
  }

  return (
    <Textarea
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

| 属性         | 说明                 | 类型           | 默认值  | 可选值                     |
| ------------ | -------------------- | -------------- | ------- | -------------------------- |
| size         | 文本框尺寸           | `TextareaSize` | `'md'`  | `'sm'` \| `'md'` \| `'lg'` |
| disabled     | 是否禁用             | `boolean`      | `false` | `true` \| `false`          |
| readonly     | 是否只读             | `boolean`      | `false` | `true` \| `false`          |
| required     | 是否必填             | `boolean`      | `false` | `true` \| `false`          |
| placeholder  | 占位符文本           | `string`       | `''`    | -                          |
| rows         | 可见文本行数         | `number`       | `3`     | -                          |
| autoResize   | 启用自动高度调整     | `boolean`      | `false` | `true` \| `false`          |
| maxRows      | 自动高度时的最大行数 | `number`       | -       | -                          |
| minRows      | 自动高度时的最小行数 | `number`       | -       | -                          |
| maxLength    | 最大字符数           | `number`       | -       | -                          |
| minLength    | 最小字符数           | `number`       | -       | -                          |
| name         | 表单字段名称         | `string`       | -       | -                          |
| id           | 元素 ID              | `string`       | -       | -                          |
| autoComplete | 原生 autocomplete    | `string`       | -       | -                          |
| autoFocus    | 是否自动聚焦         | `boolean`      | `false` | `true` \| `false`          |
| showCount    | 显示字符计数         | `boolean`      | `false` | `true` \| `false`          |

#### Vue 专属属性

| 属性       | 说明                                   | 类型                               | 默认值 |
| ---------- | -------------------------------------- | ---------------------------------- | ------ |
| modelValue | 绑定值（v-model）                      | `string`                           | `''`   |
| className  | 额外的 CSS 类名（与 attrs.class 合并） | `string`                           | -      |
| style      | 内联样式（与 attrs.style 合并）        | `Record<string, string \| number>` | -      |

#### React 专属属性

| 属性         | 说明               | 类型                                                      | 默认值 |
| ------------ | ------------------ | --------------------------------------------------------- | ------ |
| value        | 受控模式的值       | `string`                                                  | -      |
| defaultValue | 非受控模式的默认值 | `string`                                                  | -      |
| onInput      | Input 事件处理器   | `(event: React.FormEvent<HTMLTextAreaElement>) => void`   | -      |
| onChange     | Change 事件处理器  | `(event: React.ChangeEvent<HTMLTextAreaElement>) => void` | -      |
| onFocus      | Focus 事件处理器   | `(event: React.FocusEvent<HTMLTextAreaElement>) => void`  | -      |
| onBlur       | Blur 事件处理器    | `(event: React.FocusEvent<HTMLTextAreaElement>) => void`  | -      |
| className    | 额外的 CSS 类名    | `string`                                                  | -      |

### Events / 事件 (Vue)

| 事件名            | 说明                    | 回调参数              |
| ----------------- | ----------------------- | --------------------- |
| update:modelValue | 值更新时触发（v-model） | `(value: string)`     |
| input             | 输入时触发              | `(event: Event)`      |
| change            | 值改变时触发            | `(event: Event)`      |
| focus             | 获得焦点时触发          | `(event: FocusEvent)` |
| blur              | 失去焦点时触发          | `(event: FocusEvent)` |

## 样式定制

Textarea 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Textarea 组件的基础样式使用与 Input 相同的一组主题变量（含 fallback）：

- `--tiger-border`（边框）
- `--tiger-surface`（背景）
- `--tiger-surface-muted`（禁用背景）
- `--tiger-text`（文字）
- `--tiger-text-muted`（placeholder/禁用文字）
- `--tiger-primary`（focus ring）

```css
:root {
  --tiger-primary: #2563eb;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981;
}
```

### React 额外样式

React 版本的 Textarea 组件支持 `className` 属性，可以传入额外的 CSS 类：

````tsx
<Textarea className="shadow-lg" />

### Vue 额外样式

Vue 版本支持 `className`/`style`（并与原生 attrs 的 `class/style` 合并）：

```vue
<Textarea className="shadow-lg" :style="{ minHeight: '120px' }" />
````

````

## 无障碍 (Accessibility)

- 禁用状态下会自动设置 `disabled` 属性
- 只读状态下会自动设置 `readonly` 属性
- 支持键盘导航和焦点管理
- 使用 `focus:ring` 提供清晰的焦点指示器
- 支持 `placeholder` 属性提供输入提示
- 支持 `maxLength` 属性限制输入长度

## TypeScript 支持

Textarea 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// Core types
import type { TextareaProps, TextareaSize } from '@tigercat/core'

// Vue
import type { Textarea, VueTextareaProps } from '@tigercat/vue'

// React
import type { Textarea, TextareaProps as ReactTextareaProps } from '@tigercat/react'
````

## 示例

### 表单提交

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Textarea, Button } from '@tigercat/vue'

const comment = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!comment.value.trim()) {
    alert('请输入评论内容')
    return
  }

  loading.value = true
  try {
    // 提交评论逻辑
    await submitComment(comment.value)
    comment.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <Textarea
      v-model="comment"
      placeholder="请输入您的评论..."
      :rows="5"
      :maxLength="500"
      showCount />
    <Button @click="handleSubmit" :loading="loading" class="mt-2"> 提交评论 </Button>
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Textarea, Button } from '@tigercat/react'

function CommentForm() {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert('请输入评论内容')
      return
    }

    setLoading(true)
    try {
      // 提交评论逻辑
      await submitComment(comment)
      setComment('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Textarea
        value={comment}
        onInput={(e) => setComment(e.currentTarget.value)}
        placeholder="请输入您的评论..."
        rows={5}
        maxLength={500}
        showCount
      />
      <Button onClick={handleSubmit} loading={loading} className="mt-2">
        提交评论
      </Button>
    </div>
  )
}
```

### 自动扩展文本框

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Textarea } from '@tigercat/vue'

const note = ref('')
</script>

<template>
  <Textarea
    v-model="note"
    placeholder="开始输入，文本框会自动扩展..."
    autoResize
    :minRows="3"
    :maxRows="15" />
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Textarea } from '@tigercat/react'

function AutoResizeExample() {
  const [note, setNote] = useState('')

  return (
    <Textarea
      value={note}
      onInput={(e) => setNote(e.currentTarget.value)}
      placeholder="开始输入，文本框会自动扩展..."
      autoResize
      minRows={3}
      maxRows={15}
    />
  )
}
```

### 字符限制

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Textarea } from '@tigercat/vue'

const bio = ref('')
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1"> 个人简介 </label>
    <Textarea
      v-model="bio"
      placeholder="请输入个人简介（最多 200 字）"
      :rows="4"
      :maxLength="200"
      showCount />
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Textarea } from '@tigercat/react'

function BioForm() {
  const [bio, setBio] = useState('')

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
      <Textarea
        value={bio}
        onInput={(e) => setBio(e.currentTarget.value)}
        placeholder="请输入个人简介（最多 200 字）"
        rows={4}
        maxLength={200}
        showCount
      />
    </div>
  )
}
```
