# PieChart 饼图

用于展示分类占比的饼图组件，可通过 `innerRadius` 配置为环形图。

## 基本用法

### Vue 3

```vue
<script setup>
import { PieChart } from '@expcat/tigercat-vue'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]
</script>

<template>
  <PieChart :data="data" :width="320" :height="220" :show-labels="true" />
</template>
```

### React

```tsx
import { PieChart } from '@expcat/tigercat-react'

const data = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

export default function Demo() {
  return <PieChart data={data} width={320} height={220} showLabels />
}
```

## API

### Props

| 属性           | 说明                 | 类型                                                                         | 默认值                |
| -------------- | -------------------- | ---------------------------------------------------------------------------- | --------------------- |
| data           | 数据                 | `PieChartDatum[]`                                                            | -                     |
| width          | 图表宽度             | `number`                                                                     | `320`                 |
| height         | 图表高度             | `number`                                                                     | `200`                 |
| padding        | 内边距               | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | `24`                  |
| innerRadius    | 内半径（环形图）     | `number`                                                                     | `0`                   |
| outerRadius    | 外半径               | `number`                                                                     | `min(width,height)/2` |
| startAngle     | 起始角度（弧度）     | `number`                                                                     | `0`                   |
| endAngle       | 结束角度（弧度）     | `number`                                                                     | `Math.PI * 2`         |
| padAngle       | 扇形间隔角度（弧度） | `number`                                                                     | `0`                   |
| colors         | 颜色列表             | `string[]`                                                                   | 主题默认调色板        |
| showLabels     | 显示标签             | `boolean`                                                                    | `false`               |
| labelFormatter | 标签格式化函数       | `(value, datum, index) => string`                                            | -                     |
| className      | 自定义类名           | `string`                                                                     | -                     |

## 设计说明

- 使用弧度制，`0` 表示从 3 点钟方向开始。
- 传入 `innerRadius` 即可渲染环形图。
