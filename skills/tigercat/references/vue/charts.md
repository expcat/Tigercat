---
name: tigercat-vue-charts
description: Vue 3 chart components - AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart, ChartCanvas, ChartAxis, ChartGrid, ChartLegend, ChartSeries, ChartTooltip
---

# Chart Components (Vue 3)

图表组件：AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart 及底层组件

## LineChart 折线图

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

// Multi-series
const series = [
  {
    name: 'Series A',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 40 }
    ]
  },
  {
    name: 'Series B',
    data: [
      { x: 'Jan', y: 20 },
      { x: 'Feb', y: 35 }
    ]
  }
]
</script>

<template>
  <!-- Basic -->
  <LineChart :data="data" :width="400" :height="240" />

  <!-- With points -->
  <LineChart :data="data" show-points :point-size="4" />

  <!-- Smooth curve -->
  <LineChart :data="data" curve="monotone" />

  <!-- Multi-series with legend -->
  <LineChart :series="series" show-legend legend-position="bottom" />

  <!-- Interactive -->
  <LineChart
    :data="data"
    hoverable
    selectable
    show-tooltip
    @point-click="handlePointClick"
    @point-hover="handlePointHover" />
</template>
```

**Props:**

| Prop        | Type                                            | Default    | Description |
| ----------- | ----------------------------------------------- | ---------- | ----------- |
| data        | `{ x: string \| number, y: number }[]`          | -          | 单系列数据  |
| series      | `{ name: string, data: [], color?: string }[]`  | -          | 多系列数据  |
| width       | `number`                                        | `320`      | 宽度        |
| height      | `number`                                        | `200`      | 高度        |
| padding     | `number \| { top?, right?, bottom?, left? }`    | `24`       | 内边距      |
| curve       | `'linear' \| 'monotone' \| 'step' \| 'natural'` | `'linear'` | 曲线类型    |
| showPoints  | `boolean`                                       | `false`    | 显示数据点  |
| pointSize   | `number`                                        | `4`        | 数据点大小  |
| colors      | `string[]`                                      | 主题色板   | 系列颜色    |
| showGrid    | `boolean`                                       | `true`     | 显示网格    |
| showAxis    | `boolean`                                       | `true`     | 显示坐标轴  |
| hoverable   | `boolean`                                       | `false`    | 悬停交互    |
| selectable  | `boolean`                                       | `false`    | 点击选择    |
| showLegend  | `boolean`                                       | `false`    | 显示图例    |
| showTooltip | `boolean`                                       | `true`     | 显示提示    |

**Events:** `@point-click`, `@point-hover`, `@series-click`, `@series-hover`

---

## BarChart 柱状图

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
  <BarChart :data="data" :width="360" :height="200" />

  <!-- With axis labels -->
  <BarChart :data="data" x-axis-label="Weekday" y-axis-label="Sales" />

  <!-- Interactive -->
  <BarChart :data="data" hoverable selectable @bar-click="handleBarClick" />

  <!-- Custom colors -->
  <BarChart :data="data" :colors="['#3b82f6', '#10b981', '#f59e0b']" />
</template>
```

**Props:**

| Prop        | Type                         | Default | Description |
| ----------- | ---------------------------- | ------- | ----------- |
| data        | `{ x: string, y: number }[]` | -       | 数据        |
| width       | `number`                     | `320`   | 宽度        |
| height      | `number`                     | `200`   | 高度        |
| barColor    | `string`                     | 主题色  | 柱颜色      |
| colors      | `string[]`                   | -       | 多柱颜色    |
| barRadius   | `number`                     | `4`     | 圆角        |
| hoverable   | `boolean`                    | `false` | 悬停高亮    |
| selectable  | `boolean`                    | `false` | 可选择      |
| showLegend  | `boolean`                    | `false` | 显示图例    |
| showTooltip | `boolean`                    | `true`  | 显示提示    |

**Events:** `@bar-click(datum, index)`, `@bar-hover(datum, index)`

---

## PieChart 饼图

```vue
<script setup>
import { PieChart } from '@expcat/tigercat-vue'

const data = [
  { value: 40, label: 'Product A' },
  { value: 25, label: 'Product B' },
  { value: 20, label: 'Product C' },
  { value: 15, label: 'Product D' }
]
</script>

<template>
  <PieChart :data="data" :width="320" :height="220" />

  <!-- With labels -->
  <PieChart :data="data" show-labels />

  <!-- With legend -->
  <PieChart :data="data" show-legend legend-position="right" />

  <!-- Interactive -->
  <PieChart :data="data" hoverable selectable @slice-click="handleSliceClick" />
</template>
```

**Props:**

| Prop        | Type                                 | Default  | Description      |
| ----------- | ------------------------------------ | -------- | ---------------- |
| data        | `{ value: number, label: string }[]` | -        | 数据             |
| width       | `number`                             | `320`    | 宽度             |
| height      | `number`                             | `200`    | 高度             |
| innerRadius | `number`                             | `0`      | 内半径（环形图） |
| colors      | `string[]`                           | 主题色板 | 扇形颜色         |
| showLabels  | `boolean`                            | `false`  | 显示标签         |
| hoverable   | `boolean`                            | `false`  | 悬停高亮         |
| selectable  | `boolean`                            | `false`  | 可选择           |
| showLegend  | `boolean`                            | `false`  | 显示图例         |

