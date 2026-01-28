---
name: tigercat-react-charts
description: React chart components - Line, Bar, Pie, Donut, Area, Scatter, Radar
---

# Chart Components (React)

图表组件，基于 Canvas 渲染，支持响应式和交互。

## 安装依赖

```bash
# 图表功能需要安装 chart.js
pnpm add chart.js
```

---

## LineChart 折线图

```tsx
import { LineChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    { label: 'Sales', data: [30, 45, 28, 50, 42], color: 'var(--tiger-primary)' },
    { label: 'Revenue', data: [20, 35, 40, 45, 50], color: '#10b981' }
  ]
}

function App() {
  return <LineChart data={data} height={300} onPointClick={handlePointClick} />
}
```

**Props:**

| Prop        | Type               | Default  | Description |
| ----------- | ------------------ | -------- | ----------- |
| data        | `ChartData`        | -        | 图表数据    |
| width       | `number \| string` | `'100%'` | 宽度        |
| height      | `number`           | `300`    | 高度        |
| smooth      | `boolean`          | `false`  | 平滑曲线    |
| showArea    | `boolean`          | `false`  | 显示面积    |
| showGrid    | `boolean`          | `true`   | 显示网格    |
| showLegend  | `boolean`          | `true`   | 显示图例    |
| showTooltip | `boolean`          | `true`   | 显示提示    |
| xAxis       | `AxisConfig`       | -        | X 轴配置    |
| yAxis       | `AxisConfig`       | -        | Y 轴配置    |

**Callbacks:** `onPointClick(point, dataset, index)`, `onLegendClick(dataset, index)`

---

## BarChart 柱状图

```tsx
import { BarChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: '2023', data: [120, 150, 180, 200] },
    { label: '2024', data: [150, 180, 210, 250] }
  ]
}

function App() {
  return <BarChart data={data} height={300} onBarClick={handleBarClick} />
}
```

### Horizontal & Stacked

```tsx
<BarChart data={data} horizontal />
<BarChart data={data} stacked />
```

**Props:**

| Prop         | Type        | Default | Description |
| ------------ | ----------- | ------- | ----------- |
| data         | `ChartData` | -       | 图表数据    |
| horizontal   | `boolean`   | `false` | 水平方向    |
| stacked      | `boolean`   | `false` | 堆叠模式    |
| barWidth     | `number`    | -       | 柱子宽度    |
| borderRadius | `number`    | `0`     | 圆角        |

**Callbacks:** `onBarClick(bar, dataset, index)`

---

## PieChart 饼图

```tsx
import { PieChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [{ data: [60, 30, 10] }]
}

function App() {
  return <PieChart data={data} size={300} onSliceClick={handleSliceClick} />
}
```

**Props:**

| Prop          | Type                    | Default     | Description |
| ------------- | ----------------------- | ----------- | ----------- |
| data          | `ChartData`             | -           | 图表数据    |
| size          | `number`                | `300`       | 尺寸        |
| showLabels    | `boolean`               | `true`      | 显示标签    |
| labelPosition | `'inside' \| 'outside'` | `'outside'` | 标签位置    |

**Callbacks:** `onSliceClick(slice, index)`

---

## DonutChart 环形图

```tsx
import { DonutChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Done', 'In Progress', 'Todo'],
  datasets: [{ data: [45, 30, 25] }]
}

function App() {
  return (
    <DonutChart
      data={data}
      size={300}
      innerRadius={0.6}
      centerContent={<div className="text-2xl font-bold">75%</div>}
    />
  )
}
```

**Props:** 继承 PieChart，额外支持：

| Prop          | Type        | Default | Description    |
| ------------- | ----------- | ------- | -------------- |
| innerRadius   | `number`    | `0.5`   | 内径比例 (0-1) |
| centerContent | `ReactNode` | -       | 中心内容       |

---

## AreaChart 面积图

```tsx
import { AreaChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [{ label: 'Users', data: [100, 120, 90, 150, 130], color: '#3b82f6', opacity: 0.3 }]
}

function App() {
  return <AreaChart data={data} height={300} smooth gradient />
}
```

**Props:** 继承 LineChart，额外支持：

