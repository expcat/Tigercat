# RadarChart 雷达图

用于展示多维指标的雷达图组件，支持单组数据或多系列对比。

## 基本用法

### Vue 3

```vue
<script setup>
import { RadarChart } from '@expcat/tigercat-vue'

const data = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]
</script>

<template>
  <RadarChart :data="data" :width="360" :height="260" />
</template>
```

### React

```tsx
import { RadarChart } from '@expcat/tigercat-react'

const data = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

export default function Demo() {
  return <RadarChart data={data} width={360} height={260} />
}
```

### 多系列对比

```tsx
import { RadarChart } from '@expcat/tigercat-react'

const series = [
  {
    name: '产品 A',
    data: [
      { label: '速度', value: 80 },
      { label: '稳定', value: 65 },
      { label: '设计', value: 90 },
      { label: '续航', value: 70 },
      { label: '价格', value: 50 }
    ]
  },
  {
    name: '产品 B',
    data: [
      { label: '速度', value: 72 },
      { label: '稳定', value: 78 },
      { label: '设计', value: 82 },
      { label: '续航', value: 66 },
      { label: '价格', value: 60 }
    ]
  }
]

export default function Demo() {
  return <RadarChart series={series} width={360} height={260} maxValue={100} />
}
```

## API

### Props

| 属性                | 说明               | 类型                                                                         | 默认值         |
| ------------------- | ------------------ | ---------------------------------------------------------------------------- | -------------- |
| data                | 数据               | `RadarChartDatum[]`                                                          | -              |
| series              | 多系列数据         | `RadarChartSeries[]`                                                         | -              |
| width               | 图表宽度           | `number`                                                                     | `320`          |
| height              | 图表高度           | `number`                                                                     | `200`          |
| padding             | 内边距             | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`           |
| maxValue            | 最大值             | `number`                                                                     | -              |
| startAngle          | 起始角度（弧度）   | `number`                                                                     | `-Math.PI / 2` |
| levels              | 网格层数           | `number`                                                                     | `5`            |
| showLevelLabels     | 显示层级刻度       | `boolean`                                                                    | `false`        |
| showGrid            | 显示网格           | `boolean`                                                                    | `true`         |
| showAxis            | 显示轴线           | `boolean`                                                                    | `true`         |
| showLabels          | 显示标签           | `boolean`                                                                    | `true`         |
| labelOffset         | 标签偏移           | `number`                                                                     | `12`           |
| labelFormatter      | 标签格式化函数     | `(datum, index) => string`                                                   | -              |
| levelLabelFormatter | 层级标签格式化函数 | `(value, level) => string`                                                   | -              |
| levelLabelOffset    | 层级标签偏移       | `number`                                                                     | `8`            |
| colors              | 系列颜色列表       | `string[]`                                                                   | 主题默认调色板 |
| gridLineStyle       | 网格线样式         | `'solid' \| 'dashed' \| 'dotted'`                                            | `'solid'`      |
| gridStrokeWidth     | 网格线宽           | `number`                                                                     | `1`            |
| strokeColor         | 区域描边颜色       | `string`                                                                     | 主题图表色     |
| strokeWidth         | 区域描边宽度       | `number`                                                                     | `2`            |
| fillColor           | 区域填充颜色       | `string`                                                                     | 主题图表色     |
| fillOpacity         | 区域填充透明度     | `number`                                                                     | `0.2`          |
| showPoints          | 显示数据点         | `boolean`                                                                    | `true`         |
| pointSize           | 数据点大小         | `number`                                                                     | `3`            |
| pointColor          | 数据点颜色         | `string`                                                                     | -              |
| className           | 自定义类名         | `string`                                                                     | -              |

## 设计说明

- 默认从顶部开始绘制（$-\frac{\pi}{2}$）。
- `maxValue` 用于统一尺度，适合多组对比或固定分值区间。
