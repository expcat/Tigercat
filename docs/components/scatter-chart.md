# ScatterChart 散点图

用于展示二维数值分布的散点图组件，内置坐标轴与网格。

## 基本用法

### Vue 3

```vue
<script setup>
import { ScatterChart } from '@expcat/tigercat-vue'

const data = [
  { x: 10, y: 20 },
  { x: 30, y: 80 },
  { x: 50, y: 40 },
  { x: 70, y: 60 }
]
</script>

<template>
  <ScatterChart :data="data" :width="360" :height="200" x-axis-label="X" y-axis-label="Y" />
</template>
```

### React

```tsx
import { ScatterChart } from '@expcat/tigercat-react'

const data = [
  { x: 10, y: 20 },
  { x: 30, y: 80 },
  { x: 50, y: 40 },
  { x: 70, y: 60 }
]

export default function Demo() {
  return <ScatterChart data={data} width={360} height={200} xAxisLabel="X" yAxisLabel="Y" />
}
```

## API

### Props

| 属性            | 说明            | 类型                                                                         | 默认值                         |
| --------------- | --------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| data            | 数据            | `ScatterChartDatum[]`                                                        | -                              |
| width           | 图表宽度        | `number`                                                                     | `320`                          |
| height          | 图表高度        | `number`                                                                     | `200`                          |
| padding         | 内边距          | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                           |
| xScale          | 自定义 X 比例尺 | `ChartScale`                                                                 | -                              |
| yScale          | 自定义 Y 比例尺 | `ChartScale`                                                                 | -                              |
| pointSize       | 点大小          | `number`                                                                     | `4`                            |
| pointColor      | 点颜色          | `string`                                                                     | `var(--tiger-primary,#2563eb)` |
| pointOpacity    | 点透明度        | `number`                                                                     | -                              |
| showGrid        | 显示网格        | `boolean`                                                                    | `true`                         |
| showAxis        | 显示坐标轴      | `boolean`                                                                    | `true`                         |
| includeZero     | 包含零刻度      | `boolean`                                                                    | `false`                        |
| xAxisLabel      | X 轴标题        | `string`                                                                     | -                              |
| yAxisLabel      | Y 轴标题        | `string`                                                                     | -                              |
| xTicks          | X 轴刻度数      | `number`                                                                     | `5`                            |
| yTicks          | Y 轴刻度数      | `number`                                                                     | `5`                            |
| xTickValues     | X 轴刻度值      | `number[]`                                                                   | -                              |
| yTickValues     | Y 轴刻度值      | `number[]`                                                                   | -                              |
| xTickFormat     | X 轴格式化      | `(value) => string`                                                          | -                              |
| yTickFormat     | Y 轴格式化      | `(value) => string`                                                          | -                              |
| gridLineStyle   | 网格线样式      | `'solid' \| 'dashed' \| 'dotted'`                                            | `'solid'`                      |
| gridStrokeWidth | 网格线宽度      | `number`                                                                     | `1`                            |
| className       | 自定义类名      | `string`                                                                     | -                              |

## 设计说明

- 默认根据数据范围自动生成线性比例尺。
- 如需固定范围可传入自定义 `xScale`/`yScale`。
