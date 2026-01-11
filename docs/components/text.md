# Text 文本

灵活的文本组件，支持多种语义标签、尺寸、样式和对齐方式。

## 基本用法

### Vue 3

```vue
<script setup>
import { Text } from '@tigercat/vue';
</script>

<template>
  <Text>This is a paragraph text.</Text>
  <Text tag="span">This is an inline span text.</Text>
  <Text tag="div">This is a div text.</Text>
</template>
```

### React

```tsx
import { Text } from '@tigercat/react';

function App() {
  return (
    <>
      <Text>This is a paragraph text.</Text>
      <Text tag="span">This is an inline span text.</Text>
      <Text tag="div">This is a div text.</Text>
    </>
  );
}
```

## 语义标签 (Tags)

Text 组件支持多种 HTML 语义标签，可以根据内容的语义选择合适的标签。

支持的标签：`p`, `span`, `div`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `label`, `strong`, `em`, `small`

### Vue 3

```vue
<template>
  <Text tag="h1">Heading 1</Text>
  <Text tag="h2">Heading 2</Text>
  <Text tag="h3">Heading 3</Text>
  <Text tag="p">Paragraph</Text>
  <Text tag="span">Inline span</Text>
  <Text tag="strong">Strong text</Text>
  <Text tag="em">Emphasized text</Text>
  <Text tag="small">Small text</Text>
  <Text tag="label">Label text</Text>
</template>
```

### React

```tsx
<Text tag="h1">Heading 1</Text>
<Text tag="h2">Heading 2</Text>
<Text tag="h3">Heading 3</Text>
<Text tag="p">Paragraph</Text>
<Text tag="span">Inline span</Text>
<Text tag="strong">Strong text</Text>
<Text tag="em">Emphasized text</Text>
<Text tag="small">Small text</Text>
<Text tag="label">Label text</Text>
```

## 文本尺寸 (Sizes)

Text 组件支持 10 种不同的尺寸，从 `xs` 到 `6xl`。

### Vue 3

```vue
<template>
  <Text size="xs">Extra small text</Text>
  <Text size="sm">Small text</Text>
  <Text size="base">Base text (default)</Text>
  <Text size="lg">Large text</Text>
  <Text size="xl">Extra large text</Text>
  <Text size="2xl">2XL text</Text>
  <Text size="3xl">3XL text</Text>
  <Text size="4xl">4XL text</Text>
  <Text size="5xl">5XL text</Text>
  <Text size="6xl">6XL text</Text>
</template>
```

### React

```tsx
<Text size="xs">Extra small text</Text>
<Text size="sm">Small text</Text>
<Text size="base">Base text (default)</Text>
<Text size="lg">Large text</Text>
<Text size="xl">Extra large text</Text>
<Text size="2xl">2XL text</Text>
<Text size="3xl">3XL text</Text>
<Text size="4xl">4XL text</Text>
<Text size="5xl">5XL text</Text>
<Text size="6xl">6XL text</Text>
```

## 文本粗细 (Weights)

Text 组件支持 8 种字重，从 `thin` 到 `black`。

### Vue 3

```vue
<template>
  <Text weight="thin">Thin text</Text>
  <Text weight="light">Light text</Text>
  <Text weight="normal">Normal text (default)</Text>
  <Text weight="medium">Medium text</Text>
  <Text weight="semibold">Semibold text</Text>
  <Text weight="bold">Bold text</Text>
  <Text weight="extrabold">Extra bold text</Text>
  <Text weight="black">Black text</Text>
</template>
```

### React

```tsx
<Text weight="thin">Thin text</Text>
<Text weight="light">Light text</Text>
<Text weight="normal">Normal text (default)</Text>
<Text weight="medium">Medium text</Text>
<Text weight="semibold">Semibold text</Text>
<Text weight="bold">Bold text</Text>
<Text weight="extrabold">Extra bold text</Text>
<Text weight="black">Black text</Text>
```

## 文本对齐 (Alignment)

Text 组件支持 4 种对齐方式。

### Vue 3

```vue
<template>
  <Text align="left">Left aligned text</Text>
  <Text align="center">Center aligned text</Text>
  <Text align="right">Right aligned text</Text>
  <Text align="justify"
    >Justified text - Lorem ipsum dolor sit amet, consectetur adipiscing
    elit.</Text
  >
</template>
```

### React

```tsx
<Text align="left">Left aligned text</Text>
<Text align="center">Center aligned text</Text>
<Text align="right">Right aligned text</Text>
<Text align="justify">Justified text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
```

## 文本颜色 (Colors)

