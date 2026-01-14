# Container 容器

响应式布局容器组件，用于限制内容的最大宽度并提供适当的内边距。

## 基本用法

### Vue 3

```vue
<script setup>
import { Container } from '@tigercat/vue'
</script>

<template>
  <Container>
    <h1>Welcome to Tigercat</h1>
    <p>This content is inside a container.</p>
  </Container>
</template>
```

### React

```tsx
import { Container } from '@tigercat/react'

function App() {
  return (
    <Container>
      <h1>Welcome to Tigercat</h1>
      <p>This content is inside a container.</p>
    </Container>
  )
}
```

## 最大宽度限制 (Max Width)

Container 组件支持多种预设的最大宽度限制，基于 Tailwind CSS 的响应式断点：

- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px
- `full` - 100% width
- `false` - 无最大宽度限制（默认）

### Vue 3

```vue
<template>
  <!-- 小型容器 (640px) -->
  <Container maxWidth="sm">
    <p>Small container content</p>
  </Container>

  <!-- 中型容器 (768px) -->
  <Container maxWidth="md">
    <p>Medium container content</p>
  </Container>

  <!-- 大型容器 (1024px) -->
  <Container maxWidth="lg">
    <p>Large container content</p>
  </Container>

  <!-- 超大容器 (1280px) -->
  <Container maxWidth="xl">
    <p>Extra large container content</p>
  </Container>

  <!-- 2倍大容器 (1536px) -->
  <Container maxWidth="2xl">
    <p>2X large container content</p>
  </Container>

  <!-- 全宽容器 -->
  <Container maxWidth="full">
    <p>Full width container</p>
  </Container>

  <!-- 无限制容器 -->
  <Container :maxWidth="false">
    <p>Unlimited width container</p>
  </Container>
</template>
```

### React

```tsx
{
  /* 小型容器 (640px) */
}
;<Container maxWidth="sm">
  <p>Small container content</p>
</Container>

{
  /* 中型容器 (768px) */
}
;<Container maxWidth="md">
  <p>Medium container content</p>
</Container>

{
  /* 大型容器 (1024px) */
}
;<Container maxWidth="lg">
  <p>Large container content</p>
</Container>

{
  /* 超大容器 (1280px) */
}
;<Container maxWidth="xl">
  <p>Extra large container content</p>
</Container>

{
  /* 2倍大容器 (1536px) */
}
;<Container maxWidth="2xl">
  <p>2X large container content</p>
</Container>

{
  /* 全宽容器 */
}
;<Container maxWidth="full">
  <p>Full width container</p>
</Container>

{
  /* 无限制容器 */
}
;<Container maxWidth={false}>
  <p>Unlimited width container</p>
</Container>
```

## 居中对齐 (Center)

通过 `center` 属性控制容器是否水平居中。默认为 `true`。

### Vue 3

```vue
<template>
  <!-- 居中对齐（默认） -->
  <Container maxWidth="lg">
    <p>Centered container</p>
  </Container>

  <!-- 不居中对齐 -->
  <Container maxWidth="lg" :center="false">
    <p>Left-aligned container</p>
  </Container>
</template>
```

### React

```tsx
{
  /* 居中对齐（默认） */
}
;<Container maxWidth="lg">
  <p>Centered container</p>
</Container>

{
  /* 不居中对齐 */
}
;<Container maxWidth="lg" center={false}>
  <p>Left-aligned container</p>
</Container>
```

## 内边距 (Padding)

通过 `padding` 属性控制容器是否添加响应式水平内边距。默认为 `true`。

内边距会根据屏幕尺寸自适应：

- 小屏幕: `px-4` (16px)
- 中等屏幕: `px-6` (24px)
- 大屏幕: `px-8` (32px)

### Vue 3

```vue
<template>
  <!-- 带内边距（默认） -->
  <Container maxWidth="lg">
    <p>Container with padding</p>
  </Container>

  <!-- 不带内边距 -->
  <Container maxWidth="lg" :padding="false">
    <p>Container without padding</p>
  </Container>
</template>
```

### React

```tsx
{
  /* 带内边距（默认） */
}
;<Container maxWidth="lg">
  <p>Container with padding</p>
</Container>

{
  /* 不带内边距 */
}
;<Container maxWidth="lg" padding={false}>
  <p>Container without padding</p>
</Container>
```

## 嵌套容器 (Nested Containers)

Container 组件支持嵌套使用，可以创建复杂的布局结构。

### Vue 3

