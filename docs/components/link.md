# Link 链接

基础的链接组件，支持多种样式、尺寸和导航功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { Link } from '@expcat/tigercat-vue'
</script>

<template>
  <Link href="https://github.com">GitHub</Link>
  <Link href="/about">About Page</Link>
</template>
```

### React

```tsx
import { Link } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Link href="https://github.com">GitHub</Link>
      <Link href="/about">About Page</Link>
    </>
  )
}
```

## 链接变体 (Variants)

Link 组件支持 3 种不同的变体：

- `primary` - 主要链接，蓝色文字（默认）
- `secondary` - 次要链接，灰色文字
- `default` - 默认链接，深灰色文字

### Vue 3

```vue
<template>
  <Link href="#" variant="primary">Primary Link</Link>
  <Link href="#" variant="secondary">Secondary Link</Link>
  <Link href="#" variant="default">Default Link</Link>
</template>
```

### React

```tsx
<Link href="#" variant="primary">Primary Link</Link>
<Link href="#" variant="secondary">Secondary Link</Link>
<Link href="#" variant="default">Default Link</Link>
```

## 链接尺寸 (Sizes)

Link 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Link href="#" size="sm">Small Link</Link>
  <Link href="#" size="md">Medium Link</Link>
  <Link href="#" size="lg">Large Link</Link>
</template>
```

### React

```tsx
<Link href="#" size="sm">Small Link</Link>
<Link href="#" size="md">Medium Link</Link>
<Link href="#" size="lg">Large Link</Link>
```

## 禁用状态 (Disabled)

通过 `disabled` 属性禁用链接。禁用后链接不可点击，样式会变为灰色。

### Vue 3

```vue
<template>
  <Link href="#" disabled>Disabled Link</Link>
</template>
```

### React

```tsx
<Link href="#" disabled>
  Disabled Link
</Link>
```

## 新窗口打开 (Target)

通过 `target` 属性控制链接的打开方式。当使用 `target="_blank"` 时，组件会自动添加 `rel="noopener noreferrer"` 以提高安全性。

### Vue 3

```vue
<template>
  <Link href="https://github.com" target="_blank"> Open in New Tab </Link>
  <Link href="https://github.com" target="_blank" rel="nofollow"> Custom Rel Attribute </Link>
</template>
```

### React

```tsx
<Link href="https://github.com" target="_blank">
  Open in New Tab
</Link>
<Link href="https://github.com" target="_blank" rel="nofollow">
  Custom Rel Attribute
</Link>
```

## 下划线 (Underline)

通过 `underline` 属性控制是否显示下划线效果。默认为 `true`，鼠标悬停时显示下划线。

### Vue 3

```vue
<template>
  <Link href="#" :underline="true">With Underline (Default)</Link>
  <Link href="#" :underline="false">Without Underline</Link>
</template>
```

### React

```tsx
<Link href="#" underline={true}>With Underline (Default)</Link>
<Link href="#" underline={false}>Without Underline</Link>
```

## 事件处理 (Event Handling)

### Vue 3

```vue
<script setup>
import { Link } from '@expcat/tigercat-vue'

const handleClick = (event) => {
  console.log('Link clicked:', event)
  // You can prevent navigation if needed
  // event.preventDefault()
}
</script>

<template>
  <Link href="#" @click="handleClick"> Click Me </Link>
</template>
```

### React

```tsx
import { Link } from '@expcat/tigercat-react'

function App() {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    console.log('Link clicked:', event)
    // You can prevent navigation if needed
    // event.preventDefault()
  }

  return (
    <Link href="#" onClick={handleClick}>
      Click Me
    </Link>
  )
}
```

## API

### Props