Text 组件支持多种预定义颜色，颜色值通过 CSS 变量提供主题化能力（均带 fallback）。

### Vue 3

```vue
<template>
  <Text color="default">Default color (--tiger-text)</Text>
  <Text color="primary">Primary color (--tiger-primary)</Text>
  <Text color="secondary">Secondary color (--tiger-secondary)</Text>
  <Text color="success">Success color (--tiger-success)</Text>
  <Text color="warning">Warning color (--tiger-warning)</Text>
  <Text color="danger">Danger color (--tiger-error)</Text>
  <Text color="muted">Muted color (--tiger-text-muted)</Text>
</template>
```

### React

```tsx
<Text color="default">Default color (--tiger-text)</Text>
<Text color="primary">Primary color (--tiger-primary)</Text>
<Text color="secondary">Secondary color (--tiger-secondary)</Text>
<Text color="success">Success color (--tiger-success)</Text>
<Text color="warning">Warning color (--tiger-warning)</Text>
<Text color="danger">Danger color (--tiger-error)</Text>
<Text color="muted">Muted color (--tiger-text-muted)</Text>
```

## 文本修饰 (Text Decorations)

### 截断文本 (Truncate)

使用 `truncate` 属性可以将超出容器的文本截断并显示省略号。

#### Vue 3

```vue
<template>
  <div class="w-48">
    <Text truncate>
      This is a very long text that will be truncated with ellipsis when it
      overflows the container.
    </Text>
  </div>
</template>
```

#### React

```tsx
<div className="w-48">
  <Text truncate>
    This is a very long text that will be truncated with ellipsis when it
    overflows the container.
  </Text>
</div>
```

### 斜体 (Italic)

#### Vue 3

```vue
<template>
  <Text italic>This text is italic.</Text>
</template>
```

#### React

```tsx
<Text italic>This text is italic.</Text>
```

### 下划线 (Underline)

#### Vue 3

```vue
<template>
  <Text underline>This text has underline.</Text>
</template>
```

#### React

```tsx
<Text underline>This text has underline.</Text>
```

### 删除线 (Line Through)

#### Vue 3

```vue
<template>
  <Text lineThrough>This text has line-through.</Text>
</template>
```

#### React

```tsx
<Text lineThrough>This text has line-through.</Text>
```

## 组合使用

可以组合多个属性来创建丰富的文本样式。

### Vue 3

```vue
<template>
  <Text tag="h2" size="2xl" weight="bold" color="primary" align="center">
    Welcome to Tigercat
  </Text>
  <Text size="lg" weight="medium" color="secondary">
    A powerful UI component library
  </Text>
  <Text size="sm" color="muted" italic> Last updated: 2024-12-26 </Text>
</template>
```

### React

```tsx
<Text tag="h2" size="2xl" weight="bold" color="primary" align="center">
  Welcome to Tigercat
</Text>
<Text size="lg" weight="medium" color="secondary">
  A powerful UI component library
</Text>
<Text size="sm" color="muted" italic>
  Last updated: 2024-12-26
</Text>
```

## API

### Props / 属性

| 属性        | 说明         | 类型         | 默认值      | 可选值                                                                                                                                     |
| ----------- | ------------ | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| tag         | HTML 标签    | `TextTag`    | `'p'`       | `'p'` \| `'span'` \| `'div'` \| `'h1'` \| `'h2'` \| `'h3'` \| `'h4'` \| `'h5'` \| `'h6'` \| `'label'` \| `'strong'` \| `'em'` \| `'small'` |
| size        | 文本尺寸     | `TextSize`   | `'base'`    | `'xs'` \| `'sm'` \| `'base'` \| `'lg'` \| `'xl'` \| `'2xl'` \| `'3xl'` \| `'4xl'` \| `'5xl'` \| `'6xl'`                                    |
| weight      | 文本粗细     | `TextWeight` | `'normal'`  | `'thin'` \| `'light'` \| `'normal'` \| `'medium'` \| `'semibold'` \| `'bold'` \| `'extrabold'` \| `'black'`                                |
| align       | 文本对齐     | `TextAlign`  | -           | `'left'` \| `'center'` \| `'right'` \| `'justify'`                                                                                         |
| color       | 文本颜色     | `TextColor`  | `'default'` | `'default'` \| `'primary'` \| `'secondary'` \| `'success'` \| `'warning'` \| `'danger'` \| `'muted'`                                       |
| truncate    | 是否截断文本 | `boolean`    | `false`     | `true` \| `false`                                                                                                                          |
| italic      | 是否斜体     | `boolean`    | `false`     | `true` \| `false`                                                                                                                          |
| underline   | 是否下划线   | `boolean`    | `false`     | `true` \| `false`                                                                                                                          |
| lineThrough | 是否删除线   | `boolean`    | `false`     | `true` \| `false`                                                                                                                          |

