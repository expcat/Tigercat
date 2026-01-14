# Space 间距

设置组件之间的间距，自动管理元素的间隔。

## 基本用法

### Vue 3

```vue
<script setup>
import { Space, Button } from '@tigercat/vue'
</script>

<template>
  <Space>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>
</template>
```

### React

```tsx
import { Space, Button } from '@tigercat/react'

function App() {
  return (
    <Space>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>
  )
}
```

## 间距方向 (Direction)

Space 组件支持水平和垂直两种方向：

- `horizontal` - 水平方向（默认）
- `vertical` - 垂直方向

### Vue 3

```vue
<template>
  <div>
    <h3>水平间距</h3>
    <Space direction="horizontal">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>

    <h3>垂直间距</h3>
    <Space direction="vertical">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>
  </div>
</template>
```

### React

```tsx
<div>
  <h3>水平间距</h3>
  <Space direction="horizontal">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>

  <h3>垂直间距</h3>
  <Space direction="vertical">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>
</div>
```

## 间距大小 (Size)

Space 组件支持 3 种预设尺寸和自定义数值：

- `sm` - 小间距（8px）
- `md` - 中等间距（16px，默认）
- `lg` - 大间距（24px）
- 数字 - 自定义间距（单位：px）

### Vue 3

```vue
<template>
  <div>
    <h3>小间距</h3>
    <Space size="sm">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>

    <h3>中等间距（默认）</h3>
    <Space size="md">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>

    <h3>大间距</h3>
    <Space size="lg">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>

    <h3>自定义间距（32px）</h3>
    <Space :size="32">
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
    </Space>
  </div>
</template>
```

### React

```tsx
<div>
  <h3>小间距</h3>
  <Space size="sm">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>

  <h3>中等间距（默认）</h3>
  <Space size="md">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>

  <h3>大间距</h3>
  <Space size="lg">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>

  <h3>自定义间距（32px）</h3>
  <Space size={32}>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>
</div>
```

## 对齐方式 (Align)

Space 组件支持多种对齐方式：

- `start` - 起始对齐（默认）
- `end` - 末尾对齐
- `center` - 居中对齐
- `baseline` - 基线对齐
- `stretch` - 拉伸对齐

### Vue 3

```vue
<template>
  <div>
    <h3>起始对齐</h3>
    <Space align="start">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Space>

    <h3>末尾对齐</h3>
    <Space align="end">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Space>

    <h3>居中对齐</h3>
    <Space align="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Space>

    <h3>基线对齐</h3>
    <Space align="baseline">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Space>
  </div>
</template>
```

### React

```tsx
<div>
  <h3>起始对齐</h3>
  <Space align="start">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Space>

  <h3>末尾对齐</h3>
  <Space align="end">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Space>

  <h3>居中对齐</h3>
  <Space align="center">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Space>

  <h3>基线对齐</h3>
  <Space align="baseline">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </Space>
</div>
```

## 自动换行 (Wrap)

通过 `wrap` 属性控制是否自动换行。

### Vue 3

```vue
<template>
  <div style="max-width: 300px">
    <h3>自动换行</h3>
    <Space wrap>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
      <Button>Button 4</Button>
      <Button>Button 5</Button>
      <Button>Button 6</Button>
    </Space>
  </div>
</template>
```

### React

```tsx
<div style={{ maxWidth: 300 }}>
  <h3>自动换行</h3>
  <Space wrap>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
    <Button>Button 4</Button>
    <Button>Button 5</Button>
    <Button>Button 6</Button>
  </Space>
</div>
```

## 组合使用

### Vue 3

```vue
<template>
  <div>
    <h3>垂直方向，大间距，居中对齐</h3>
    <Space direction="vertical" size="lg" align="center">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
    </Space>

    <h3>水平方向，小间距，自动换行</h3>
    <div style="max-width: 400px">
      <Space size="sm" wrap>
        <Button size="sm">Tag 1</Button>
        <Button size="sm">Tag 2</Button>
        <Button size="sm">Tag 3</Button>
        <Button size="sm">Tag 4</Button>
        <Button size="sm">Tag 5</Button>
        <Button size="sm">Tag 6</Button>
        <Button size="sm">Tag 7</Button>
      </Space>
    </div>
  </div>
</template>
```

### React

```tsx
<div>
  <h3>垂直方向，大间距，居中对齐</h3>
  <Space direction="vertical" size="lg" align="center">
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="outline">Outline Button</Button>
  </Space>

  <h3>水平方向，小间距，自动换行</h3>
  <div style={{ maxWidth: 400 }}>
    <Space size="sm" wrap>
      <Button size="sm">Tag 1</Button>
      <Button size="sm">Tag 2</Button>
      <Button size="sm">Tag 3</Button>
      <Button size="sm">Tag 4</Button>
      <Button size="sm">Tag 5</Button>
      <Button size="sm">Tag 6</Button>
      <Button size="sm">Tag 7</Button>
    </Space>
  </div>
</div>
```

## API

### Props / 属性