```vue
<template>
  <Container maxWidth="2xl">
    <h1>Outer Container (2xl)</h1>

    <Container maxWidth="lg" class="bg-gray-100 py-8 my-4">
      <h2>Nested Container (lg)</h2>
      <p>This is nested inside the outer container.</p>

      <Container maxWidth="md" class="bg-white p-4 mt-4">
        <h3>Deeply Nested Container (md)</h3>
        <p>This is nested even deeper.</p>
      </Container>
    </Container>
  </Container>
</template>
```

### React

```tsx
<Container maxWidth="2xl">
  <h1>Outer Container (2xl)</h1>

  <Container maxWidth="lg" className="bg-gray-100 py-8 my-4">
    <h2>Nested Container (lg)</h2>
    <p>This is nested inside the outer container.</p>

    <Container maxWidth="md" className="bg-white p-4 mt-4">
      <h3>Deeply Nested Container (md)</h3>
      <p>This is nested even deeper.</p>
    </Container>
  </Container>
</Container>
```

## 自定义元素类型 (React)

React 版本的 Container 组件支持通过 `as` 属性自定义渲染的 HTML 元素类型。

```tsx
{
  /* 渲染为 section */
}
;<Container as="section" maxWidth="lg">
  <h2>Section Container</h2>
</Container>

{
  /* 渲染为 main */
}
;<Container as="main" maxWidth="xl">
  <h1>Main Content</h1>
</Container>

{
  /* 渲染为 article */
}
;<Container as="article" maxWidth="md">
  <h2>Article Title</h2>
  <p>Article content...</p>
</Container>
```

## API

### Props / 属性

| 属性     | 说明                     | 类型                | 默认值  | 可选值                                                                 |
| -------- | ------------------------ | ------------------- | ------- | ---------------------------------------------------------------------- |
| maxWidth | 最大宽度限制             | `ContainerMaxWidth` | `false` | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'full'` \| `false` |
| center   | 是否水平居中             | `boolean`           | `true`  | `true` \| `false`                                                      |
| padding  | 是否添加响应式水平内边距 | `boolean`           | `true`  | `true` \| `false`                                                      |

#### React 专属属性

| 属性      | 说明                 | 类型                | 默认值  |
| --------- | -------------------- | ------------------- | ------- |
| children  | 容器内容             | `React.ReactNode`   | -       |
| className | 额外的 CSS 类名      | `string`            | -       |
| as        | 渲染的 HTML 元素类型 | `React.ElementType` | `'div'` |

### Slots / 插槽 (Vue)

| 插槽名  | 说明     |
| ------- | -------- |
| default | 容器内容 |

## 响应式设计

Container 组件的内边距会根据屏幕尺寸自动调整：

- **小屏幕** (< 640px): `px-4` (16px)
- **中等屏幕** (≥ 640px): `px-6` (24px)
- **大屏幕** (≥ 1024px): `px-8` (32px)

这确保了在不同设备上都有合适的内边距，提供一致的用户体验。

## 使用场景

### 页面主容器

#### Vue 3

```vue
<template>
  <Container maxWidth="xl">
    <header>
      <h1>My Website</h1>
      <nav><!-- Navigation --></nav>
    </header>

    <main>
      <!-- Main content -->
    </main>

    <footer>
      <!-- Footer content -->
    </footer>
  </Container>
</template>
```

#### React

```tsx
<Container maxWidth="xl">
  <header>
    <h1>My Website</h1>
    <nav>{/* Navigation */}</nav>
  </header>

  <main>{/* Main content */}</main>

  <footer>{/* Footer content */}</footer>
</Container>
```

### 文章内容

#### Vue 3

```vue
<template>
  <Container maxWidth="md">
    <article>
      <h1>Article Title</h1>
      <p>Article content with optimal reading width...</p>
    </article>
  </Container>
</template>
```

#### React

```tsx
<Container maxWidth="md">
  <article>
    <h1>Article Title</h1>
    <p>Article content with optimal reading width...</p>
  </article>
</Container>
```

### 表单页面

#### Vue 3

```vue
<template>
  <Container maxWidth="sm">
    <form @submit.prevent="handleSubmit">
      <h2>Sign In</h2>
      <!-- Form fields -->
      <button type="submit">Submit</button>
    </form>
  </Container>
</template>
```

#### React

```tsx
<Container maxWidth="sm">
  <form onSubmit={handleSubmit}>
    <h2>Sign In</h2>
    {/* Form fields */}
    <button type="submit">Submit</button>
  </form>
