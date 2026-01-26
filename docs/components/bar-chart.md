# BarChart 柱状图

用于展示分类数据的柱状图组件，内置坐标轴与网格，支持悬停高亮、点击选择、图例与工具提示。

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

## 交互功能

### 悬停高亮

```vue
<BarChart :data="data" hoverable />
```

### 点击选择

```vue
<BarChart :data="data" hoverable selectable @bar-click="handleClick" />
```

### 带图例与工具提示

```vue
<BarChart
  :data="data"
  hoverable
  show-legend
  legend-position="bottom"
  :show-tooltip="true"
  :tooltip-formatter="(d) => `${d.label}: ${d.y}万`" />
```

## API

### Props

| 属性             | 说明               | 类型                                                                         | 默认值                         |
| ---------------- | ------------------ | ---------------------------------------------------------------------------- | ------------------------------ |
| data             | 数据               | `BarChartDatum[]`                                                            | -                              |
| width            | 图表宽度           | `number`                                                                     | `320`                          |
| height           | 图表高度           | `number`                                                                     | `200`                          |
| padding          | 内边距             | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                           |
| title            | 可访问性标题       | `string`                                                                     | -                              |
| desc             | 可访问性描述       | `string`                                                                     | -                              |
| xScale           | 自定义 X 比例尺    | `ChartScale`                                                                 | -                              |
| yScale           | 自定义 Y 比例尺    | `ChartScale`                                                                 | -                              |
| barColor         | 柱颜色             | `string`                                                                     | `var(--tiger-primary,#2563eb)` |
| colors           | 柱颜色数组         | `string[]`                                                                   | 默认调色板                     |
| barRadius        | 圆角               | `number`                                                                     | `4`                            |
| barPaddingInner  | 内间距比例         | `number`                                                                     | `0.2`                          |
| barPaddingOuter  | 外间距比例         | `number`                                                                     | `0.1`                          |
| showGrid         | 显示网格           | `boolean`                                                                    | `true`                         |
| showAxis         | 显示坐标轴         | `boolean`                                                                    | `true`                         |
| showXAxis        | 显示 X 轴          | `boolean`                                                                    | `true`                         |
| showYAxis        | 显示 Y 轴          | `boolean`                                                                    | `true`                         |
| xAxisLabel       | X 轴标题           | `string`                                                                     | -                              |
| yAxisLabel       | Y 轴标题           | `string`                                                                     | -                              |
| xTicks           | X 轴刻度数         | `number`                                                                     | `5`                            |
| yTicks           | Y 轴刻度数         | `number`                                                                     | `5`                            |
| xTickValues      | X 轴刻度值         | `(string \| number)[]`                                                       | -                              |
| yTickValues      | Y 轴刻度值         | `number[]`                                                                   | -                              |
| xTickFormat      | X 轴格式化         | `(value) => string`                                                          | -                              |
| yTickFormat      | Y 轴格式化         | `(value) => string`                                                          | -                              |
| gridLineStyle    | 网格线样式         | `'solid' \| 'dashed' \| 'dotted'`                                            | `'solid'`                      |
| gridStrokeWidth  | 网格线宽度         | `number`                                                                     | `1`                            |
| hoverable        | 悬停高亮           | `boolean`                                                                    | `false`                        |
| hoveredIndex     | 悬停索引（受控）   | `number \| null`                                                             | -                              |
| activeOpacity    | 激活元素不透明度   | `number`                                                                     | `1`                            |
| inactiveOpacity  | 非激活元素不透明度 | `number`                                                                     | `0.25`                         |
| selectable       | 点击选择           | `boolean`                                                                    | `false`                        |
| selectedIndex    | 选中索引（受控）   | `number \| null`                                                             | -                              |
| showLegend       | 显示图例           | `boolean`                                                                    | `false`                        |
| legendPosition   | 图例位置           | `'top' \| 'bottom' \| 'left' \| 'right'`                                     | `'bottom'`                     |
| legendMarkerSize | 图例标记大小       | `number`                                                                     | `10`                           |
| legendGap        | 图例间距           | `number`                                                                     | `8`                            |
| showTooltip      | 显示工具提示       | `boolean`                                                                    | `true`                         |
| tooltipFormatter | 工具提示格式化     | `(datum, index) => string`                                                   | -                              |
| legendFormatter  | 图例格式化         | `(datum, index) => string`                                                   | -                              |
| className        | 自定义类名         | `string`                                                                     | -                              |

### Events (Vue)

| 事件                 | 说明         | 参数                                                  |
| -------------------- | ------------ | ----------------------------------------------------- |
| update:hoveredIndex  | 悬停索引变化 | `index: number \| null`                               |
| update:selectedIndex | 选中索引变化 | `index: number \| null`                               |
| bar-click            | 柱点击       | `index: number, datum: BarChartDatum`                 |
| bar-hover            | 柱悬停       | `index: number \| null, datum: BarChartDatum \| null` |

### Callbacks (React)

| 属性                  | 说明         | 类型                                                            |
| --------------------- | ------------ | --------------------------------------------------------------- |
| onHoveredIndexChange  | 悬停索引变化 | `(index: number \| null) => void`                               |
| onSelectedIndexChange | 选中索引变化 | `(index: number \| null) => void`                               |
| onBarClick            | 柱点击       | `(index: number, datum: BarChartDatum) => void`                 |
| onBarHover            | 柱悬停       | `(index: number \| null, datum: BarChartDatum \| null) => void` |

## 设计说明

- 默认基于数据自动生成 band/linear 比例尺。
- 传入自定义 `xScale`/`yScale` 时需要自行保证 range 与图表可视区域一致。
- 启用 `hoverable` 后，悬停柱会高亮，其他柱变半透明。
- `selectable` 允许点击选中柱，再次点击取消选中。