**Events:** `@slice-click(datum, index)`, `@slice-hover(datum, index)`

---

## DonutChart 环形图

```vue
<script setup>
import { DonutChart } from '@expcat/tigercat-vue'

const data = [
  { value: 40, label: 'Category A' },
  { value: 30, label: 'Category B' },
  { value: 30, label: 'Category C' }
]
</script>

<template>
  <DonutChart :data="data" :width="320" :height="220" />

  <!-- Custom inner radius ratio -->
  <DonutChart :data="data" :inner-radius-ratio="0.7" />
</template>
```

**Props:** 同 PieChart，额外：

| Prop             | Type     | Default | Description |
| ---------------- | -------- | ------- | ----------- |
| innerRadiusRatio | `number` | `0.6`   | 内半径比例  |

---

## AreaChart 面积图

```vue
<script setup>
import { AreaChart } from '@expcat/tigercat-vue'

const data = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 }
]

const series = [
  { name: 'Series A', data: [...] },
  { name: 'Series B', data: [...] }
]
</script>

<template>
  <AreaChart :data="data" :fill-opacity="0.3" />

  <!-- Stacked -->
  <AreaChart :series="series" stacked show-legend />
</template>
```

**Props:** 同 LineChart，额外：

| Prop        | Type      | Default | Description |
| ----------- | --------- | ------- | ----------- |
| fillOpacity | `number`  | `0.2`   | 填充透明度  |
| stacked     | `boolean` | `false` | 堆叠模式    |

---

## ScatterChart 散点图

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
  <ScatterChart :data="data" :width="360" :height="200" />

  <ScatterChart :data="data" x-axis-label="X Axis" y-axis-label="Y Axis" :point-size="6" />
</template>
```

**Props:**

| Prop       | Type                         | Default | Description |
| ---------- | ---------------------------- | ------- | ----------- |
| data       | `{ x: number, y: number }[]` | -       | 数据        |
| pointSize  | `number`                     | `4`     | 点大小      |
| pointColor | `string`                     | 主题色  | 点颜色      |
| hoverable  | `boolean`                    | `false` | 悬停高亮    |

---

## RadarChart 雷达图

```vue
<script setup>
import { RadarChart } from '@expcat/tigercat-vue'

const data = [
  { label: 'Speed', value: 80 },
  { label: 'Stability', value: 65 },
  { label: 'Design', value: 90 },
  { label: 'Battery', value: 70 },
  { label: 'Price', value: 50 }
]

const series = [
  { name: 'Product A', data: [80, 65, 90, 70, 50] },
  { name: 'Product B', data: [60, 80, 70, 85, 65] }
]
</script>

<template>
  <RadarChart :data="data" :width="360" :height="260" />

  <!-- Multi-series -->
  <RadarChart
    :series="series"
    :labels="['Speed', 'Stability', 'Design', 'Battery', 'Price']"
    show-legend />
</template>
```

**Props:**

| Prop        | Type                                 | Default  | Description |
| ----------- | ------------------------------------ | -------- | ----------- |
| data        | `{ label: string, value: number }[]` | -        | 单系列数据  |
| series      | `{ name: string, data: number[] }[]` | -        | 多系列数据  |
| labels      | `string[]`                           | -        | 维度标签    |
| maxValue    | `number`                             | 自动计算 | 最大值      |
| levels      | `number`                             | `5`      | 网格层数    |
| fillOpacity | `number`                             | `0.2`    | 填充透明度  |
| showPoints  | `boolean`                            | `true`   | 显示数据点  |

---

## 底层组件

### ChartCanvas 图表画布

```vue
<template>
  <ChartCanvas :width="320" :height="200" :padding="24" title="My Chart">
    <!-- SVG content -->
  </ChartCanvas>
</template>
```

### ChartAxis 坐标轴

```vue
<script setup>
import { ChartAxis, ChartCanvas, createLinearScale } from '@expcat/tigercat-vue'

const xScale = createLinearScale([0, 100], [0, 240])
</script>

<template>
  <ChartCanvas :width="280" :height="120">
    <ChartAxis :scale="xScale" orientation="bottom" :y="80" label="X Axis" />
  </ChartCanvas>
</template>
```

### ChartGrid 网格

```vue
<template>
  <ChartCanvas :width="280" :height="120">
    <ChartGrid :x-scale="xScale" :y-scale="yScale" show="both" line-style="dashed" />
  </ChartCanvas>
</template>
```

### ChartSeries 系列容器

```vue
<template>
  <ChartSeries :data="points" name="Series A" color="#2563eb">
    <template #default="{ data, color }">
      <circle v-for="(pt, i) in data" :key="i" :cx="pt.x" :cy="pt.y" r="3" :fill="color" />
    </template>
  </ChartSeries>
</template>
```

## 工具函数

从 `@expcat/tigercat-vue` 或 `@expcat/tigercat-core` 导入：

```ts
import {
  createLinearScale, // 线性比例尺
  createBandScale, // 分类比例尺
  createTimeScale, // 时间比例尺
  CHART_COLORS // 默认调色板
} from '@expcat/tigercat-vue'
```
