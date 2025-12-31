# Skeleton 骨架屏

用于在内容加载时显示占位符的骨架屏组件，提升用户体验。

## 基本用法

### Vue 3

```vue
<script setup>
import { Skeleton } from '@tigercat/vue'
</script>

<template>
  <!-- 基础骨架屏 -->
  <Skeleton />
  
  <!-- 头像骨架屏 -->
  <Skeleton variant="avatar" />
  
  <!-- 图片骨架屏 -->
  <Skeleton variant="image" />
  
  <!-- 按钮骨架屏 -->
  <Skeleton variant="button" />
</template>
```

### React

```tsx
import { Skeleton } from '@tigercat/react'

function App() {
  return (
    <>
      {/* 基础骨架屏 */}
      <Skeleton />
      
      {/* 头像骨架屏 */}
      <Skeleton variant="avatar" />
      
      {/* 图片骨架屏 */}
      <Skeleton variant="image" />
      
      {/* 按钮骨架屏 */}
      <Skeleton variant="button" />
    </>
  )
}
```

## 骨架屏变体 (Variants)

Skeleton 组件支持 5 种不同的变体：

- `text` - 文本占位符（默认）
- `avatar` - 头像占位符
- `image` - 图片占位符
- `button` - 按钮占位符
- `custom` - 自定义占位符

### Vue 3

```vue
<template>
  <Skeleton variant="text" />
  <Skeleton variant="avatar" />
  <Skeleton variant="image" />
  <Skeleton variant="button" />
  <Skeleton variant="custom" width="300px" height="150px" />
</template>
```

### React

```tsx
<Skeleton variant="text" />
<Skeleton variant="avatar" />
<Skeleton variant="image" />
<Skeleton variant="button" />
<Skeleton variant="custom" width="300px" height="150px" />
```

## 动画效果 (Animations)

Skeleton 组件支持 3 种动画效果：

- `pulse` - 脉冲动画（默认）
- `wave` - 波浪动画
- `none` - 无动画

### Vue 3

```vue
<template>
  <Skeleton animation="pulse" />
  <Skeleton animation="wave" />
  <Skeleton animation="none" />
</template>
```

### React

```tsx
<Skeleton animation="pulse" />
<Skeleton animation="wave" />
<Skeleton animation="none" />
```

## 自定义尺寸

可以通过 `width` 和 `height` 属性自定义骨架屏的尺寸。

### Vue 3

```vue
<template>
  <!-- 自定义宽度 -->
  <Skeleton width="200px" />
  
  <!-- 自定义高度 -->
  <Skeleton height="50px" />
  
  <!-- 同时自定义宽度和高度 -->
  <Skeleton width="300px" height="100px" />
  
  <!-- 使用百分比 -->
  <Skeleton width="80%" />
</template>
```

### React

```tsx
{/* 自定义宽度 */}
<Skeleton width="200px" />

{/* 自定义高度 */}
<Skeleton height="50px" />

{/* 同时自定义宽度和高度 */}
<Skeleton width="300px" height="100px" />

{/* 使用百分比 */}
<Skeleton width="80%" />
```

## 多行文本

使用 `rows` 属性可以渲染多行文本骨架屏。

### Vue 3

```vue
<template>
  <!-- 3 行文本 -->
  <Skeleton variant="text" :rows="3" />
  
  <!-- 5 行文本 -->
  <Skeleton variant="text" :rows="5" />
</template>
```

### React

```tsx
{/* 3 行文本 */}
<Skeleton variant="text" rows={3} />

{/* 5 行文本 */}
<Skeleton variant="text" rows={5} />
```

## 段落模式

启用 `paragraph` 属性可以让多行文本具有不同的宽度，模拟段落效果（最后一行宽度为 60%）。

### Vue 3

```vue
<template>
  <!-- 段落模式 -->
  <Skeleton variant="text" :rows="4" paragraph />
  
  <!-- 普通模式 -->
  <Skeleton variant="text" :rows="4" />
</template>
```

### React

```tsx
{/* 段落模式 */}
<Skeleton variant="text" rows={4} paragraph />

{/* 普通模式 */}
<Skeleton variant="text" rows={4} />
```

## 头像形状

对于 `avatar` 变体，可以使用 `shape` 属性设置形状：

- `circle` - 圆形（默认）
- `square` - 方形

### Vue 3

```vue
<template>
  <Skeleton variant="avatar" shape="circle" />
  <Skeleton variant="avatar" shape="square" />
</template>
```

### React

```tsx
<Skeleton variant="avatar" shape="circle" />
<Skeleton variant="avatar" shape="square" />
```

## 组合使用

可以组合使用多个 Skeleton 组件来创建复杂的加载状态。

### Vue 3

```vue
<template>
  <div class="flex items-start gap-4">
    <!-- 头像 -->
    <Skeleton variant="avatar" shape="circle" />
    
    <!-- 内容 -->
    <div class="flex-1">
      <Skeleton variant="text" width="200px" class="mb-2" />
      <Skeleton variant="text" :rows="2" paragraph />
    </div>
  </div>
  
  <!-- 图片卡片 -->
  <div class="mt-4">
    <Skeleton variant="image" />
    <Skeleton variant="text" :rows="2" paragraph class="mt-2" />
    <Skeleton variant="button" class="mt-2" />
  </div>
</template>
```

