# Badge 徽章

用于标记和通知的徽章组件，支持点状、数字、文本等多种展示方式。

## 基本用法

### Vue 3

```vue
<script setup>
import { Badge } from '@tigercat/vue'
</script>

<template>
  <Badge :content="5" />
  <Badge :content="99" />
  <Badge content="Hot" />
</template>
```

### React

```tsx
import { Badge } from '@tigercat/react'

function App() {
  return (
    <>
      <Badge content={5} />
      <Badge content={99} />
      <Badge content="Hot" />
    </>
  )
}
```

## 徽章变体 (Variants)

Badge 组件支持 6 种不同的变体：

- `default` - 默认徽章，灰色背景
- `primary` - 主要徽章，蓝色背景
- `success` - 成功徽章，绿色背景
- `warning` - 警告徽章，黄色背景
- `danger` - 危险徽章，红色背景（默认）
- `info` - 信息徽章，天蓝色背景

### Vue 3

```vue
<template>
  <Badge variant="default" :content="1" />
  <Badge variant="primary" :content="2" />
  <Badge variant="success" :content="3" />
  <Badge variant="warning" :content="4" />
  <Badge variant="danger" :content="5" />
  <Badge variant="info" :content="6" />
</template>
```

### React

```tsx
<Badge variant="default" content={1} />
<Badge variant="primary" content={2} />
<Badge variant="success" content={3} />
<Badge variant="warning" content={4} />
<Badge variant="danger" content={5} />
<Badge variant="info" content={6} />
```

## 徽章尺寸 (Sizes)

Badge 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Badge size="sm" :content="5" />
  <Badge size="md" :content="10" />
  <Badge size="lg" :content="99" />
</template>
```

### React

```tsx
<Badge size="sm" content={5} />
<Badge size="md" content={10} />
<Badge size="lg" content={99} />
```

## 徽章类型 (Types)

Badge 组件支持 3 种展示类型：

### 点状徽章 (Dot)

用于简单的通知提示，不显示具体数字。

#### Vue 3

```vue
<template>
  <Badge type="dot" />
</template>
```

#### React

```tsx
<Badge type="dot" />
```

### 数字徽章 (Number)

显示数字内容，默认类型。

#### Vue 3

```vue
<template>
  <Badge type="number" :content="5" />
  <Badge type="number" :content="99" />
</template>
```

#### React

```tsx
<Badge type="number" content={5} />
<Badge type="number" content={99} />
```

### 文本徽章 (Text)

显示文本内容。

#### Vue 3

```vue
<template>
  <Badge type="text" content="NEW" />
  <Badge type="text" content="HOT" />
</template>
```

#### React

```tsx
<Badge type="text" content="NEW" />
<Badge type="text" content="HOT" />
```

## 最大值 (Max Count)

当数字超过最大值时，显示 `{max}+`。默认最大值为 99。

### Vue 3

```vue
<template>
  <Badge :content="100" />
  <!-- 显示 99+ -->

  <Badge :content="1000" :max="999" />
  <!-- 显示 999+ -->
</template>
```

### React

```tsx
;<Badge content={100} />
{
  /* 显示 99+ */
}

;<Badge content={1000} max={999} />
{
  /* 显示 999+ */
}
```

## 显示零值 (Show Zero)

默认情况下，当 `content` 为 0 时不显示徽章。可以通过 `showZero` 属性控制。

### Vue 3

```vue
<template>
  <Badge :content="0" />
  <!-- 不显示 -->

  <Badge :content="0" :show-zero="true" />
  <!-- 显示 0 -->
</template>
```

### React

```tsx
;<Badge content={0} />
{
  /* 不显示 */
}

;<Badge content={0} showZero={true} />
{
  /* 显示 0 */
}
```

## 包裹模式 (Wrapper Mode)

可以将徽章附加到其他元素上，通过 `standalone` 属性控制。

### Vue 3

```vue
<template>
  <!-- 独立徽章（默认） -->
  <Badge :content="5" />

  <!-- 包裹模式 -->
  <Badge :content="5" :standalone="false">
    <button>通知</button>
  </Badge>

  <Badge :content="99" :standalone="false">
    <Icon name="bell" />
  </Badge>
</template>
```

### React

```tsx
{/* 独立徽章（默认） */}
<Badge content={5} />

{/* 包裹模式 */}
<Badge content={5} standalone={false}>
  <button>通知</button>
</Badge>

<Badge content={99} standalone={false}>
  <Icon name="bell" />
</Badge>
```

## 徽章位置 (Position)

当使用包裹模式时，可以设置徽章的位置。

- `top-right` - 右上角（默认）
- `top-left` - 左上角
- `bottom-right` - 右下角
- `bottom-left` - 左下角

### Vue 3

```vue
<template>
  <Badge :content="5" :standalone="false" position="top-right">
    <button>右上</button>
  </Badge>

  <Badge :content="5" :standalone="false" position="top-left">
    <button>左上</button>
  </Badge>

  <Badge :content="5" :standalone="false" position="bottom-right">
    <button>右下</button>
  </Badge>

  <Badge :content="5" :standalone="false" position="bottom-left">
    <button>左下</button>
  </Badge>
</template>
```

### React

```tsx
<Badge content={5} standalone={false} position="top-right">
  <button>右上</button>
</Badge>

<Badge content={5} standalone={false} position="top-left">
  <button>左上</button>
