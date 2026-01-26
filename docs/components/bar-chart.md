# BarChart 柱状图

用于展示分类数据的柱状图组件，内置坐标轴与网格。

## 基本用法

### Vue 3

```vue
<script setup>
import { BarChart } from '@expcat/tigercat-vue'

const data = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]
</script>

<template>
  <BarChart :data="data" :width="360" :height="200" x-axis-label="Weekday" y-axis-label="Value" />
</template>
```

### React

```tsx
import { BarChart } from '@expcat/tigercat-react'

const data = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]

export default function Demo() {
  return <BarChart data={data} width={360} height={200} xAxisLabel="Weekday" yAxisLabel="Value" />
}
```

## API

### Props

| 属性            | 说明            | 类型                                                                         | 默认值                         |
| --------------- | --------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| data            | 数据            | `BarChartDatum[]`                                                            | -                              |
| width           | 图表宽度        | `number`                                                                     | `320`                          |
| height          | 图表高度        | `number`                                                                     | `200`                          |
| padding         | 内边距          | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                           |
| xScale          | 自定义 X 比例尺 | `ChartScale`                                                                 | -                              |
| yScale          | 自定义 Y 比例尺 | `ChartScale`                                                                 | -                              |
| barColor        | 柱颜色          | `string`                                                                     | `var(--tiger-primary,#2563eb)` |
| barRadius       | 圆角            | `number`                                                                     | `4`                            |
| barPaddingInner | 内间距比例      | `number`                                                                     | `0.2`                          |
| barPaddingOuter | 外间距比例      | `number`                                                                     | `0.1`                          |
| showGrid        | 显示网格        | `boolean`                                                                    | `true`                         |
| showAxis        | 显示坐标轴      | `boolean`                                                                    | `true`                         |
| xAxisLabel      | X 轴标题        | `string`                                                                     | -                              |
| yAxisLabel      | Y 轴标题        | `string`                                                                     | -                              |
| xTicks          | X 轴刻度数      | `number`                                                                     | `5`                            |
| yTicks          | Y 轴刻度数      | `number`                                                                     | `5`                            |
| xTickValues     | X 轴刻度值      | `(string \| number)[]`                                                       | -                              |
| yTickValues     | Y 轴刻度值      | `number[]`                                                                   | -                              |
| xTickFormat     | X 轴格式化      | `(value) => string`                                                          | -                              |
| yTickFormat     | Y 轴格式化      | `(value) => string`                                                          | -                              |
| gridLineStyle   | 网格线样式      | `'solid' \| 'dashed' \| 'dotted'`                                            | `'solid'`                      |
| gridStrokeWidth | 网格线宽度      | `number`                                                                     | `1`                            |
| className       | 自定义类名      | `string`                                                                     | -                              |

## 设计说明

- 默认基于数据自动生成 band/linear 比例尺。
- 传入自定义 `xScale`/`yScale` 时需要自行保证 range 与图表可视区域一致。