### React

```tsx
<div className="flex items-start gap-4">
  {/* 头像 */}
  <Skeleton variant="avatar" shape="circle" />
  
  {/* 内容 */}
  <div className="flex-1">
    <Skeleton variant="text" width="200px" className="mb-2" />
    <Skeleton variant="text" rows={2} paragraph />
  </div>
</div>

{/* 图片卡片 */}
<div className="mt-4">
  <Skeleton variant="image" />
  <Skeleton variant="text" rows={2} paragraph className="mt-2" />
  <Skeleton variant="button" className="mt-2" />
</div>
```

## 加载状态控制

通常与数据加载状态结合使用。

### Vue 3

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { Skeleton } from '@tigercat/vue'

const loading = ref(true)
const data = ref(null)

onMounted(async () => {
  // 模拟数据加载
  await new Promise(resolve => setTimeout(resolve, 2000))
  data.value = { title: '标题', content: '内容...' }
  loading.value = false
})
</script>

<template>
  <div v-if="loading">
    <Skeleton variant="text" width="200px" class="mb-2" />
    <Skeleton variant="text" :rows="3" paragraph />
  </div>
  <div v-else>
    <h2>{{ data.title }}</h2>
    <p>{{ data.content }}</p>
  </div>
</template>
```

### React

```tsx
import { useState, useEffect } from 'react'
import { Skeleton } from '@tigercat/react'

function DataLoader() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setData({ title: '标题', content: '内容...' })
      setLoading(false)
    }, 2000)
  }, [])
  
  if (loading) {
    return (
      <div>
        <Skeleton variant="text" width="200px" className="mb-2" />
        <Skeleton variant="text" rows={3} paragraph />
      </div>
    )
  }
  
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
    </div>
  )
}
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'text' \| 'avatar' \| 'image' \| 'button' \| 'custom'` | `'text'` | 骨架屏变体 |
| `animation` | `'pulse' \| 'wave' \| 'none'` | `'pulse'` | 动画类型 |
| `width` | `string` | - | 自定义宽度（CSS 值） |
| `height` | `string` | - | 自定义高度（CSS 值） |
| `shape` | `'circle' \| 'square'` | `'circle'` | 形状（仅用于 avatar 变体） |
| `rows` | `number` | `1` | 行数（仅用于 text 变体） |
| `paragraph` | `boolean` | `false` | 是否使用段落模式（仅用于 text 变体） |
| `className` | `string` | `''` | 自定义 CSS 类名 |

### 默认尺寸

不同变体的默认尺寸：

| 变体 | 默认宽度 | 默认高度 |
|------|----------|----------|
| `text` | `100%` | `1rem` (~16px) |
| `avatar` | `2.5rem` (40px) | `2.5rem` (40px) |
| `image` | `100%` | `12rem` (~192px) |
| `button` | `6rem` (~96px) | `2.5rem` (~40px) |
| `custom` | `100%` | `1rem` (~16px) |

## 主题定制

Skeleton 组件使用 Tailwind CSS 类，可以通过 `className` 属性进行定制。

### Vue 3

```vue
<template>
  <!-- 自定义背景色 -->
  <Skeleton className="bg-blue-100" />
  
  <!-- 自定义圆角 -->
  <Skeleton className="rounded-xl" />
  
  <!-- 组合自定义 -->
  <Skeleton className="bg-gray-100 rounded-lg shadow-sm" />
</template>
```

### React

```tsx
{/* 自定义背景色 */}
<Skeleton className="bg-blue-100" />

{/* 自定义圆角 */}
<Skeleton className="rounded-xl" />

{/* 组合自定义 */}
<Skeleton className="bg-gray-100 rounded-lg shadow-sm" />
```

## 辅助功能

Skeleton 组件使用语义化的 HTML 结构，确保良好的可访问性：

- 使用 `div` 元素作为容器
- 应用适当的 ARIA 属性（如需要）
- 支持键盘导航

## 最佳实践

1. **匹配内容结构**：骨架屏应该尽量匹配实际内容的结构和布局
2. **适当的动画**：使用 `pulse` 动画提供视觉反馈，避免使用 `none` 除非有特殊需求
3. **组合使用**：结合多个 Skeleton 组件创建完整的加载状态
4. **响应式设计**：使用百分比宽度或 Tailwind 响应式类确保在不同屏幕尺寸下正常显示
5. **加载时长**：骨架屏适合中等时长的加载（1-3秒），过长应考虑其他方案

## 注意事项

- `rows` 和 `paragraph` 属性仅在 `variant="text"` 时有效
- `shape` 属性仅在 `variant="avatar"` 时有效
- 自定义的 `width` 和 `height` 会覆盖变体的默认尺寸
- 在段落模式下，最后一行的宽度固定为 60%
