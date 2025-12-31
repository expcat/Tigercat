# Card 卡片

用于内容展示的卡片容器组件，支持多种样式和布局选项。

## 基本用法

### Vue 3

```vue
<script setup>
import { Card } from '@tigercat/vue'
</script>

<template>
  <Card>
    <p>这是一个基础的卡片组件。</p>
  </Card>
</template>
```

### React

```tsx
import { Card } from '@tigercat/react'

function App() {
  return (
    <Card>
      <p>这是一个基础的卡片组件。</p>
    </Card>
  )
}
```

## 卡片变体 (Variants)

Card 组件支持 4 种不同的变体：

- `default` - 默认卡片，带细边框（默认）
- `bordered` - 带粗边框的卡片
- `shadow` - 带阴影的卡片
- `elevated` - 带大阴影的浮起卡片

### Vue 3

```vue
<template>
  <Card variant="default">默认卡片</Card>
  <Card variant="bordered">带边框卡片</Card>
  <Card variant="shadow">带阴影卡片</Card>
  <Card variant="elevated">浮起卡片</Card>
</template>
```

### React

```tsx
<Card variant="default">默认卡片</Card>
<Card variant="bordered">带边框卡片</Card>
<Card variant="shadow">带阴影卡片</Card>
<Card variant="elevated">浮起卡片</Card>
```

## 卡片尺寸 (Sizes)

Card 组件支持 3 种不同的尺寸（主要影响内边距）：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Card size="sm">小尺寸卡片</Card>
  <Card size="md">中等尺寸卡片</Card>
  <Card size="lg">大尺寸卡片</Card>
</template>
```

### React

```tsx
<Card size="sm">小尺寸卡片</Card>
<Card size="md">中等尺寸卡片</Card>
<Card size="lg">大尺寸卡片</Card>
```

## 可悬停卡片 (Hoverable)

设置 `hoverable` 属性可以让卡片在鼠标悬停时显示交互效果（放大和加强阴影）。

### Vue 3

```vue
<template>
  <Card hoverable>
    <p>悬停在我上面试试</p>
  </Card>
</template>
```

### React

```tsx
<Card hoverable>
  <p>悬停在我上面试试</p>
</Card>
```

## 带封面图片的卡片

通过 `cover` 属性可以为卡片添加封面图片。

### Vue 3

```vue
<template>
  <Card 
    cover="https://example.com/image.jpg"
    cover-alt="卡片封面图片"
  >
    <template #header>
      <h3>卡片标题</h3>
    </template>
    <p>卡片内容</p>
  </Card>
</template>
```

### React

```tsx
<Card 
  cover="https://example.com/image.jpg"
  coverAlt="卡片封面图片"
  header={<h3>卡片标题</h3>}
>
  <p>卡片内容</p>
</Card>
```

## 卡片结构

Card 组件支持多个内容区域，可以通过插槽（Vue）或属性（React）来定义。

### 头部 (Header)

#### Vue 3

```vue
<template>
  <Card>
    <template #header>
      <h3>卡片标题</h3>
    </template>
    <p>卡片内容</p>
  </Card>
</template>
```

#### React

```tsx
<Card header={<h3>卡片标题</h3>}>
  <p>卡片内容</p>
</Card>
```

### 底部 (Footer)

#### Vue 3

```vue
<template>
  <Card>
    <p>卡片内容</p>
    <template #footer>
      <p>底部信息</p>
    </template>
  </Card>
</template>
```

#### React

```tsx
<Card footer={<p>底部信息</p>}>
  <p>卡片内容</p>
</Card>
```

### 操作区 (Actions)

#### Vue 3

```vue
<template>
  <Card>
    <p>卡片内容</p>
    <template #actions>
      <button>取消</button>
      <button>确认</button>
    </template>
  </Card>
</template>
```

#### React

```tsx
<Card actions={
  <>
    <button>取消</button>
    <button>确认</button>
  </>
}>
  <p>卡片内容</p>
</Card>
```

## 完整示例

### Vue 3

```vue
<script setup>
import { Card } from '@tigercat/vue'
</script>

<template>
  <Card 
    variant="shadow" 
    size="lg" 
    hoverable
    cover="https://example.com/image.jpg"
    cover-alt="产品图片"
  >
    <template #header>
      <h3 class="text-xl font-bold">产品名称</h3>
    </template>
    
    <p>这是一个完整的卡片示例，包含封面图片、标题、内容和操作按钮。</p>
    
    <template #footer>
      <p class="text-gray-500">创建于 2024-01-01</p>
    </template>
    
    <template #actions>
      <button class="px-4 py-2 bg-gray-200 rounded">取消</button>
      <button class="px-4 py-2 bg-blue-500 text-white rounded">确认</button>
    </template>
  </Card>
</template>
```

### React

```tsx
import { Card } from '@tigercat/react'

function ProductCard() {
  return (
    <Card 
      variant="shadow" 
      size="lg" 
      hoverable
      cover="https://example.com/image.jpg"
      coverAlt="产品图片"
      header={<h3 className="text-xl font-bold">产品名称</h3>}
      footer={<p className="text-gray-500">创建于 2024-01-01</p>}
      actions={
        <>
          <button className="px-4 py-2 bg-gray-200 rounded">取消</button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">确认</button>
        </>
      }
    >
      <p>这是一个完整的卡片示例，包含封面图片、标题、内容和操作按钮。</p>
    </Card>
  )
}
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'default' \| 'bordered' \| 'shadow' \| 'elevated'` | `'default'` | 卡片变体样式 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 卡片尺寸（影响内边距） |
| hoverable | `boolean` | `false` | 是否可悬停（显示悬停效果） |
| cover | `string` | `undefined` | 封面图片 URL |
| coverAlt | `string` | `'Card cover image'` | 封面图片的 alt 文本 |
| className | `string` | `undefined` | 自定义 CSS 类名 |

### 插槽 (Vue) / 属性 (React)

#### Vue 3 插槽

| 插槽名称 | 说明 |
|----------|------|
| default | 卡片主体内容 |
| header | 卡片头部内容 |
| footer | 卡片底部内容 |
| actions | 卡片操作区域（通常放置按钮） |

#### React 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 卡片主体内容 |
| header | `ReactNode` | 卡片头部内容 |
| footer | `ReactNode` | 卡片底部内容 |
| actions | `ReactNode` | 卡片操作区域（通常放置按钮） |

## 样式定制

Card 组件使用 Tailwind CSS 构建，您可以通过以下方式自定义样式：

1. **使用 `className` 属性**：添加额外的 CSS 类
2. **覆盖默认样式**：通过全局 CSS 覆盖组件样式
3. **Tailwind 配置**：在 Tailwind 配置文件中自定义颜色和间距

## 可访问性

Card 组件遵循以下可访问性最佳实践：

- 使用语义化的 HTML 结构
- 封面图片包含适当的 alt 文本
- 支持键盘导航和屏幕阅读器

## 使用场景

Card 组件适用于以下场景：

- 产品列表展示
- 文章卡片
- 用户信息卡片
- 仪表盘数据展示
- 功能入口卡片
- 图片画廊
