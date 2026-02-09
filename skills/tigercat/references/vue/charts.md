---
name: tigercat-vue-charts
description: Vue 3 chart components
---

# Chart Components (Vue)

> **Props Reference**: [shared/props/charts.md](../shared/props/charts.md)

## LineChart

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
  <LineChart :data="data" :width="400" :height="240" />
  <LineChart :data="data" curve="monotone" show-points :point-size="4" />
  <LineChart :series="series" show-legend legend-position="bottom" />
  <!-- ECharts 风格：渐变面积 + 空心圆点 + 平滑曲线 -->
  <LineChart :data="data" show-area curve="monotone" show-points point-hollow />
  <!-- 入场动画 -->
  <LineChart :data="data" animated show-area curve="monotone" show-points />
  <LineChart
    :data="data"
    hoverable
    selectable
    @point-click="handleClick"
    @point-hover="handleHover" />
</template>
```

---

## BarChart

```vue
<template>
  <!-- 基础 -->
  <BarChart :data="data" :width="360" :height="200" />
  <BarChart :data="data" x-axis-label="Weekday" y-axis-label="Sales" />
  <!-- 交互 -->
  <BarChart :data="data" hoverable selectable @bar-click="handleBarClick" />
  <!-- 自定义颜色 -->
  <BarChart :data="data" :colors="['#3b82f6', '#10b981', '#f59e0b']" />
  <!-- 渐变填充 + 动画 -->
  <BarChart :data="data" gradient animated :barRadius="6" />
  <!-- 数值标签 -->
  <BarChart :data="data" show-value-labels value-label-position="top" />
  <BarChart :data="data" show-value-labels value-label-position="inside" />
  <!-- 自定义标签格式 -->
  <BarChart :data="data" show-value-labels :valueLabelFormatter="(d) => `$${d.y}`" />
  <!-- 柱宽/柱高约束 -->
  <BarChart :data="data" :barMaxWidth="40" :barMinHeight="3" />
</template>
```

---

## PieChart / DonutChart

```vue
<script setup>
const data = [
  { value: 40, label: 'Product A' },
  { value: 25, label: 'Product B' },
  { value: 20, label: 'Product C' },
  { value: 15, label: 'Product D' }
]
</script>

<template>
  <PieChart :data="data" :width="320" :height="220" show-labels />
  <PieChart
    :data="data"
    show-legend
    legend-position="right"
    hoverable
    @slice-click="handleSliceClick" />
  <DonutChart :data="data" :inner-radius-ratio="0.6" />
</template>
```

---

## AreaChart

```vue
<template>
  <!-- 基础面积图 -->
  <AreaChart :data="data" :fill-opacity="0.3" />

  <!-- 堆叠，图例 -->
  <AreaChart :series="series" stacked show-legend />

  <!-- 渐变填充 + 曲线平滑 + 空心点 + 入场动画 -->
  <AreaChart :data="data" gradient curve="monotone" show-points point-hollow animated />
</template>
```

---

## ScatterChart

```vue
<template>
  <ScatterChart
    :data="[
      { x: 10, y: 20 },
      { x: 30, y: 80 }
    ]"
    :width="360"
    :height="200" />
  <ScatterChart :data="data" x-axis-label="X" y-axis-label="Y" :point-size="6" hoverable />
</template>
```

---

## RadarChart

```vue
<script setup>
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
  <RadarChart
    :series="series"
    :labels="['Speed', 'Stability', 'Design', 'Battery', 'Price']"
    show-legend />
</template>
```

---

## 底层组件

```vue
<script setup>
import {
  ChartCanvas,
  ChartAxis,
  ChartGrid,
  ChartSeries,
  createLinearScale
} from '@expcat/tigercat-vue'

const xScale = createLinearScale([0, 100], [0, 240])
const yScale = createLinearScale([0, 100], [160, 0])
</script>

<template>
  <ChartCanvas :width="320" :height="200" :padding="24" title="Custom Chart">
    <ChartGrid :x-scale="xScale" :y-scale="yScale" show="both" />
    <ChartAxis :scale="xScale" orientation="bottom" :y="160" label="X Axis" />
    <ChartAxis :scale="yScale" orientation="left" :x="0" label="Y Axis" />
    <ChartSeries :data="points" name="Series A" color="#2563eb">
      <template #default="{ data, color }">
        <circle v-for="(pt, i) in data" :key="i" :cx="pt.x" :cy="pt.y" r="4" :fill="color" />
      </template>
    </ChartSeries>
  </ChartCanvas>
</template>
```

## 工具函数

```ts
import {
  createLinearScale, // 线性比例尺
  createBandScale, // 分类比例尺
  createTimeScale, // 时间比例尺
  CHART_COLORS // 默认调色板
} from '@expcat/tigercat-vue'
```