</Container>
```

### 多栏布局

#### Vue 3

```vue
<template>
  <Container maxWidth="2xl">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>Column 1</div>
      <div>Column 2</div>
      <div>Column 3</div>
    </div>
  </Container>
</template>
```

#### React

```tsx
<Container maxWidth="2xl">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
  </div>
</Container>
```

## 样式定制

Container 组件使用 Tailwind CSS 构建，可以通过传入额外的 CSS 类来自定义样式。

### Vue 3

```vue
<template>
  <Container maxWidth="lg" class="bg-gray-50 shadow-lg rounded-lg my-8">
    <p>Custom styled container</p>
  </Container>
</template>
```

### React

```tsx
<Container maxWidth="lg" className="bg-gray-50 shadow-lg rounded-lg my-8">
  <p>Custom styled container</p>
</Container>
```

## 无障碍 (Accessibility)

- 使用语义化的 HTML 元素
- React 版本支持自定义元素类型 (`as` 属性)，可以使用如 `<main>`, `<section>`, `<article>` 等语义化标签
- 确保内容在不同屏幕尺寸下都可访问
- 响应式内边距保证了触摸目标的可访问性

## TypeScript 支持

Container 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { ContainerProps, ContainerMaxWidth } from '@tigercat/core'
// Vue
import type { Container } from '@tigercat/vue'
// React
import type { Container, ContainerProps as ReactContainerProps } from '@tigercat/react'
```

## 最佳实践

1. **选择合适的最大宽度**：
   - 文章/博客内容: `md` (768px) - 提供最佳阅读宽度
   - 表单页面: `sm` (640px) - 保持表单紧凑
   - 常规页面: `lg` 或 `xl` - 平衡内容和空间
   - 宽屏应用: `2xl` - 充分利用大屏幕空间

2. **嵌套使用**：可以安全地嵌套 Container 组件来创建复杂的布局结构

3. **与其他组件配合**：Container 通常作为页面布局的基础，与 Grid、Card 等组件配合使用

4. **响应式设计**：利用 Container 的响应式内边距特性，无需手动管理不同屏幕尺寸的间距

## 示例

### 完整的页面布局

#### Vue 3

```vue
<script setup>
import { Container, Button } from '@tigercat/vue'
</script>

<template>
  <div>
    <!-- Header -->
    <Container maxWidth="2xl" class="py-4">
      <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">My App</h1>
        <nav>
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">About</Button>
          <Button variant="primary">Sign In</Button>
        </nav>
      </header>
    </Container>

    <!-- Hero Section -->
    <Container maxWidth="xl" class="py-16 text-center">
      <h2 class="text-4xl font-bold mb-4">Welcome to Tigercat</h2>
      <p class="text-xl mb-8">Build beautiful UIs with ease</p>
      <Button variant="primary" size="lg">Get Started</Button>
    </Container>

    <!-- Content Section -->
    <Container maxWidth="lg" class="py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-2xl font-semibold mb-4">Feature 1</h3>
          <p>Description of feature 1...</p>
        </div>
        <div>
          <h3 class="text-2xl font-semibold mb-4">Feature 2</h3>
          <p>Description of feature 2...</p>
        </div>
      </div>
    </Container>

    <!-- Footer -->
    <Container maxWidth="2xl" class="py-8 border-t">
      <footer class="text-center text-gray-600">
        <p>&copy; 2024 Tigercat. All rights reserved.</p>
      </footer>
    </Container>
  </div>
</template>
```

#### React

```tsx
import { Container, Button } from '@tigercat/react'

function App() {
  return (
    <div>
      {/* Header */}
      <Container maxWidth="2xl" className="py-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My App</h1>
          <nav>
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button variant="primary">Sign In</Button>
          </nav>
        </header>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="xl" className="py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Welcome to Tigercat</h2>
        <p className="text-xl mb-8">Build beautiful UIs with ease</p>
        <Button variant="primary" size="lg">
          Get Started
        </Button>
      </Container>

      {/* Content Section */}
      <Container maxWidth="lg" className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Feature 1</h3>
            <p>Description of feature 1...</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Feature 2</h3>
            <p>Description of feature 2...</p>
          </div>
        </div>
      </Container>

      {/* Footer */}
      <Container maxWidth="2xl" className="py-8 border-t">
        <footer className="text-center text-gray-600">
          <p>&copy; 2024 Tigercat. All rights reserved.</p>
        </footer>
      </Container>
    </div>
  )
}
```
