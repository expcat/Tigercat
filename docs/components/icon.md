# Icon 图标

灵活的图标组件，支持自定义 SVG 内容和多种尺寸。

## 基本用法

Icon 组件提供了一个通用的图标容器，可以包裹任何 SVG 内容。

### Vue 3

```vue
<script setup>
import { Icon } from '@tigercat/vue';
</script>

<template>
  <Icon>
    <svg>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </Icon>
</template>
```

### React

```tsx
import { Icon } from '@tigercat/react';

function App() {
  return (
    <Icon>
      <svg>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </Icon>
  );
}
```

## 图标尺寸 (Sizes)

Icon 组件支持 4 种不同的尺寸：

- `sm` - 小尺寸 (16px)
- `md` - 中等尺寸（默认，20px）
- `lg` - 大尺寸 (24px)
- `xl` - 超大尺寸 (32px)

### Vue 3

```vue
<template>
  <Icon size="sm">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>

  <Icon size="md">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>

  <Icon size="lg">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>

  <Icon size="xl">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>
</template>
```

### React

```tsx
<Icon size="sm">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>

<Icon size="md">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>

<Icon size="lg">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>

<Icon size="xl">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>
```

## 颜色定制 (Color Customization)

通过 `color` 属性自定义图标颜色。默认值为 `currentColor`，会继承父元素的文本颜色。

### Vue 3

```vue
<template>
  <!-- 继承父元素颜色 -->
  <div class="text-blue-500">
    <Icon>
      <svg>
        <path d="M5 13l4 4L19 7" />
      </svg>
    </Icon>
  </div>

  <!-- 直接设置颜色 -->
  <Icon color="#ff0000">
    <svg>
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>

  <!-- 使用 Tailwind 颜色 -->
  <Icon color="rgb(59, 130, 246)">
    <svg>
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>
</template>
```

### React

```tsx
{
  /* 继承父元素颜色 */
}
<div className="text-blue-500">
  <Icon>
    <svg>
      <path d="M5 13l4 4L19 7" />
    </svg>
  </Icon>
</div>;

{
  /* 直接设置颜色 */
}
<Icon color="#ff0000">
  <svg>
    <path d="M5 13l4 4L19 7" />
  </svg>
</Icon>;

{
  /* 使用 RGB 颜色 */
}
<Icon color="rgb(59, 130, 246)">
  <svg>
    <path d="M5 13l4 4L19 7" />
  </svg>
</Icon>;
```

## 自定义 SVG 图标

Icon 组件会自动为 SVG 元素添加合适的属性，如 `stroke`、`fill`、`viewBox` 等。

### Vue 3

```vue
<script setup>
import { Icon } from '@tigercat/vue';

// 自定义心形图标
const HeartIcon = () => (
  <Icon size="lg" color="#ef4444">
    <svg>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </Icon>
);

// 自定义星形图标
const StarIcon = () => (
  <Icon size="lg" color="#fbbf24">
    <svg fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </Icon>
);
</script>

<template>
  <HeartIcon />
  <StarIcon />
</template>
```

### React

```tsx
import { Icon } from '@tigercat/react';

// 自定义心形图标
const HeartIcon = () => (
  <Icon size="lg" color="#ef4444">
    <svg>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </Icon>
);

// 自定义星形图标
const StarIcon = () => (
  <Icon size="lg" color="#fbbf24">
    <svg fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </Icon>
);

function App() {
  return (
    <>
      <HeartIcon />
      <StarIcon />
    </>
  );
}
```

## 使用第三方图标库

Icon 组件可以与流行的图标库一起使用，如 Heroicons、Lucide、Font Awesome 等。

### 使用 Heroicons (React)

```tsx
import { Icon } from '@tigercat/react';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';

function App() {
  return (
    <>
      <Icon size="lg">
        <HomeIcon />
      </Icon>

      <Icon size="md" color="#3b82f6">
        <UserIcon />
      </Icon>
    </>
  );
}
```

### 使用 Lucide Icons (Vue)

```vue
<script setup>
import { Icon } from '@tigercat/vue';
import { Home, User, Settings } from 'lucide-vue-next';
</script>

<template>
  <Icon size="lg">
    <Home />
  </Icon>

  <Icon size="md" color="#3b82f6">
    <User />
  </Icon>

  <Icon size="xl" color="#10b981">
    <Settings />
  </Icon>
</template>
```

## 在按钮中使用图标

图标经常与其他组件一起使用，如按钮。

### Vue 3

```vue
<script setup>
import { Button, Icon } from '@tigercat/vue';
</script>

<template>
  <Button variant="primary">
    <Icon size="sm" class="mr-2">
      <svg>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Icon>
    Add Item
  </Button>

  <Button variant="outline">
    <Icon size="sm" class="mr-2">
      <svg>
        <path
          d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </Icon>
    Delete
  </Button>
</template>
```

### React

```tsx
import { Button, Icon } from '@tigercat/react';

function App() {
  return (
    <>
      <Button variant="primary">
        <Icon size="sm" className="mr-2">
          <svg>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Icon>
        Add Item
      </Button>

      <Button variant="outline">
        <Icon size="sm" className="mr-2">
          <svg>
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </Icon>
        Delete
      </Button>
    </>
  );
}
```

## API

### Props / 属性

| 属性      | 说明            | 类型       | 默认值           | 可选值                               |
| --------- | --------------- | ---------- | ---------------- | ------------------------------------ |
| size      | 图标尺寸        | `IconSize` | `'md'`           | `'sm'` \| `'md'` \| `'lg'` \| `'xl'` |
| color     | 图标颜色        | `string`   | `'currentColor'` | 任何有效的 CSS 颜色值                |
| className | 额外的 CSS 类名 | `string`   | -                | -                                    |

