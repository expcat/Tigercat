# ChartLegend

图表图例组件，用于显示数据系列的标识和交互控制。

## 基础用法

ChartLegend 通常与图表组件配合使用，通过 `showLegend` 属性启用：

```vue
<BarChart :data="data" :showLegend="true" />
```

```tsx
<BarChart data={data} showLegend />
```

## 图例位置

通过 `legendPosition` 控制图例位置：

```vue
<BarChart :data="data" :showLegend="true" legendPosition="bottom" />
<PieChart :data="data" :showLegend="true" legendPosition="right" />
```

```tsx
<BarChart data={data} showLegend legendPosition="bottom" />
<PieChart data={data} showLegend legendPosition="right" />
```

| 值       | 描述 |
| -------- | ---- |
| `top`    | 顶部 |
| `bottom` | 底部 |
| `left`   | 左侧 |
| `right`  | 右侧 |

## 自定义格式化

通过 `legendFormatter` 自定义图例文本：

```vue
<PieChart
  :data="data"
  :showLegend="true"
  :legendFormatter="(item) => `${item.label}: ${item.value}%`" />
```

```tsx
<PieChart data={data} showLegend legendFormatter={(item) => `${item.label}: ${item.value}%`} />
```

## 交互支持

当图表启用 `hoverable` 或 `selectable` 时，图例也支持交互：

- 悬停图例项会高亮对应的数据项
- 点击图例项可选中对应的数据项

```vue
<PieChart :data="data" :showLegend="true" :hoverable="true" :selectable="true" />
```

## API

### Props

ChartLegend 作为内部组件，通过父图表组件的属性控制：

| 属性            | 类型                               | 默认值     | 描述             |
| --------------- | ---------------------------------- | ---------- | ---------------- |
| showLegend      | `boolean`                          | `false`    | 是否显示图例     |
| legendPosition  | `'top'\|'bottom'\|'left'\|'right'` | `'bottom'` | 图例位置         |
| legendFormatter | `(item: T) => string`              | -          | 自定义图例格式化 |
| colors          | `string[]`                         | 默认色板   | 图例颜色列表     |

### 无障碍

- 图例容器使用 `role="list"` 和 `aria-label="Chart legend"`
- 每个图例项使用 `role="listitem"`
- 可交互的图例项使用 `role="button"` 并支持键盘导航

## 支持的图表

以下图表组件支持 ChartLegend：

- [BarChart](./bar-chart.md)
- [PieChart](./pie-chart.md)
- [DonutChart](./donut-chart.md)
- [ScatterChart](./scatter-chart.md)
- [RadarChart](./radar-chart.md)
