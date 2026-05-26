---
name: tigercat-charts-shared
description: Shared charts props and concepts
---

<!-- LLM-INDEX
type: props-reference
category: charts
components: 18
key-apis: data, xKey, yKey, series, width, height, colors, legend, tooltip, responsive
-->

# Charts 通用概念

## 技术选型

| 决策     | 选择         | 理由                                              |
| -------- | ------------ | ------------------------------------------------- |
| 渲染方式 | **SVG 优先** | 默认 SVG；Heatmap 大矩阵可自动切换 canvas cell 层 |
| 共享层   | Core 抽象    | types/chart.ts + utils/chart-utils.ts (~2400 行)  |
| 框架层   | 仅 rendering | Vue/React 各自负责 h()/JSX 渲染                   |

## 组件列表

**高级组件 (13)**: LineChart, BarChart, PieChart, DonutChart, AreaChart, ScatterChart, RadarChart, HeatmapChart, FunnelChart, GaugeChart, SunburstChart, TreeMapChart, OrgChart

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

| Prop        | Type                                         | Default  | Description         |
| ----------- | -------------------------------------------- | -------- | ------------------- |
| width       | `number`                                     | `320`    | 宽度 (px)           |
| height      | `number`                                     | `200`    | 高度 (px)           |
| responsive  | `boolean`                                    | `false`  | 跟随父容器尺寸      |
| padding     | `number \| { top?, right?, bottom?, left? }` | `24`     | 内边距              |
| colors      | `string[]`                                   | 主题色板 | 系列/扇形颜色       |
| showGrid    | `boolean`                                    | `true`   | 显示网格            |
| showAxis    | `boolean`                                    | `true`   | 显示坐标轴          |
| showLegend  | `boolean`                                    | `false`  | 显示图例            |
| showTooltip | `boolean`                                    | `true`   | 显示提示            |
| hoverable   | `boolean`                                    | `false`  | 悬停交互            |
| selectable  | `boolean`                                    | `false`  | 点击选择            |
| title       | `string`                                     | -        | SVG title（无障碍） |
| desc        | `string`                                     | -        | SVG desc（无障碍）  |

## 数据格式

| 图表类型       | 单系列格式                             |
| -------------- | -------------------------------------- |
| 折线/面积/散点 | `{ x: string \| number, y: number }[]` |
| 饼/环形        | `{ value: number, label: string }[]`   |
| 雷达           | `{ label: string, value: number }[]`   |

**多系列**: `{ name: string, data: DataPoint[], color?: string }[]`

## 事件对照

| 概念       | Notes                                        |
| ---------- | -------------------------------------------- |
| 点击数据点 | Vue: `@point-click`, React: `onPointClick`   |
| 悬停数据点 | Vue: `@point-hover`, React: `onPointHover`   |
| 点击柱子   | Vue: `@bar-click`, React: `onBarClick`       |
| 点击扇形   | Vue: `@slice-click`, React: `onSliceClick`   |
| 点击图例   | Vue: `@legend-click`, React: `onLegendClick` |

## 曲线类型 (LineChart/AreaChart)

| 值         | 说明             |
| ---------- | ---------------- |
| `linear`   | 直线连接（默认） |
| `monotone` | 平滑曲线         |
| `step`     | 阶梯线           |
| `natural`  | 自然样条         |

## 特有 Props

### LineChart

| Prop        | Type                                            | Default    | Notes |
| ----------- | ----------------------------------------------- | ---------- | ----- |
| curve       | `'linear' \| 'monotone' \| 'step' \| 'natural'` | `'linear'` |       |
| showPoints  | `boolean`                                       | `true`     |       |
| pointSize   | `number`                                        | `4`        |       |
| pointHollow | `boolean`                                       | `false`    |       |
| showArea    | `boolean`                                       | `false`    |       |
| areaOpacity | `number`                                        | `0.15`     |       |
| animated    | `boolean`                                       | `false`    |       |

### BarChart

