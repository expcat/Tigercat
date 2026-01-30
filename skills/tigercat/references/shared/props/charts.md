---
name: tigercat-charts-shared
description: Shared charts props and concepts
---

# Charts 通用概念

## 技术选型

| 决策     | 选择         | 理由                                             |
| -------- | ------------ | ------------------------------------------------ |
| 渲染方式 | **纯 SVG**   | CSS 变量原生支持、Tailwind 兼容、零依赖          |
| 共享层   | Core 抽象    | types/chart.ts + utils/chart-utils.ts (~2400 行) |
| 框架层   | 仅 rendering | Vue/React 各自负责 h()/JSX 渲染                  |

## 组件列表

**高级组件 (7)**: LineChart, BarChart, PieChart, DonutChart, AreaChart, ScatterChart, RadarChart

**底层组件 (6)**: ChartCanvas, ChartAxis, ChartGrid, ChartSeries, ChartLegend, ChartTooltip

## 主题色板

| 变量              | 值      | 用途 |
| ----------------- | ------- | ---- |
| `--tiger-chart-1` | #3b82f6 | 蓝   |
| `--tiger-chart-2` | #10b981 | 绿   |
| `--tiger-chart-3` | #f59e0b | 橙   |
| `--tiger-chart-4` | #ef4444 | 红   |
| `--tiger-chart-5` | #8b5cf6 | 紫   |
| `--tiger-chart-6` | #06b6d4 | 青   |

## 通用 Props

| Prop        | Type                                         | Default  | Description   |
| ----------- | -------------------------------------------- | -------- | ------------- |
| width       | `number`                                     | `320`    | 宽度 (px)     |
| height      | `number`                                     | `200`    | 高度 (px)     |
| padding     | `number \| { top?, right?, bottom?, left? }` | `24`     | 内边距        |
| colors      | `string[]`                                   | 主题色板 | 系列/扇形颜色 |
| showGrid    | `boolean`                                    | `true`   | 显示网格      |
| showAxis    | `boolean`                                    | `true`   | 显示坐标轴    |
| showLegend  | `boolean`                                    | `false`  | 显示图例      |
| showTooltip | `boolean`                                    | `true`   | 显示提示      |
| hoverable   | `boolean`                                    | `false`  | 悬停交互      |
| selectable  | `boolean`                                    | `false`  | 点击选择      |

## 数据格式

| 图表类型       | 单系列格式                             |
| -------------- | -------------------------------------- |
| 折线/面积/散点 | `{ x: string \| number, y: number }[]` |
| 饼/环形        | `{ value: number, label: string }[]`   |
| 雷达           | `{ label: string, value: number }[]`   |

**多系列**: `{ name: string, data: DataPoint[], color?: string }[]`

## 事件对照

| 概念       | Vue             | React           |
| ---------- | --------------- | --------------- |
| 点击数据点 | `@point-click`  | `onPointClick`  |
| 悬停数据点 | `@point-hover`  | `onPointHover`  |
| 点击柱子   | `@bar-click`    | `onBarClick`    |
| 点击扇形   | `@slice-click`  | `onSliceClick`  |
| 点击图例   | `@legend-click` | `onLegendClick` |

## 曲线类型 (LineChart/AreaChart)

| 值         | 说明             |
| ---------- | ---------------- |
| `linear`   | 直线连接（默认） |
| `monotone` | 平滑曲线         |
| `step`     | 阶梯线           |
| `natural`  | 自然样条         |

## 特有 Props

### LineChart

| Prop       | Type                                            | Default    | Vue | React |
| ---------- | ----------------------------------------------- | ---------- | --- | ----- |
| curve      | `'linear' \| 'monotone' \| 'step' \| 'natural'` | `'linear'` | ✓   | ✓     |
| showPoints | `boolean`                                       | `false`    | ✓   | ✓     |
| pointSize  | `number`                                        | `4`        | ✓   | ✓     |

### BarChart

| Prop       | Type      | Default | Vue | React |
| ---------- | --------- | ------- | --- | ----- |
| barRadius  | `number`  | `4`     | ✓   | ✓     |
| horizontal | `boolean` | `false` | ✓   | ✓     |
| stacked    | `boolean` | `false` | ✓   | ✓     |

### PieChart / DonutChart

| Prop          | Type        | Default     | Vue    | React   |
| ------------- | ----------- | ----------- | ------ | ------- |
| showLabels    | `boolean`   | `false`     | ✓      | ✓       |
| innerRadius   | `number`    | `0` / `0.6` | ✓ (px) | ✓ (0-1) |
| centerContent | `ReactNode` | -           | -      | ✓       |

### AreaChart

| Prop        | Type      | Default | Vue | React |
| ----------- | --------- | ------- | --- | ----- |
| fillOpacity | `number`  | `0.2`   | ✓   | ✓     |
| stacked     | `boolean` | `false` | ✓   | ✓     |
| gradient    | `boolean` | `false` | -   | ✓     |

### ScatterChart

| Prop       | Type                                 | Default    | Vue | React |
| ---------- | ------------------------------------ | ---------- | --- | ----- |
| pointSize  | `number`                             | `4` / `6`  | ✓   | ✓     |
| pointStyle | `'circle' \| 'square' \| 'triangle'` | `'circle'` | -   | ✓     |

### RadarChart

| Prop        | Type       | Default | Vue | React |
| ----------- | ---------- | ------- | --- | ----- |
| labels      | `string[]` | -       | ✓   | ✓     |
| maxValue    | `number`   | auto    | ✓   | ✓     |
| levels      | `number`   | `5`     | ✓   | ✓     |
| fillOpacity | `number`   | `0.2`   | ✓   | ✓     |
