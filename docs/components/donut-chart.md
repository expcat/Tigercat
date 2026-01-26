# DonutChart 环形图

用于展示分类占比的环形图组件，基于 PieChart 并提供内半径比例配置。

## 基本用法

### Vue 3

```vue
<script setup>
import { DonutChart } from '@expcat/tigercat-vue'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]
</script>

<template>
  <DonutChart :data="data" :width="320" :height="220" :show-labels="true" />
</template>
```

### React

```tsx
import { DonutChart } from '@expcat/tigercat-react'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

export default function Demo() {
  return <DonutChart data={data} width={320} height={220} showLabels />
}
```

## API

### Props

| 属性             | 说明                 | 类型                                                                         | 默认值                |
| ---------------- | -------------------- | ---------------------------------------------------------------------------- | --------------------- |
| data             | 数据                 | `DonutChartDatum[]`                                                          | -                     |
| width            | 图表宽度             | `number`                                                                     | `320`                 |
| height           | 图表高度             | `number`                                                                     | `200`                 |
| padding          | 内边距               | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                  |
| innerRadius      | 内半径               | `number`                                                                     | -                     |
| innerRadiusRatio | 内半径比例           | `number`                                                                     | `0.6`                 |
| outerRadius      | 外半径               | `number`                                                                     | `min(width,height)/2` |
| startAngle       | 起始角度（弧度）     | `number`                                                                     | `0`                   |
| endAngle         | 结束角度（弧度）     | `number`                                                                     | `Math.PI * 2`         |
| padAngle         | 扇形间隔角度（弧度） | `number`                                                                     | `0`                   |
| colors           | 颜色列表             | `string[]`                                                                   | 主题默认调色板        |
| showLabels       | 显示标签             | `boolean`                                                                    | `false`               |
| labelFormatter   | 标签格式化函数       | `(value, datum, index) => string`                                            | -                     |
| className        | 自定义类名           | `string`                                                                     | -                     |

## 设计说明

- 默认使用 `innerRadiusRatio` 计算内半径。
- 同时传入 `innerRadius` 时优先使用固定内半径。