| 属性      | 说明                                                       | 类型                                               | 默认值                                                    |
| --------- | ---------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| variant   | 链接变体                                                   | `'primary'` \| `'secondary'` \| `'default'`        | `'primary'`                                               |
| size      | 链接尺寸                                                   | `'sm'` \| `'md'` \| `'lg'`                         | `'md'`                                                    |
| disabled  | 是否禁用                                                   | `boolean`                                          | `false`                                                   |
| href      | 链接地址                                                   | `string`                                           | `undefined`                                               |
| target    | 链接打开方式                                               | `'_blank'` \| `'_self'` \| `'_parent'` \| `'_top'` | `undefined`                                               |
| rel       | 链接关系                                                   | `string`                                           | 当 `target="_blank"` 时自动设置为 `'noopener noreferrer'` |
| underline | 是否显示下划线                                             | `boolean`                                          | `true`                                                    |
| className | 自定义类名（Vue/React 均支持；Vue 也可直接传 `class`）     | `string`                                           | `undefined`                                               |
| style     | 自定义内联样式（Vue/React 均支持；Vue 也可直接传 `style`） | `CSSProperties` / `Record<string, unknown>`        | `undefined`                                               |

> 说明：Link 会透传大部分原生属性（如 `id`、`data-*`、`aria-*`）。

### Events (Vue) / Props (React)

#### Vue 3

| 事件名 | 说明           | 回调参数              |
| ------ | -------------- | --------------------- |
| click  | 点击链接时触发 | `(event: MouseEvent)` |

#### React

| 属性      | 说明                    | 类型                                                   |
| --------- | ----------------------- | ------------------------------------------------------ |
| onClick   | 点击链接时的回调        | `(event: React.MouseEvent<HTMLAnchorElement>) => void` |
| children  | 链接内容                | `React.ReactNode`                                      |
| className | 自定义类名              | `string`                                               |
| style     | 自定义内联样式          | `React.CSSProperties`                                  |
| ...props  | 其他原生 `<a>` 属性透传 | `React.AnchorHTMLAttributes<HTMLAnchorElement>`        |

## 样式定制

Link 组件使用 Tailwind CSS 类，并支持通过 CSS 变量进行主题定制。

### CSS 变量

```css
:root {
  /* Primary variant */
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;

  /* Secondary variant */
  --tiger-secondary: #4b5563;
  --tiger-secondary-hover: #374151;
  --tiger-secondary-disabled: #9ca3af;
}
```

### 自定义类名 (React)

```tsx
<Link href="#" className="font-bold">
  Bold Link
</Link>
```

## 无障碍性 (Accessibility)

Link 组件遵循 WAI-ARIA 规范：

- 使用语义化的 `<a>` 标签
- 禁用状态会添加 `aria-disabled` 属性
- 新窗口打开时自动添加安全属性 `rel="noopener noreferrer"`
- 支持键盘导航（Tab 键聚焦，Enter 键激活）
- 禁用后会移除 `href`、设置 `tabindex="-1"`，并阻止 Enter/Space 触发交互

## 最佳实践

1. **外部链接安全性**: 使用 `target="_blank"` 打开外部链接时，组件会自动添加 `rel="noopener noreferrer"` 防止安全漏洞。

2. **禁用状态**: 禁用的链接会移除 `href` 属性并添加 `aria-disabled`，确保无障碍访问。

3. **语义化使用**: Link 组件应该用于导航，如果需要按钮行为，请使用 Button 组件。

4. **下划线提示**: 默认保持下划线效果可以提高可访问性，让用户清楚地识别可点击的链接。

## 示例

### 组合使用

```vue
<template>
  <div class="space-y-4">
    <div>
      <Link href="/home" variant="primary">Home</Link>
      <Link href="/about" variant="secondary">About</Link>
      <Link href="/contact" variant="default">Contact</Link>
    </div>

    <div>
      <Link href="https://github.com" target="_blank" variant="primary"> Visit GitHub </Link>
    </div>

    <div>
      <Link href="#" disabled> Coming Soon </Link>
    </div>
  </div>
</template>
```
