# Divider 分割线

用于分隔内容的分割线组件，支持横向/纵向、自定义颜色/间距/样式。

## 基本用法

### Vue 3

```vue
<script setup>
import { Divider } from '@tigercat/vue';
</script>

<template>
  <div>
    <p>Content above</p>
    <Divider />
    <p>Content below</p>
  </div>
</template>
```

### React

```tsx
import { Divider } from '@tigercat/react';

function App() {
  return (
    <div>
      <p>Content above</p>
      <Divider />
      <p>Content below</p>
    </div>
  );
}
```

## 方向 (Orientation)

Divider 组件支持横向和纵向两种方向：

- `horizontal` - 横向分割线（默认）
- `vertical` - 纵向分割线

### Vue 3

```vue
<template>
  <!-- 横向分割线 -->
  <Divider orientation="horizontal" />

  <!-- 纵向分割线 -->
  <div class="flex h-20">
    <span>Left content</span>
    <Divider orientation="vertical" />
    <span>Right content</span>
  </div>
</template>
```

### React

```tsx
{
  /* 横向分割线 */
}
<Divider orientation="horizontal" />;

{
  /* 纵向分割线 */
}
<div className="flex h-20">
  <span>Left content</span>
  <Divider orientation="vertical" />
  <span>Right content</span>
</div>;
```

## 线条样式 (Line Style)

Divider 组件支持 3 种不同的线条样式：

- `solid` - 实线（默认）
- `dashed` - 虚线
- `dotted` - 点线

### Vue 3

```vue
<template>
  <Divider lineStyle="solid" />
  <Divider lineStyle="dashed" />
  <Divider lineStyle="dotted" />
</template>
```

### React

```tsx
<Divider lineStyle="solid" />
<Divider lineStyle="dashed" />
<Divider lineStyle="dotted" />
```

## 间距 (Spacing)

Divider 组件支持 6 种不同的间距大小：

- `none` - 无间距
- `xs` - 极小间距
- `sm` - 小间距
- `md` - 中等间距（默认）
- `lg` - 大间距
- `xl` - 超大间距

### Vue 3

```vue
<template>
  <Divider spacing="none" />
  <Divider spacing="xs" />
  <Divider spacing="sm" />
  <Divider spacing="md" />
  <Divider spacing="lg" />
  <Divider spacing="xl" />
</template>
```

### React

```tsx
<Divider spacing="none" />
<Divider spacing="xs" />
<Divider spacing="sm" />
<Divider spacing="md" />
<Divider spacing="lg" />
<Divider spacing="xl" />
```

## 自定义颜色 (Custom Color)

通过 `color` 属性可以自定义分割线的颜色，支持任何有效的 CSS 颜色值。

> 默认情况下，Divider 使用主题边框色变量 `--tiger-border`（带 fallback），因此在全局主题切换时会自动跟随。

### Vue 3

```vue
<template>
  <!-- 使用颜色名称 -->
  <Divider color="red" />

  <!-- 使用十六进制颜色 -->
  <Divider color="#ff6b6b" />

  <!-- 使用 RGB 颜色 -->
  <Divider color="rgb(59, 130, 246)" />

  <!-- 使用 CSS 变量 -->
  <Divider color="var(--tiger-primary)" />
</template>
```

### React

```tsx
{
  /* 使用颜色名称 */
}
<Divider color="red" />;

{
  /* 使用十六进制颜色 */
}
<Divider color="#ff6b6b" />;

{
  /* 使用 RGB 颜色 */
}
<Divider color="rgb(59, 130, 246)" />;

{
  /* 使用 CSS 变量 */
}
<Divider color="var(--tiger-primary)" />;
```

## 自定义粗细 (Custom Thickness)

通过 `thickness` 属性可以自定义分割线的粗细。

### Vue 3

```vue
<template>
  <Divider thickness="1px" />
  <Divider thickness="2px" />
  <Divider thickness="4px" />
  <Divider orientation="vertical" thickness="2px" />
</template>
```

### React

```tsx
<Divider thickness="1px" />
<Divider thickness="2px" />
<Divider thickness="4px" />
<Divider orientation="vertical" thickness="2px" />
```

## 组合使用

### Vue 3

```vue
<template>
  <!-- 红色虚线，大间距 -->
  <Divider lineStyle="dashed" color="#ef4444" spacing="lg" />

  <!-- 蓝色粗实线，小间距 -->
  <Divider lineStyle="solid" color="#3b82f6" thickness="3px" spacing="sm" />

  <!-- 纵向点线 -->
  <div class="flex h-32">
    <div>Content 1</div>
    <Divider orientation="vertical" lineStyle="dotted" color="#10b981" />
    <div>Content 2</div>
  </div>
</template>
```

### React

```tsx
{
  /* 红色虚线，大间距 */
}
<Divider lineStyle="dashed" color="#ef4444" spacing="lg" />;

{
  /* 蓝色粗实线，小间距 */
}
<Divider lineStyle="solid" color="#3b82f6" thickness="3px" spacing="sm" />;

{
  /* 纵向点线 */
}
<div className="flex h-32">
  <div>Content 1</div>
  <Divider orientation="vertical" lineStyle="dotted" color="#10b981" />
  <div>Content 2</div>
</div>;
```

## API

### Props / 属性

