---
name: tigercat-react-charts
description: React chart components
---

# Chart Components (React)

> **Props Reference**: [shared/props/charts.md](../shared/props/charts.md)

## LineChart

```tsx
import { LineChart } from '@expcat/tigercat-react'

const data = [
  { x: 'Jan', y: 30 }, { x: 'Feb', y: 40 }, { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 }, { x: 'May', y: 49 }, { x: 'Jun', y: 60 }
]

const series = [
  { name: 'Series A', data: [{ x: 'Jan', y: 30 }, { x: 'Feb', y: 40 }] },
  { name: 'Series B', data: [{ x: 'Jan', y: 20 }, { x: 'Feb', y: 35 }] }
]

<LineChart data={data} width={400} height={240} />
<LineChart data={data} curve="monotone" showPoints pointSize={4} />
<LineChart series={series} showLegend legendPosition="bottom" />
<LineChart data={data} hoverable selectable onPointClick={handleClick} onPointHover={handleHover} />
```

---

## BarChart

```tsx
<BarChart data={data} width={360} height={200} />
<BarChart data={data} xAxisLabel="Weekday" yAxisLabel="Sales" />
<BarChart data={data} hoverable selectable onBarClick={handleBarClick} />
<BarChart data={data} colors={['#3b82f6', '#10b981', '#f59e0b']} />
<BarChart data={data} horizontal stacked />
```

---

## PieChart / DonutChart

```tsx
const data = [
  { value: 40, label: 'Product A' },
  { value: 25, label: 'Product B' },
  { value: 20, label: 'Product C' },
  { value: 15, label: 'Product D' }
]

<PieChart data={data} width={320} height={220} showLabels />
<PieChart data={data} showLegend legendPosition="right" hoverable onSliceClick={handleSliceClick} />
<DonutChart data={data} innerRadius={0.6} centerContent={<span className="text-2xl font-bold">75%</span>} />
```

---

## AreaChart

```tsx
<AreaChart data={data} fillOpacity={0.3} />
<AreaChart series={series} stacked showLegend gradient />
```

---

## ScatterChart

```tsx
<ScatterChart data={[{ x: 10, y: 20 }, { x: 30, y: 80 }]} width={360} height={200} />
<ScatterChart data={data} xAxisLabel="X" yAxisLabel="Y" pointSize={6} pointStyle="circle" hoverable />
```

---

## RadarChart

```tsx
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

<RadarChart data={data} width={360} height={260} />
<RadarChart series={series} labels={['Speed', 'Stability', 'Design', 'Battery', 'Price']} showLegend />
```

---

## 底层组件

```tsx
import { ChartCanvas, ChartAxis, ChartGrid, ChartSeries, ChartLegend, ChartTooltip } from '@expcat/tigercat-react'

function CustomChart() {
  return (
    <ChartCanvas width={320} height={200} padding={24}>
      <ChartGrid horizontal vertical />
      <ChartAxis position="bottom" data={labels} />
      <ChartAxis position="left" min={0} max={100} tickCount={5} format={(v) => `${v}%`} />
      <ChartSeries type="line" data={seriesData} color="#3b82f6" name="Series A" />
      <ChartLegend position="bottom" onClick={(item, index) => {}} />
      <ChartTooltip formatter={(data) => `Value: ${data.value}`} />
    </ChartCanvas>
  )
}
```

## TypeScript 类型

```ts
import type { ChartProps, ChartData, AxisConfig } from '@expcat/tigercat-react'

// 数据点
interface DataPoint { x: string | number; y: number }

// 系列
interface ChartSeries { name: string; data: DataPoint[]; color?: string }
```