</Badge>

<Badge content={5} standalone={false} position="bottom-right">
  <button>右下</button>
</Badge>

<Badge content={5} standalone={false} position="bottom-left">
  <button>左下</button>
</Badge>
```

## 实际应用示例

### 消息通知

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Badge } from '@tigercat/vue'

const unreadMessages = ref(5)
</script>

<template>
  <Badge :content="unreadMessages" :standalone="false">
    <button class="px-4 py-2 bg-blue-500 text-white rounded">消息</button>
  </Badge>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Badge } from '@tigercat/react'

function MessageButton() {
  const [unreadMessages, setUnreadMessages] = useState(5)

  return (
    <Badge content={unreadMessages} standalone={false}>
      <button className="px-4 py-2 bg-blue-500 text-white rounded">消息</button>
    </Badge>
  )
}
```

### 购物车

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Badge } from '@tigercat/vue'

const cartItems = ref(3)
</script>

<template>
  <Badge :content="cartItems" :standalone="false" variant="danger">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  </Badge>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Badge } from '@tigercat/react'

function ShoppingCart() {
  const [cartItems, setCartItems] = useState(3)

  return (
    <Badge content={cartItems} standalone={false} variant="danger">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    </Badge>
  )
}
```

### 在线状态指示器

#### Vue 3

```vue
<template>
  <div class="flex items-center gap-4">
    <Badge type="dot" variant="success" :standalone="false">
      <img src="/avatar.jpg" alt="User" class="w-10 h-10 rounded-full" />
    </Badge>
    <span>在线</span>
  </div>
</template>
```

#### React

```tsx
<div className="flex items-center gap-4">
  <Badge type="dot" variant="success" standalone={false}>
    <img src="/avatar.jpg" alt="User" className="w-10 h-10 rounded-full" />
  </Badge>
  <span>在线</span>
</div>
```

### 新功能标签

#### Vue 3

```vue
<template>
  <Badge type="text" content="NEW" variant="danger" :standalone="false" position="top-right">
    <button class="px-6 py-2 bg-gray-100 rounded">新功能</button>
  </Badge>
</template>
```

#### React

```tsx
<Badge type="text" content="NEW" variant="danger" standalone={false} position="top-right">
  <button className="px-6 py-2 bg-gray-100 rounded">新功能</button>
</Badge>
```

## API

### Props

| 属性       | 说明                                            | 类型                                                                     | 默认值        |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------ | ------------- |
| variant    | 徽章变体                                        | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'`    |
| size       | 徽章尺寸                                        | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`        |
| type       | 徽章类型                                        | `'dot' \| 'number' \| 'text'`                                            | `'number'`    |
| content    | 徽章内容（数字或文本）                          | `number \| string`                                                       | -             |
| max        | 最大显示数值（仅 type='number' 时有效）         | `number`                                                                 | `99`          |
| showZero   | 是否显示零值                                    | `boolean`                                                                | `false`       |
| position   | 徽章位置（非独立模式）                          | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'`           | `'top-right'` |
| standalone | 是否为独立徽章                                  | `boolean`                                                                | `true`        |
| className  | 自定义 CSS 类名                                 | `string`                                                                 | -             |
| style      | 自定义样式（Vue 为 prop；React 为原生 `style`） | `Record<string, string \| number>`                                       | -             |

### Slots (Vue)

| 名称    | 说明                                          |
| ------- | --------------------------------------------- |
| default | 被包裹的内容（当 `standalone` 为 `false` 时） |

### Children (React)

| 名称     | 说明                                          |
| -------- | --------------------------------------------- |
| children | 被包裹的内容（当 `standalone` 为 `false` 时） |

## 样式定制

Badge 组件使用 Tailwind CSS 类，可以通过 Tailwind 配置自定义颜色。同时也支持 CSS 变量进行主题定制。

### 主题变量

```css
:root {
  /* 变体颜色（Badge 默认使用这些变量作为背景/边框色） */
  --tiger-primary: #2563eb;
  --tiger-success: #16a34a;
  --tiger-warning: #ca8a04;
  --tiger-error: #dc2626;
  --tiger-info: #3b82f6;

  /* default 变体使用该变量 */
  --tiger-text-muted: #6b7280;
}
```

## 可访问性

- Badge 使用 `role="status"` 属性提供语义化信息
- 数字徽章包含 `aria-label` 属性，描述通知数量
- 点状徽章包含 `aria-label="notification"` 属性
- 文本徽章的 `aria-label` 默认为文本内容
- 支持屏幕阅读器访问

## 使用场景

- **消息通知** - 显示未读消息数量
- **购物车** - 显示购物车商品数量
- **新内容提示** - 标记新功能或新内容
- **在线状态** - 使用点状徽章显示用户在线状态
- **数据统计** - 显示统计数字
- **状态标记** - 使用不同颜色标记不同状态

## 设计原则

Badge 组件遵循以下设计原则：

1. **醒目但不突兀** - 使用适中的大小和颜色，确保信息传达清晰但不干扰主要内容
2. **信息简洁** - 数字超过最大值时显示 `{max}+`，避免显示过长的数字
3. **灵活定位** - 支持四个方向的定位，适应不同的布局需求
4. **主题一致** - 使用与其他 Tigercat 组件一致的颜色系统和视觉风格
5. **响应式** - 支持多种尺寸，适配不同场景