| 属性      | 说明         | 类型             | 默认值         | 可选值                                                            |
| --------- | ------------ | ---------------- | -------------- | ----------------------------------------------------------------- |
| direction | 间距方向     | `SpaceDirection` | `'horizontal'` | `'horizontal'` \| `'vertical'`                                    |
| size      | 间距大小     | `SpaceSize`      | `'md'`         | `'sm'` \| `'md'` \| `'lg'` \| `number`                            |
| align     | 对齐方式     | `SpaceAlign`     | `'start'`      | `'start'` \| `'end'` \| `'center'` \| `'baseline'` \| `'stretch'` |
| wrap      | 是否自动换行 | `boolean`        | `false`        | `true` \| `false`                                                 |

#### React 专属属性

| 属性      | 说明            | 类型                  | 默认值 |
| --------- | --------------- | --------------------- | ------ |
| className | 额外的 CSS 类名 | `string`              | -      |
| style     | 自定义样式      | `React.CSSProperties` | -      |
| children  | 子元素          | `React.ReactNode`     | -      |

> 说明：React 版本会把其余 `div` 原生属性（如 `id`、`data-*`、`aria-*`）透传到根节点。

### Slots / 插槽 (Vue)

| 插槽名  | 说明     |
| ------- | -------- |
| default | 间距内容 |

## 样式定制

Space 组件使用 Tailwind CSS 构建，可以通过以下方式自定义样式：

### 自定义间距

使用 `size` 属性传入数字，单位为像素：

#### Vue 3

```vue
<template>
  <Space :size="48">
    <Button>Button 1</Button>
    <Button>Button 2</Button>
  </Space>
</template>
```

#### React

```tsx
<Space size={48}>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Space>
```

### React 额外样式

React 版本的 Space 组件支持 `className` 和 `style` 属性：

```tsx
<Space className="bg-gray-100 p-4" style={{ borderRadius: '8px' }}>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Space>
```

## 无障碍 (Accessibility)

- Space 组件使用标准的 flexbox 布局
- 支持键盘导航和焦点管理
- 保持内容的语义结构
- 适配屏幕阅读器

## TypeScript 支持

Space 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { SpaceProps, SpaceDirection, SpaceSize, SpaceAlign } from '@tigercat/core'

// Vue
import type { VueSpaceProps } from '@tigercat/vue'

// React
import type { SpaceProps as ReactSpaceProps } from '@tigercat/react'
```

## 示例

### 表单按钮组

#### Vue 3

```vue
<script setup>
import { Space, Button } from '@tigercat/vue'

const handleSubmit = () => {
  console.log('Submit')
}

const handleCancel = () => {
  console.log('Cancel')
}
</script>

<template>
  <Space>
    <Button variant="outline" @click="handleCancel">取消</Button>
    <Button variant="primary" @click="handleSubmit">提交</Button>
  </Space>
</template>
```

#### React

```tsx
import { Space, Button } from '@tigercat/react'

function FormActions() {
  const handleSubmit = () => {
    console.log('Submit')
  }

  const handleCancel = () => {
    console.log('Cancel')
  }

  return (
    <Space>
      <Button variant="outline" onClick={handleCancel}>
        取消
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        提交
      </Button>
    </Space>
  )
}
```

### 垂直导航菜单

#### Vue 3

```vue
<template>
  <Space direction="vertical" size="sm" align="stretch">
    <Button variant="ghost">首页</Button>
    <Button variant="ghost">产品</Button>
    <Button variant="ghost">关于</Button>
    <Button variant="ghost">联系</Button>
  </Space>
</template>
```

#### React

```tsx
<Space direction="vertical" size="sm" align="stretch">
  <Button variant="ghost">首页</Button>
  <Button variant="ghost">产品</Button>
  <Button variant="ghost">关于</Button>
  <Button variant="ghost">联系</Button>
</Space>
```

### 标签云

#### Vue 3

```vue
<template>
  <div style="max-width: 500px">
    <Space wrap size="sm">
      <Button size="sm" variant="outline">JavaScript</Button>
      <Button size="sm" variant="outline">TypeScript</Button>
      <Button size="sm" variant="outline">Vue</Button>
      <Button size="sm" variant="outline">React</Button>
      <Button size="sm" variant="outline">CSS</Button>
      <Button size="sm" variant="outline">Tailwind</Button>
      <Button size="sm" variant="outline">Node.js</Button>
      <Button size="sm" variant="outline">Git</Button>
    </Space>
  </div>
</template>
```

#### React

```tsx
<div style={{ maxWidth: 500 }}>
  <Space wrap size="sm">
    <Button size="sm" variant="outline">
      JavaScript
    </Button>
    <Button size="sm" variant="outline">
      TypeScript
    </Button>
    <Button size="sm" variant="outline">
      Vue
    </Button>
    <Button size="sm" variant="outline">
      React
    </Button>
    <Button size="sm" variant="outline">
      CSS
    </Button>
    <Button size="sm" variant="outline">
      Tailwind
    </Button>
    <Button size="sm" variant="outline">
      Node.js
    </Button>
    <Button size="sm" variant="outline">
      Git
    </Button>
  </Space>
</div>
```

## 使用建议

1. **选择合适的方向**：根据布局需求选择水平或垂直方向
2. **统一间距**：在同一个界面中使用一致的间距大小
3. **灵活使用自定义尺寸**：当预设尺寸不满足需求时，使用数字自定义间距
4. **注意换行**：对于可能超出容器宽度的内容，启用 `wrap` 属性
5. **对齐方式**：根据内容特点选择合适的对齐方式，提升视觉效果
