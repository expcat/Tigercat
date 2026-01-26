# ChartCanvas 图表画布

提供基础 SVG 容器与内边距能力，为坐标轴、图形元素提供统一的绘制区域。

## 基本用法

### Vue 3

```vue
<script setup>
import { ChartCanvas } from '@expcat/tigercat-vue'
</script>

<template>
  <ChartCanvas :width="320" :height="200" :padding="24">
    <text x="0" y="0">Chart Area</text>
  </ChartCanvas>
</template>
```

### React

```tsx
import { ChartCanvas } from '@expcat/tigercat-react'

export default function Demo() {
  return (
    <ChartCanvas width={320} height={200} padding={24}>
      <text x={0} y={0}>
        Chart Area
      </text>
    </ChartCanvas>
  )
}
```

## API

### Props

| 属性      | 说明       | 类型     | 默认值                                                            |
| --------- | ---------- | -------- | ----------------------------------------------------------------- | ---- |
| width     | SVG 宽度   | `number` | `320`                                                             |
| height    | SVG 高度   | `number` | `200`                                                             |
| padding   | 内边距     | `number  | { top?: number; right?: number; bottom?: number; left?: number }` | `24` |
| className | 自定义类名 | `string` | -                                                                 |

## 设计说明

- `ChartCanvas` 会在内部创建一个 `<g>` 并根据 `padding` 平移，用于放置坐标轴与图形。
- 建议统一在 `ChartCanvas` 内绘制图表元素，以便后续扩展交互层与图例。
