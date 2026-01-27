# ChartTooltip

图表提示框组件，用于在悬停时显示数据详情。

## 基础用法

ChartTooltip 通常与图表组件配合使用，通过 `showTooltip` 属性启用：

```vue
<BarChart :data="data" :hoverable="true" :showTooltip="true" />
```

```tsx
<BarChart data={data} hoverable showTooltip />
```

> **注意**: 必须同时启用 `hoverable` 才能显示 tooltip。

## 自定义格式化

通过 `tooltipFormatter` 自定义提示框内容：

```vue
<BarChart
  :data="data"
  :hoverable="true"
  :showTooltip="true"
  :tooltipFormatter="(item) => `销量: ${item.value} 件`" />
```

```tsx
<BarChart data={data} hoverable showTooltip tooltipFormatter={(item) => `销量: ${item.value} 件`} />
```

## 多数据点格式化

对于 ScatterChart 等支持多属性的图表：

```vue
<ScatterChart
  :data="data"
  :hoverable="true"
  :showTooltip="true"
  :tooltipFormatter="(point) => `(${point.x}, ${point.y})`" />
```

```tsx
<ScatterChart
  data={data}
  hoverable
  showTooltip
  tooltipFormatter={(point) => `(${point.x}, ${point.y})`}
/>
```

## API

### Props

ChartTooltip 作为内部组件，通过父图表组件的属性控制：

| 属性             | 类型                  | 默认值  | 描述               |
| ---------------- | --------------------- | ------- | ------------------ |
| showTooltip      | `boolean`             | `false` | 是否显示提示框     |
| hoverable        | `boolean`             | `false` | 是否启用悬停交互   |
| tooltipFormatter | `(item: T) => string` | -       | 自定义提示框格式化 |

### 默认格式化

不同图表类型有不同的默认格式化：

| 图表类型     | 默认格式                  |
| ------------ | ------------------------- |
| BarChart     | `{label}: {value}`        |
| PieChart     | `{label}: {value}`        |
| DonutChart   | `{label}: {value}`        |
| ScatterChart | `{label}` 或 `({x}, {y})` |
| RadarChart   | `{label}: {value}`        |

### 样式

ChartTooltip 使用以下默认样式：

- 背景色: 深色半透明 (`bg-gray-800/90`)
- 文字颜色: 白色 (`text-white`)
- 圆角: 小圆角 (`rounded`)
- 内边距: 紧凑 (`px-2 py-1`)
- 字号: 小号 (`text-xs`)

### 定位

Tooltip 跟随鼠标位置显示，会自动避免超出图表边界。

## 无障碍

- Tooltip 内容通过 `aria-label` 提供给辅助技术
- 当悬停时，相关数据点的 aria-label 会更新以反映当前状态

## 支持的图表

以下图表组件支持 ChartTooltip：

- [BarChart](./bar-chart.md)
- [PieChart](./pie-chart.md)
- [DonutChart](./donut-chart.md)
- [ScatterChart](./scatter-chart.md)
- [RadarChart](./radar-chart.md)
