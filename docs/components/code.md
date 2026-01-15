# Code 代码展示

用于展示代码片段，并提供一键复制功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { Code } from '@expcat/tigercat-vue'

const snippet = `pnpm add @expcat/tigercat-vue`
</script>

<template>
  <Code :code="snippet" />
</template>
```

### React

```tsx
import { Code } from '@expcat/tigercat-react'

export default function App() {
  return <Code code="pnpm add @expcat/tigercat-react" />
}
```

## 复制按钮

默认显示复制按钮，可以通过 `copyable` 关闭。

### Vue 3

```vue
<template>
  <Code :code="'const a = 1'" :copyable="false" />
</template>
```

### React

```tsx
<Code code="const a = 1" copyable={false} />
```

## 自定义按钮文案

### Vue 3

```vue
<template>
  <Code :code="'console.log(123)'" copy-label="复制代码" copied-label="已复制" />
</template>
```

### React

```tsx
<Code code="console.log(123)" copyLabel="复制代码" copiedLabel="已复制" />
```

## API

### Code Props

| 属性        | 说明             | 类型      | 默认值   |
| ----------- | ---------------- | --------- | -------- |
| code        | 代码内容         | `string`  | -        |
| copyable    | 是否显示复制按钮 | `boolean` | `true`   |
| copyLabel   | 复制按钮文案     | `string`  | `复制`   |
| copiedLabel | 复制完成文案     | `string`  | `已复制` |

### 事件

#### Vue

| 事件名 | 说明           | 回调参数         |
| ------ | -------------- | ---------------- |
| copy   | 复制成功后触发 | `(code: string)` |

#### React

| 属性   | 说明           | 类型                     |
| ------ | -------------- | ------------------------ |
| onCopy | 复制成功后触发 | `(code: string) => void` |

## 样式定制

可以通过覆盖 CSS 变量控制主色调，例如复制完成状态使用 `--tiger-primary` 变量。

```css
:root {
  --tiger-primary: #2563eb;
}
```

## 无障碍 (Accessibility)

复制按钮包含 `aria-label`，内容会随复制状态变化，便于读屏识别。

## 示例

### Vue 3

```vue
<script setup>
import { Code } from '@expcat/tigercat-vue'

const snippet = `import { Button } from '@expcat/tigercat-vue'`
</script>

<template>
  <Code :code="snippet" />
</template>
```

### React

```tsx
import { Code } from '@expcat/tigercat-react'

const snippet = "import { Button } from '@expcat/tigercat-react'"

export default function App() {
  return <Code code={snippet} />
}
```
