# ChartGrid 网格

用于在坐标轴范围内绘制 X/Y 网格线，辅助展示数据分布。

## 基本用法

### Vue 3

```vue
<script setup>
import { ChartCanvas, ChartAxis, ChartGrid, createLinearScale } from '@expcat/tigercat-vue'

const xScale = createLinearScale([0, 100], [0, 240])
const yScale = createLinearScale([0, 100], [80, 0])
</script>

<template>
  <ChartCanvas :width="280" :height="120" :padding="{ left: 24, right: 16, top: 16, bottom: 24 }">
    <ChartGrid :x-scale="xScale" :y-scale="yScale" />
    <ChartAxis :scale="xScale" orientation="bottom" :y="80" />
    <ChartAxis :scale="yScale" orientation="left" />
  </ChartCanvas>
</template>
```

### React

```tsx
import { ChartCanvas, ChartAxis, ChartGrid, createLinearScale } from '@expcat/tigercat-react'

const xScale = createLinearScale([0, 100], [0, 240])
const yScale = createLinearScale([0, 100], [80, 0])

export default function Demo() {
  return (
    <ChartCanvas width={280} height={120} padding={{ left: 24, right: 16, top: 16, bottom: 24 }}>
      <ChartGrid xScale={xScale} yScale={yScale} />
      <ChartAxis scale={xScale} orientation="bottom" y={80} />
      <ChartAxis scale={yScale} orientation="left" />
    </ChartCanvas>
  )
}
```

## API

### Props

| 属性        | 说明       | 类型                              | 默认值    |
| ----------- | ---------- | --------------------------------- | --------- |
| xScale      | X 轴比例尺 | `ChartScale`                      | -         |
| yScale      | Y 轴比例尺 | `ChartScale`                      | -         |
| show        | 网格类型   | `'x' \| 'y' \| 'both'`            | `'both'`  |
| xTicks      | X 轴刻度数 | `number`                          | `5`       |
| yTicks      | Y 轴刻度数 | `number`                          | `5`       |
| xTickValues | X 轴刻度值 | `(string \| number)[]`            | -         |
| yTickValues | Y 轴刻度值 | `(string \| number)[]`            | -         |
| lineStyle   | 线条样式   | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` |
| strokeWidth | 线宽       | `number`                          | `1`       |
| x           | 平移 X     | `number`                          | `0`       |
| y           | 平移 Y     | `number`                          | `0`       |
| className   | 自定义类名 | `string`                          | -         |

## 设计说明

- 当同时提供 `xScale` 与 `yScale` 时可绘制完整网格。
- 支持使用 `show` 控制仅绘制 X 或 Y 网格线。