#### React 专属属性

| 属性     | 说明                        | 类型              | 默认值 |
| -------- | --------------------------- | ----------------- | ------ |
| children | 图标内容（通常是 SVG 元素） | `React.ReactNode` | -      |

### Slots / 插槽 (Vue)

| 插槽名  | 说明                        |
| ------- | --------------------------- |
| default | 图标内容（通常是 SVG 元素） |

## 样式定制

Icon 组件使用 Tailwind CSS 构建，支持通过 `className` 属性添加自定义样式。

### 添加自定义类

#### Vue 3

```vue
<template>
  <Icon className="shadow-lg rounded-full p-2 bg-blue-100">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>
</template>
```

#### React

```tsx
<Icon className="shadow-lg rounded-full p-2 bg-blue-100">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>
```

## SVG 属性处理

Icon 组件会自动为 SVG 元素添加以下默认属性（如果未指定）：

- `fill`: `"none"`
- `stroke`: `"currentColor"`（配合 `color` prop / 父元素文本颜色）
- `strokeWidth`: `"2"`
- `strokeLinecap`: `"round"`
- `strokeLinejoin`: `"round"`
- `viewBox`: `"0 0 24 24"`
- `xmlns`: `"http://www.w3.org/2000/svg"`

说明：`color` prop 会设置 Icon 外层容器的 CSS `color`，因此默认的 `stroke="currentColor"` 会跟随变化。

你可以在 SVG 元素上显式设置这些属性来覆盖默认值：

### Vue 3

```vue
<template>
  <Icon>
    <svg viewBox="0 0 32 32" fill="currentColor" stroke="none">
      <circle cx="16" cy="16" r="14" />
    </svg>
  </Icon>
</template>
```

### React

```tsx
<Icon>
  <svg viewBox="0 0 32 32" fill="currentColor" stroke="none">
    <circle cx="16" cy="16" r="14" />
  </svg>
</Icon>
```

## 无障碍 (Accessibility)

默认情况下，Icon 会作为“装饰性图标”渲染（外层容器会带 `aria-hidden="true"`）。

当图标具备语义时，给 Icon 添加 `aria-label` / `aria-labelledby`（或 SVG 内含 `<title>`）即可，组件会将外层容器作为可访问的图像节点（默认 `role="img"`）。

### Vue 3

```vue
<template>
  <!-- 装饰性图标 -->
  <Icon aria-hidden="true">
    <svg>
      <circle cx="12" cy="12" r="10" />
    </svg>
  </Icon>

  <!-- 语义化图标 -->
  <Icon aria-label="设置">
    <svg>
      <title>设置</title>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
    </svg>
  </Icon>
</template>
```

### React

```tsx
{
  /* 装饰性图标 */
}
<Icon aria-hidden="true">
  <svg>
    <circle cx="12" cy="12" r="10" />
  </svg>
</Icon>;

{
  /* 语义化图标 */
}
<Icon aria-label="设置">
  <svg>
    <title>设置</title>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
  </svg>
</Icon>;
```

## TypeScript 支持

Icon 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { IconProps, IconSize } from '@tigercat/core';
// Vue
import type { VueIconProps } from '@tigercat/vue';
// React
import type { Icon, IconProps as ReactIconProps } from '@tigercat/react';
```

## 示例集合

### 常用图标示例

#### Vue 3

```vue
<script setup>
import { Icon } from '@tigercat/vue';
</script>

<template>
  <!-- 搜索图标 -->
  <Icon size="md">
    <svg>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  </Icon>

  <!-- 菜单图标 -->
  <Icon size="md">
    <svg>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  </Icon>

  <!-- 关闭图标 -->
  <Icon size="md">
    <svg>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </Icon>

  <!-- 下载图标 -->
  <Icon size="md">
    <svg>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  </Icon>
</template>
```

#### React

```tsx
import { Icon } from '@tigercat/react';

function IconExamples() {
  return (
    <>
      {/* 搜索图标 */}
      <Icon size="md">
        <svg>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </Icon>

      {/* 菜单图标 */}
      <Icon size="md">
        <svg>
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </Icon>

      {/* 关闭图标 */}
      <Icon size="md">
        <svg>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </Icon>

      {/* 下载图标 */}
      <Icon size="md">
        <svg>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      </Icon>
    </>
  );
}
```

### 动画图标

结合 Tailwind CSS 的动画类，可以创建动画图标。

#### Vue 3

```vue
<template>
  <!-- 旋转加载图标 -->
  <Icon size="lg" className="animate-spin">
    <svg>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  </Icon>

  <!-- 脉冲图标 -->
  <Icon size="lg" className="animate-pulse" color="#ef4444">
    <svg>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  </Icon>
</template>
```

#### React

```tsx
{
  /* 旋转加载图标 */
}
<Icon size="lg" className="animate-spin">
  <svg>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
</Icon>;

{
  /* 脉冲图标 */
}
<Icon size="lg" className="animate-pulse" color="#ef4444">
  <svg>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
</Icon>;
```

## 最佳实践

1. **保持 SVG 简洁**：使用优化过的 SVG 代码，移除不必要的属性和元素
2. **使用语义化的组件**：为常用图标创建专门的组件，如 `<SearchIcon>`、`<MenuIcon>` 等
3. **考虑性能**：对于大量图标的场景，考虑使用图标字体或 sprite
4. **保持一致性**：在整个应用中使用相同的图标集和风格
5. **适当的尺寸**：根据使用场景选择合适的图标尺寸
6. **颜色对比**：确保图标颜色与背景有足够的对比度
7. **无障碍**：为有意义的图标添加适当的 ARIA 标签
