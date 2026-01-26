# LineChart 折线图

用于展示数据随时间或类别变化趋势的折线图组件，支持多系列、曲线插值、数据点显示、悬停交互、图例与工具提示。

## 基本用法

### Vue 3

```vue
<script setup>
import { LineChart } from '@expcat/tigercat-vue'

const data = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]
</script>

<template>
  <LineChart :data="data" :width="400" :height="240" show-points />
</template>
```

### React

```tsx
import { LineChart } from '@expcat/tigercat-react'

const data = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]

export default function Demo() {
  return <LineChart data={data} width={400} height={240} showPoints />
}
```

## 多系列

```vue
<script setup>
import { LineChart } from '@expcat/tigercat-vue'

const series = [
  {
    name: '销售额',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ]
  },
  {
    name: '利润',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 60 },
      { x: 'Q3', y: 45 },
      { x: 'Q4', y: 80 }
    ],
    strokeDasharray: '5,3'
  }
]
</script>

<template>
  <LineChart :series="series" hoverable show-legend show-points />
</template>
```

## 曲线插值

```vue
<!-- 平滑曲线 -->
<LineChart :data="data" curve="monotone" />

<!-- 阶梯线 -->
<LineChart :data="data" curve="step" />

<!-- 自然曲线 -->
<LineChart :data="data" curve="natural" />
```

## API

### Props

| 属性             | 说明                 | 类型                                                                           | 默认值                         |
| ---------------- | -------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| data             | 单系列数据           | `LineChartDatum[]`                                                             | -                              |
| series           | 多系列数据           | `LineChartSeries[]`                                                            | -                              |
| width            | 图表宽度             | `number`                                                                       | `320`                          |
| height           | 图表高度             | `number`                                                                       | `200`                          |
| padding          | 内边距               | `ChartPadding`                                                                 | `24`                           |
| title            | 可访问性标题         | `string`                                                                       | -                              |
| desc             | 可访问性描述         | `string`                                                                       | -                              |
| lineColor        | 线条颜色             | `string`                                                                       | `var(--tiger-primary,#2563eb)` |
| strokeWidth      | 线条宽度             | `number`                                                                       | `2`                            |
| curve            | 曲线类型             | `'linear' \| 'monotone' \| 'step' \| 'stepBefore' \| 'stepAfter' \| 'natural'` | `'linear'`                     |
| showPoints       | 显示数据点           | `boolean`                                                                      | `false`                        |
| pointSize        | 数据点大小           | `number`                                                                       | `4`                            |
| pointColor       | 数据点颜色           | `string`                                                                       | 同线条颜色                     |
| colors           | 系列颜色数组         | `string[]`                                                                     | 默认调色板                     |
| showGrid         | 显示网格             | `boolean`                                                                      | `true`                         |
| showAxis         | 显示坐标轴           | `boolean`                                                                      | `true`                         |
| showXAxis        | 显示 X 轴            | `boolean`                                                                      | `true`                         |
| showYAxis        | 显示 Y 轴            | `boolean`                                                                      | `true`                         |
| includeZero      | Y 轴包含 0           | `boolean`                                                                      | `true`                         |
| xAxisLabel       | X 轴标题             | `string`                                                                       | -                              |
| yAxisLabel       | Y 轴标题             | `string`                                                                       | -                              |
| xTicks           | X 轴刻度数           | `number`                                                                       | `5`                            |
| yTicks           | Y 轴刻度数           | `number`                                                                       | `5`                            |
| gridLineStyle    | 网格线样式           | `'solid' \| 'dashed' \| 'dotted'`                                              | `'solid'`                      |
| gridStrokeWidth  | 网格线宽度           | `number`                                                                       | `1`                            |
| hoverable        | 悬停高亮             | `boolean`                                                                      | `false`                        |
| hoveredIndex     | 悬停系列索引（受控） | `number \| null`                                                               | -                              |
| activeOpacity    | 激活元素不透明度     | `number`                                                                       | `1`                            |
| inactiveOpacity  | 非激活元素不透明度   | `number`                                                                       | `0.25`                         |
| selectable       | 点击选择             | `boolean`                                                                      | `false`                        |
| selectedIndex    | 选中系列索引（受控） | `number \| null`                                                               | -                              |
| showLegend       | 显示图例             | `boolean`                                                                      | `false`                        |
| legendPosition   | 图例位置             | `'top' \| 'bottom' \| 'left' \| 'right'`                                       | `'bottom'`                     |
| showTooltip      | 显示工具提示         | `boolean`                                                                      | `true`                         |
| tooltipFormatter | 工具提示格式化       | `(datum, seriesIndex, pointIndex, series) => string`                           | -                              |
| legendFormatter  | 图例格式化           | `(series, index) => string`                                                    | -                              |
| className        | 自定义类名           | `string`                                                                       | -                              |

### Events (Vue)

| 事件                 | 说明         | 参数                                                             |
| -------------------- | ------------ | ---------------------------------------------------------------- |
| update:hoveredIndex  | 悬停索引变化 | `index: number \| null`                                          |
| update:selectedIndex | 选中索引变化 | `index: number \| null`                                          |
| series-click         | 系列点击     | `seriesIndex: number, series`                                    |
| series-hover         | 系列悬停     | `seriesIndex: number \| null, series`                            |
| point-click          | 数据点点击   | `seriesIndex: number, pointIndex: number, datum`                 |
| point-hover          | 数据点悬停   | `seriesIndex: number \| null, pointIndex: number \| null, datum` |

### Callbacks (React)

| 属性                  | 说明         | 类型                                                                       |
| --------------------- | ------------ | -------------------------------------------------------------------------- |
| onHoveredIndexChange  | 悬停索引变化 | `(index: number \| null) => void`                                          |
| onSelectedIndexChange | 选中索引变化 | `(index: number \| null) => void`                                          |
| onSeriesClick         | 系列点击     | `(seriesIndex: number, series) => void`                                    |
| onSeriesHover         | 系列悬停     | `(seriesIndex: number \| null, series) => void`                            |
| onPointClick          | 数据点点击   | `(seriesIndex: number, pointIndex: number, datum) => void`                 |
| onPointHover          | 数据点悬停   | `(seriesIndex: number \| null, pointIndex: number \| null, datum) => void` |

### LineChartDatum

```ts
interface LineChartDatum {
  x: string | number
  y: number
  label?: string
}
```

### LineChartSeries

```ts
interface LineChartSeries {
  name?: string
  data: LineChartDatum[]
  color?: string
  strokeWidth?: number
  strokeDasharray?: string
  showPoints?: boolean
  pointSize?: number
  pointColor?: string
  className?: string
}
```

## 曲线类型说明

| 类型         | 说明                             |
| ------------ | -------------------------------- |
| `linear`     | 直线连接相邻点                   |
| `monotone`   | 单调平滑曲线，保持单调性         |
| `step`       | 阶梯线（先水平后垂直）           |
| `stepBefore` | 阶梯线（先垂直后水平）           |
| `stepAfter`  | 同 `step`                        |
| `natural`    | 自然三次样条曲线，通过所有数据点 |

## 设计说明

- 支持单系列（`data`）或多系列（`series`）两种数据传入方式。
- 启用 `hoverable` 后，悬停系列会高亮，其他系列变半透明。
- 数据点悬停时显示工具提示，可通过 `tooltipFormatter` 自定义内容。
