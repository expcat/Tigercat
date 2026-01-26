# PieChart 饼图

用于展示分类占比的饼图组件，可通过 `innerRadius` 配置为环形图，支持悬停高亮、点击选择、图例与工具提示。

## 基本用法

### Vue 3

```vue
<script setup>
import { PieChart } from '@expcat/tigercat-vue'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]
</script>

<template>
  <PieChart :data="data" :width="320" :height="220" :show-labels="true" />
</template>
```

### React

```tsx
import { PieChart } from '@expcat/tigercat-react'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

export default function Demo() {
  return <PieChart data={data} width={320} height={220} showLabels />
}
```

## 交互功能

### 悬停高亮

```vue
<PieChart :data="data" hoverable />
```

### 带图例与工具提示

```vue
<PieChart
  :data="data"
  hoverable
  selectable
  show-legend
  legend-position="right"
  :show-tooltip="true" />
```

## API

### Props

| 属性             | 说明                 | 类型                                                                         | 默认值                |
| ---------------- | -------------------- | ---------------------------------------------------------------------------- | --------------------- |
| data             | 数据                 | `PieChartDatum[]`                                                            | -                     |
| width            | 图表宽度             | `number`                                                                     | `320`                 |
| height           | 图表高度             | `number`                                                                     | `200`                 |
| padding          | 内边距               | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                  |
| title            | 可访问性标题         | `string`                                                                     | -                     |
| desc             | 可访问性描述         | `string`                                                                     | -                     |
| innerRadius      | 内半径（环形图）     | `number`                                                                     | `0`                   |
| outerRadius      | 外半径               | `number`                                                                     | `min(width,height)/2` |
| startAngle       | 起始角度（弧度）     | `number`                                                                     | `0`                   |
| endAngle         | 结束角度（弧度）     | `number`                                                                     | `Math.PI * 2`         |
| padAngle         | 扇形间隔角度（弧度） | `number`                                                                     | `0`                   |
| colors           | 颜色列表             | `string[]`                                                                   | 主题默认调色板        |
| showLabels       | 显示标签             | `boolean`                                                                    | `false`               |
| labelFormatter   | 标签格式化函数       | `(value, datum, index) => string`                                            | -                     |
| hoverable        | 悬停高亮             | `boolean`                                                                    | `false`               |
| hoveredIndex     | 悬停索引（受控）     | `number \| null`                                                             | -                     |
| activeOpacity    | 激活元素不透明度     | `number`                                                                     | `1`                   |
| inactiveOpacity  | 非激活元素不透明度   | `number`                                                                     | `0.25`                |
| selectable       | 点击选择             | `boolean`                                                                    | `false`               |
| selectedIndex    | 选中索引（受控）     | `number \| null`                                                             | -                     |
| showLegend       | 显示图例             | `boolean`                                                                    | `false`               |
| legendPosition   | 图例位置             | `'top' \| 'bottom' \| 'left' \| 'right'`                                     | `'bottom'`            |
| legendMarkerSize | 图例标记大小         | `number`                                                                     | `10`                  |
| legendGap        | 图例间距             | `number`                                                                     | `8`                   |
| showTooltip      | 显示工具提示         | `boolean`                                                                    | `true`                |
| tooltipFormatter | 工具提示格式化       | `(datum, index) => string`                                                   | -                     |
| legendFormatter  | 图例格式化           | `(datum, index) => string`                                                   | -                     |
| className        | 自定义类名           | `string`                                                                     | -                     |

### Events (Vue)

| 事件                 | 说明         | 参数                                                  |
| -------------------- | ------------ | ----------------------------------------------------- |
| update:hoveredIndex  | 悬停索引变化 | `index: number \| null`                               |
| update:selectedIndex | 选中索引变化 | `index: number \| null`                               |
| slice-click          | 扇形点击     | `index: number, datum: PieChartDatum`                 |
| slice-hover          | 扇形悬停     | `index: number \| null, datum: PieChartDatum \| null` |

### Callbacks (React)

| 属性                  | 说明         | 类型                                                            |
| --------------------- | ------------ | --------------------------------------------------------------- |
| onHoveredIndexChange  | 悬停索引变化 | `(index: number \| null) => void`                               |
| onSelectedIndexChange | 选中索引变化 | `(index: number \| null) => void`                               |
| onSliceClick          | 扇形点击     | `(index: number, datum: PieChartDatum) => void`                 |
| onSliceHover          | 扇形悬停     | `(index: number \| null, datum: PieChartDatum \| null) => void` |

## 设计说明

- 使用弧度制，`0` 表示从 3 点钟方向开始。
- 传入 `innerRadius` 即可渲染环形图。
- 启用 `hoverable` 后，悬停扇形会高亮，其他扇形变半透明。
- 工具提示默认显示值和百分比。