#### React 专属属性

| 属性      | 说明            | 类型              | 默认值 |
| --------- | --------------- | ----------------- | ------ |
| className | 额外的 CSS 类名 | `string`          | -      |
| children  | 文本内容        | `React.ReactNode` | -      |

### Slots / 插槽 (Vue)

| 插槽名  | 说明     |
| ------- | -------- |
| default | 文本内容 |

## 样式定制

Text 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Text 组件的 `primary` 和 `secondary` 颜色支持通过 CSS 变量自定义。

#### 使用 CSS 变量

```css
/* 默认主题 */
:root {
  --tiger-primary: #2563eb;
  --tiger-secondary: #4b5563;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #ff6b6b;
  --tiger-secondary: #6c757d;
}
```

#### 使用 JavaScript API

**Vue 3:**

```vue
<script setup>
import { Text, setThemeColors } from '@tigercat/vue';

const switchTheme = () => {
  setThemeColors({
    primary: '#10b981',
    secondary: '#6b7280',
  });
};
</script>

<template>
  <Text color="primary">Primary colored text</Text>
  <button @click="switchTheme">切换主题</button>
</template>
```

**React:**

```tsx
import { Text, setThemeColors } from '@tigercat/react';

function App() {
  const switchTheme = () => {
    setThemeColors({
      primary: '#10b981',
      secondary: '#6b7280',
    });
  };

  return (
    <>
      <Text color="primary">Primary colored text</Text>
      <button onClick={switchTheme}>切换主题</button>
    </>
  );
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

### React 额外样式

React 版本的 Text 组件支持 `className` 属性，可以传入额外的 CSS 类：

```tsx
<Text className="shadow-sm border border-gray-200 p-2">Custom Styled Text</Text>
```

## 无障碍 (Accessibility)

- 使用语义化的 HTML 标签（如 `h1`-`h6`, `p`, `label` 等）提升可访问性
- 确保文本颜色有足够的对比度以满足 WCAG 标准
- 对于标题使用正确的标签层级（h1, h2, h3 等）
- 使用 `label` 标签时应配合表单元素使用

## TypeScript 支持

Text 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type {
  TextProps,
  TextTag,
  TextSize,
  TextWeight,
  TextAlign,
  TextColor,
} from '@tigercat/core';
// Vue
import type { Text } from '@tigercat/vue';
// React
import type { Text, TextProps as ReactTextProps } from '@tigercat/react';
```

## 示例

### 文章标题和段落

#### Vue 3

```vue
<template>
  <article>
    <Text tag="h1" size="4xl" weight="bold" color="default">
      Article Title
    </Text>
    <Text size="sm" color="muted" italic> Published on December 26, 2024 </Text>
    <Text tag="p" size="base" color="default" class="mt-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua.
    </Text>
  </article>
</template>
```

#### React

```tsx
<article>
  <Text tag="h1" size="4xl" weight="bold" color="default">
    Article Title
  </Text>
  <Text size="sm" color="muted" italic>
    Published on December 26, 2024
  </Text>
  <Text tag="p" size="base" color="default" className="mt-4">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua.
  </Text>
</article>
```

### 状态消息

#### Vue 3

```vue
<template>
  <div class="space-y-2">
    <Text color="success" weight="medium">
      ✓ Operation completed successfully
    </Text>
    <Text color="warning" weight="medium">
      ⚠ Warning: Please review your changes
    </Text>
    <Text color="danger" weight="medium"> ✗ Error: Something went wrong </Text>
  </div>
</template>
```

#### React

```tsx
<div className="space-y-2">
  <Text color="success" weight="medium">
    ✓ Operation completed successfully
  </Text>
  <Text color="warning" weight="medium">
    ⚠ Warning: Please review your changes
  </Text>
  <Text color="danger" weight="medium">
    ✗ Error: Something went wrong
  </Text>
</div>
```

### 价格标签

#### Vue 3

```vue
<template>
  <div class="flex items-baseline gap-2">
    <Text tag="span" size="3xl" weight="bold" color="primary"> $99.99 </Text>
    <Text tag="span" size="lg" color="muted" lineThrough> $149.99 </Text>
  </div>
</template>
```

#### React

```tsx
<div className="flex items-baseline gap-2">
  <Text tag="span" size="3xl" weight="bold" color="primary">
    $99.99
  </Text>
  <Text tag="span" size="lg" color="muted" lineThrough>
    $149.99
  </Text>
</div>
```