| Prop                | Type                    | Default | Notes |
| ------------------- | ----------------------- | ------- | ----- |
| barRadius           | `number`                | `4`     |       |
| barPaddingInner     | `number`                | `0.2`   |       |
| barPaddingOuter     | `number`                | `0.1`   |       |
| barMinHeight        | `number`                | `0`     |       |
| barMaxWidth         | `number`                | -       |       |
| gradient            | `boolean`               | `false` |       |
| animated            | `boolean`               | `false` |       |
| showValueLabels     | `boolean`               | `false` |       |
| valueLabelPosition  | `'top' \| 'inside'`     | `'top'` |       |
| valueLabelFormatter | `(datum, index) => str` | -       |       |

### PieChart / DonutChart

| Prop             | Type                    | Default     | Notes                       |
| ---------------- | ----------------------- | ----------- | --------------------------- |
| showLabels       | `boolean`               | `false`     |                             |
| labelPosition    | `'inside' \| 'outside'` | `'inside'`  |                             |
| innerRadius      | `number`                | `0` / `0.6` | Vue: ✓ (px), React: ✓ (0-1) |
| innerRadiusRatio | `number`                | `0.6`       |                             |
| padAngle         | `number`                | `0`         |                             |
| borderWidth      | `number`                | `2`         |                             |
| borderColor      | `string`                | `'#ffffff'` |                             |
| hoverOffset      | `number`                | `8`         |                             |
| shadow           | `boolean`               | `false`     |                             |
| centerValue      | `string \| number`      | -           |                             |
| centerLabel      | `string`                | -           |                             |
| animated         | `boolean`               | `false`     |                             |
| centerContent    | `ReactNode`             | -           | React only                  |

### AreaChart

| Prop        | Type      | Default | Notes |
| ----------- | --------- | ------- | ----- |
| fillOpacity | `number`  | `0.2`   |       |
| stacked     | `boolean` | `false` |       |
| gradient    | `boolean` | `false` |       |
| pointHollow | `boolean` | `false` |       |
| animated    | `boolean` | `false` |       |

### ScatterChart

| Prop             | Type                                              | Default    | Notes |
| ---------------- | ------------------------------------------------- | ---------- | ----- |
| pointSize        | `number`                                          | `6`        |       |
| pointStyle       | `'circle' \| 'square' \| 'triangle' \| 'diamond'` | `'circle'` |       |
| gradient         | `boolean`                                         | `false`    |       |
| animated         | `boolean`                                         | `false`    |       |
| pointBorderWidth | `number`                                          | `0`        |       |
| pointBorderColor | `string`                                          | `'white'`  |       |

### RadarChart

| Prop             | Type                    | Default     | Notes |
| ---------------- | ----------------------- | ----------- | ----- |
| maxValue         | `number`                | auto        |       |
| levels           | `number`                | `5`         |       |
| fillOpacity      | `number`                | `0.2`       |       |
| gridShape        | `'polygon' \| 'circle'` | `'polygon'` |       |
| showSplitArea    | `boolean`               | `false`     |       |
| splitAreaOpacity | `number`                | `0.06`      |       |
| splitAreaColors  | `string[]`              | -           |       |
| pointBorderWidth | `number`                | `2`         |       |
| pointBorderColor | `string`                | `'#fff'`    |       |
| pointHoverSize   | `number`                | pointSize+2 |       |
| labelAutoAlign   | `boolean`               | `true`      |       |

### HeatmapChart

| Prop            | Type                          | Default   | Notes |
| --------------- | ----------------------------- | --------- | ----- |
| xLabels         | `string[]`                    | -         |       |
| yLabels         | `string[]`                    | -         |       |
| minColor        | `string`                      | `#f0f9ff` |       |
| maxColor        | `string`                      | `#2563eb` |       |
| colorSpace      | `'rgb' \| 'oklch'`            | `'rgb'`   |       |
| cellRadius      | `number`                      | `2`       |       |
| cellGap         | `number`                      | `1`       |       |
| showValues      | `boolean`                     | `false`   |       |
| valueFormatter  | `(value) => string`           | -         |       |
| renderMode      | `'svg' \| 'canvas' \| 'auto'` | `'auto'`  |       |
| canvasThreshold | `number`                      | `1000`    |       |

`renderMode="auto"` 会在 cell 数量超过 `canvasThreshold` 时把 cell 层绘制到 canvas，轴标签和无障碍 SVG 容器仍保留；小矩阵默认继续使用 SVG rect，方便 CSS 和 DOM 级交互检查。

### FunnelChart