| 属性        | 说明       | 类型                 | 默认值         | 可选值                                                     |
| ----------- | ---------- | -------------------- | -------------- | ---------------------------------------------------------- |
| orientation | 分割线方向 | `DividerOrientation` | `'horizontal'` | `'horizontal'` \| `'vertical'`                             |
| lineStyle   | 线条样式   | `DividerLineStyle`   | `'solid'`      | `'solid'` \| `'dashed'` \| `'dotted'`                      |
| spacing     | 间距大小   | `DividerSpacing`     | `'md'`         | `'none'` \| `'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` |
| color       | 自定义颜色 | `string`             | -              | 任何有效的 CSS 颜色值                                      |
| thickness   | 自定义粗细 | `string`             | -              | 任何有效的 CSS 尺寸值（如 `'1px'`, `'2px'`）               |

#### React 专属属性

| 属性      | 说明            | 类型     | 默认值 |
| --------- | --------------- | -------- | ------ |
| className | 额外的 CSS 类名 | `string` | -      |

## 样式定制

Divider 组件使用 Tailwind CSS 构建，可以通过多种方式进行样式定制。

### 使用 className (React)

React 版本的 Divider 组件支持 `className` 属性，可以传入额外的 CSS 类：

```tsx
<Divider className="shadow-sm" />
```

### 使用 color 和 thickness 属性

通过 `color` 和 `thickness` 属性可以快速自定义分割线的外观：

```tsx
<Divider color="#ff6b6b" thickness="2px" />
```

### 间距映射

内置间距大小映射（横向/纵向）：

- `none`: 无间距
- `xs`: `my-1` / `mx-1` (0.25rem)
- `sm`: `my-2` / `mx-2` (0.5rem)
- `md`: `my-4` / `mx-4` (1rem)
- `lg`: `my-6` / `mx-6` (1.5rem)
- `xl`: `my-8` / `mx-8` (2rem)

## 无障碍 (Accessibility)

- 使用语义化的 `role="separator"` 属性
- 提供 `aria-orientation` 属性标识方向
- 支持屏幕阅读器识别分割线元素

## TypeScript 支持

Divider 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  DividerProps,
  DividerOrientation,
  DividerLineStyle,
  DividerSpacing,
} from '@tigercat/core';

// Vue
import type { Divider } from '@tigercat/vue';

// React
import type {
  Divider,
  DividerProps as ReactDividerProps,
} from '@tigercat/react';
```

## 示例

### 卡片分隔

#### Vue 3

```vue
<script setup>
import { Divider } from '@tigercat/vue';
</script>

<template>
  <div class="p-4 border rounded-lg">
    <h3 class="text-lg font-bold">Section 1</h3>
    <p>Content for section 1</p>

    <Divider spacing="lg" />

    <h3 class="text-lg font-bold">Section 2</h3>
    <p>Content for section 2</p>
  </div>
</template>
```

#### React

```tsx
import { Divider } from '@tigercat/react';

function CardExample() {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold">Section 1</h3>
      <p>Content for section 1</p>

      <Divider spacing="lg" />

      <h3 className="text-lg font-bold">Section 2</h3>
      <p>Content for section 2</p>
    </div>
  );
}
```

### 侧边栏分隔

#### Vue 3

```vue
<template>
  <div class="flex h-screen">
    <!-- 左侧内容 -->
    <div class="w-64 p-4">
      <h2>Sidebar</h2>
      <nav>Navigation items</nav>
    </div>

    <!-- 纵向分割线 -->
    <Divider orientation="vertical" spacing="none" />

    <!-- 主要内容 -->
    <div class="flex-1 p-4">
      <h1>Main Content</h1>
      <p>Page content here</p>
    </div>
  </div>
</template>
```

#### React

```tsx
<div className="flex h-screen">
  {/* 左侧内容 */}
  <div className="w-64 p-4">
    <h2>Sidebar</h2>
    <nav>Navigation items</nav>
  </div>

  {/* 纵向分割线 */}
  <Divider orientation="vertical" spacing="none" />

  {/* 主要内容 */}
  <div className="flex-1 p-4">
    <h1>Main Content</h1>
    <p>Page content here</p>
  </div>
</div>
```

### 列表分隔

#### Vue 3

```vue
<template>
  <div>
    <div class="py-2">Item 1</div>
    <Divider spacing="none" lineStyle="dashed" color="#e5e7eb" />

    <div class="py-2">Item 2</div>
    <Divider spacing="none" lineStyle="dashed" color="#e5e7eb" />

    <div class="py-2">Item 3</div>
  </div>
</template>
```

#### React

```tsx
<div>
  <div className="py-2">Item 1</div>
  <Divider spacing="none" lineStyle="dashed" color="#e5e7eb" />

  <div className="py-2">Item 2</div>
  <Divider spacing="none" lineStyle="dashed" color="#e5e7eb" />

  <div className="py-2">Item 3</div>
</div>
```

## 注意事项

1. **纵向分割线高度**：使用纵向分割线时，需要确保父容器有明确的高度，否则分割线可能不可见。

   ```tsx
   {
     /* ✅ 正确 - 父容器有高度 */
   }
   <div className="flex h-20">
     <span>Left</span>
     <Divider orientation="vertical" />
     <span>Right</span>
   </div>;

   {
     /* ❌ 错误 - 父容器没有高度 */
   }
   <div className="flex">
     <span>Left</span>
     <Divider orientation="vertical" />
     <span>Right</span>
   </div>;
   ```

2. **间距选择**：根据使用场景选择合适的间距大小，避免分割线占用过多空间。

3. **颜色对比度**：确保分割线颜色与背景有足够的对比度，以提高可访问性。