| Prop     | Type      | Default | Description |
| -------- | --------- | ------- | ----------- |
| opacity  | `number`  | `0.3`   | 填充透明度  |
| gradient | `boolean` | `false` | 渐变填充    |
| stacked  | `boolean` | `false` | 堆叠模式    |

---

## ScatterChart 散点图

```tsx
import { ScatterChart } from '@expcat/tigercat-react'

const data = {
  datasets: [
    {
      label: 'Group A',
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 35 },
        { x: 25, y: 15 }
      ]
    }
  ]
}

function App() {
  return <ScatterChart data={data} height={300} onPointClick={handlePointClick} />
}
```

**Props:**

| Prop       | Type                                 | Default    | Description |
| ---------- | ------------------------------------ | ---------- | ----------- |
| data       | `ScatterData`                        | -          | 图表数据    |
| pointSize  | `number`                             | `6`        | 点大小      |
| pointStyle | `'circle' \| 'square' \| 'triangle'` | `'circle'` | 点样式      |

---

## RadarChart 雷达图

```tsx
import { RadarChart } from '@expcat/tigercat-react'

const data = {
  labels: ['Speed', 'Power', 'Defense', 'Accuracy', 'Stamina'],
  datasets: [
    { label: 'Player A', data: [80, 90, 70, 85, 75] },
    { label: 'Player B', data: [70, 80, 90, 60, 85] }
  ]
}

function App() {
  return <RadarChart data={data} size={400} />
}
```

**Props:**

| Prop      | Type        | Default | Description |
| --------- | ----------- | ------- | ----------- |
| data      | `ChartData` | -       | 图表数据    |
| size      | `number`    | `400`   | 尺寸        |
| fill      | `boolean`   | `true`  | 填充区域    |
| showScale | `boolean`   | `true`  | 显示刻度    |

---

## 底层组件

用于自定义图表组合。

### ChartCanvas

```tsx
import { ChartCanvas, ChartAxis, ChartGrid, ChartSeries } from '@expcat/tigercat-react'

function CustomChart() {
  return (
    <ChartCanvas width={600} height={400} padding={{ top: 20, right: 20, bottom: 40, left: 50 }}>
      <ChartGrid horizontal vertical />
      <ChartAxis position="bottom" data={labels} />
      <ChartAxis position="left" min={0} max={100} />
      <ChartSeries type="line" data={seriesData} color="#3b82f6" />
    </ChartCanvas>
  )
}
```

### ChartAxis

```tsx
<ChartAxis
  position="bottom" // 'top' | 'bottom' | 'left' | 'right'
  data={['A', 'B', 'C']} // 类目轴数据
  min={0} // 数值轴最小值
  max={100} // 数值轴最大值
  tickCount={5} // 刻度数量
  format={(v) => `${v}%`} // 格式化
/>
```

### ChartGrid

```tsx
<ChartGrid
  horizontal // 水平线
  vertical // 垂直线
  strokeDash // 虚线
  color="#e5e7eb"
/>
```

### ChartSeries

```tsx
<ChartSeries
  type="line" // 'line' | 'bar' | 'area' | 'scatter'
  data={[10, 20, 30]}
  color="#3b82f6"
  name="Series A"
/>
```

### ChartLegend

```tsx
<ChartLegend
  position="bottom" // 'top' | 'bottom' | 'left' | 'right'
  items={[
    { label: 'A', color: '#3b82f6' },
    { label: 'B', color: '#10b981' }
  ]}
  onClick={(item, index) => {}}
/>
```

### ChartTooltip

```tsx
<ChartTooltip
  formatter={(data) => `Value: ${data.value}`}
  position="top" // 'top' | 'bottom' | 'left' | 'right' | 'cursor'
/>
```

---

## 通用类型

```typescript
interface ChartData {
  labels?: string[]
  datasets: ChartDataset[]
}

interface ChartDataset {
  label?: string
  data: number[]
  color?: string
  opacity?: number
}

interface ScatterData {
  datasets: {
    label?: string
    data: { x: number; y: number }[]
    color?: string
  }[]
}

interface AxisConfig {
  show?: boolean
  min?: number
  max?: number
  tickCount?: number
  format?: (value: number | string) => string
}
```