漏斗图，从宽到窄展示转化过程。

| Prop      | Type                         | Default      | Notes |
| --------- | ---------------------------- | ------------ | ----- |
| data      | `FunnelChartDatum[]`         | _required_   |       |
| direction | `'vertical' \| 'horizontal'` | `'vertical'` |       |
| gap       | `number`                     | `2`          |       |
| pinch     | `boolean`                    | `false`      |       |
| colors    | `string[]`                   | 主题色板     |       |
| gradient  | `boolean`                    | `false`      |       |

**FunnelChartDatum**: `{ label?: string, value: number, color?: string }`

### GaugeChart

仪表盘图，展示单一指标在范围内的位置。

| Prop           | Type                                                | Default                          | Notes |
| -------------- | --------------------------------------------------- | -------------------------------- | ----- |
| value          | `number`                                            | _required_                       |       |
| min            | `number`                                            | `0`                              |       |
| max            | `number`                                            | `100`                            |       |
| startAngle     | `number`                                            | `135`                            |       |
| endAngle       | `number`                                            | `405`                            |       |
| arcWidth       | `number`                                            | `20`                             |       |
| showTicks      | `boolean`                                           | `true`                           |       |
| tickCount      | `number`                                            | `5`                              |       |
| valueFormatter | `(value: number) => string`                         | -                                |       |
| label          | `string`                                            | -                                |       |
| segments       | `Array<{ range: [number, number]; color: string }>` | -                                |       |
| trackColor     | `string`                                            | `'var(--tiger-border,#e5e7eb)'`  |       |
| color          | `string`                                            | `'var(--tiger-primary,#2563eb)'` |       |
| colors         | `string[]`                                          | -                                |       |
| gradient       | `boolean`                                           | `false`                          |       |

### SunburstChart

旭日图，以同心环展示分层数据。

| Prop             | Type                   | Default    | Notes |
| ---------------- | ---------------------- | ---------- | ----- |
| data             | `SunburstChartDatum[]` | _required_ |       |
| innerRadiusRatio | `number`               | `0`        |       |
| showLabels       | `boolean`              | `true`     |       |
| colors           | `string[]`             | 主题色板   |       |
| gradient         | `boolean`              | `false`    |       |

**SunburstChartDatum**: `{ label: string, value: number, color?: string, children?: SunburstChartDatum[] }`

### TreeMapChart

矩形树图，按面积比例展示分层数据。

| Prop         | Type                  | Default    | Notes |
| ------------ | --------------------- | ---------- | ----- |
| data         | `TreeMapChartDatum[]` | _required_ |       |
| gap          | `number`              | `2`        |       |
| showLabels   | `boolean`             | `true`     |       |
| minLabelSize | `number`              | `10`       |       |
| colors       | `string[]`            | 主题色板   |       |
| gradient     | `boolean`             | `false`    |       |

**TreeMapChartDatum**: `{ label: string, value: number, color?: string, children?: TreeMapChartDatum[] }`

### OrgChart

组织结构图，按 Tree 数据结构生成 SVG 节点与连线布局。

| Prop          | Type                             | Default      | Notes            |
| ------------- | -------------------------------- | ------------ | ---------------- |
| data          | `OrgChartNode \| OrgChartNode[]` | _required_   | 单根或多根组织树 |
| nodeWidth     | `number`                         | `160`        | 节点宽度         |
| nodeHeight    | `number`                         | `72`         | 节点高度         |
| levelGap      | `number`                         | `80`         | 层级间距         |
| siblingGap    | `number`                         | `32`         | 兄弟节点间距     |
| direction     | `'vertical' \| 'horizontal'`     | `'vertical'` | 布局方向         |
| showAvatars   | `boolean`                        | `true`       | 显示头像         |
| showSubtitles | `boolean`                        | `true`       | 显示副标题       |
| selectedId    | `string \| number \| null`       | -            | 受控选中节点     |
| colors        | `string[]`                       | 主题色板     | 默认节点色板     |

**OrgChartNode**: `{ id: string | number, label: string, title?: string, subtitle?: string, avatar?: string, color?: string, children?: OrgChartNode[] }`

---

> **See also**: [Vue examples](../../vue/charts.md) · [React examples](../../react/charts.md)
