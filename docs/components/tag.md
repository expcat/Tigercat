# Tag 标签

用于标记和分类的小型标签组件。

## 基本用法

### Vue 3

```vue
<script setup>
import { Tag } from '@tigercat/vue'
</script>

<template>
  <Tag>Default Tag</Tag>
  <Tag variant="primary">Primary Tag</Tag>
  <Tag variant="success">Success Tag</Tag>
</template>
```

### React

```tsx
import { Tag } from '@tigercat/react'

function App() {
  return (
    <>
      <Tag>Default Tag</Tag>
      <Tag variant="primary">Primary Tag</Tag>
      <Tag variant="success">Success Tag</Tag>
    </>
  )
}
```

## 标签变体 (Variants)

Tag 组件支持 6 种不同的变体：

- `default` - 默认标签，灰色背景
- `primary` - 主要标签，蓝色背景
- `success` - 成功标签，绿色背景
- `warning` - 警告标签，黄色背景
- `danger` - 危险标签，红色背景
- `info` - 信息标签，天蓝色背景

### Vue 3

```vue
<template>
  <Tag variant="default">Default</Tag>
  <Tag variant="primary">Primary</Tag>
  <Tag variant="success">Success</Tag>
  <Tag variant="warning">Warning</Tag>
  <Tag variant="danger">Danger</Tag>
  <Tag variant="info">Info</Tag>
</template>
```

### React

```tsx
<Tag variant="default">Default</Tag>
<Tag variant="primary">Primary</Tag>
<Tag variant="success">Success</Tag>
<Tag variant="warning">Warning</Tag>
<Tag variant="danger">Danger</Tag>
<Tag variant="info">Info</Tag>
```

## 标签尺寸 (Sizes)

Tag 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Tag size="sm">Small Tag</Tag>
  <Tag size="md">Medium Tag</Tag>
  <Tag size="lg">Large Tag</Tag>
</template>
```

### React

```tsx
<Tag size="sm">Small Tag</Tag>
<Tag size="md">Medium Tag</Tag>
<Tag size="lg">Large Tag</Tag>
```

## 可关闭标签 (Closable)

通过 `closable` 属性使标签可以关闭。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tag } from '@tigercat/vue'

const tags = ref(['Tag 1', 'Tag 2', 'Tag 3'])

const handleClose = (index: number) => {
  tags.value.splice(index, 1)
}
</script>

<template>
  <Tag
    v-for="(tag, index) in tags"
    :key="tag"
    closable
    @close="handleClose(index)"
  >
    {{ tag }}
  </Tag>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Tag } from '@tigercat/react'

function App() {
  const [tags, setTags] = useState(['Tag 1', 'Tag 2', 'Tag 3'])

  const handleClose = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <>
      {tags.map((tag, index) => (
        <Tag key={tag} closable onClose={() => handleClose(index)}>
          {tag}
        </Tag>
      ))}
    </>
  )
}
```

## 组合示例

展示不同尺寸和变体的可关闭标签：

### Vue 3

```vue
<template>
  <div class="flex flex-wrap gap-2">
    <Tag variant="primary" size="sm" closable @close="handleClose">
      Primary Small
    </Tag>
    <Tag variant="success" size="md" closable @close="handleClose">
      Success Medium
    </Tag>
    <Tag variant="warning" size="lg" closable @close="handleClose">
      Warning Large
    </Tag>
  </div>
</template>
```

### React

```tsx
<div className="flex flex-wrap gap-2">
  <Tag variant="primary" size="sm" closable onClose={handleClose}>
    Primary Small
  </Tag>
  <Tag variant="success" size="md" closable onClose={handleClose}>
    Success Medium
  </Tag>
  <Tag variant="warning" size="lg" closable onClose={handleClose}>
    Warning Large
  </Tag>
</div>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| variant | 标签变体 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| size | 标签尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| closable | 是否可关闭 | `boolean` | `false` |
| className | 自定义 CSS 类名（仅 React） | `string` | - |

### Events (Vue)

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 点击关闭按钮时触发 | `(event: MouseEvent)` |

### Event Handlers (React)

| 属性 | 说明 | 类型 |
|------|------|------|
| onClose | 点击关闭按钮时的回调 | `(event: React.MouseEvent<HTMLButtonElement>) => void` |

## 样式定制

Tag 组件使用 Tailwind CSS 类，可以通过 Tailwind 配置自定义颜色。同时也支持 CSS 变量进行主题定制。

### 主题变量

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
}
```

## 可访问性

- Tag 使用 `role="status"` 属性提供语义化信息
- 关闭按钮包含 `aria-label="Close tag"` 提供可访问性标签
- 关闭按钮支持键盘导航和焦点管理

## 使用场景

- 标记和分类内容
- 显示状态信息
- 标签管理和过滤
- 关键词展示
- 用户兴趣标签
