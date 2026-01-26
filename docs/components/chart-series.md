# ChartSeries 系列

用于承载单条数据系列的渲染容器，提供统一的元数据与样式入口。

## 基本用法

### Vue 3

```vue
<script setup>
import { ChartCanvas, ChartSeries } from '@expcat/tigercat-vue'

const points = [
  { x: 0, y: 30 },
  { x: 50, y: 60 },
  { x: 100, y: 40 }
]
</script>

<template>
  <ChartCanvas :width="240" :height="120" :padding="16">
    <ChartSeries :data="points" name="Series A" color="#2563eb">
      <circle v-for="(pt, index) in points" :key="index" :cx="pt.x" :cy="pt.y" r="3" />
    </ChartSeries>
  </ChartCanvas>
</template>
```

### React

```tsx
import { ChartCanvas, ChartSeries } from '@expcat/tigercat-react'

const points = [
  { x: 0, y: 30 },
  { x: 50, y: 60 },
  { x: 100, y: 40 }
]

export default function Demo() {
  return (
    <ChartCanvas width={240} height={120} padding={16}>
      <ChartSeries data={points} name="Series A" color="#2563eb">
        {points.map((pt, index) => (
          <circle key={index} cx={pt.x} cy={pt.y} r={3} />
        ))}
      </ChartSeries>
    </ChartCanvas>
  )
}
```

## API

### Props

| 属性      | 说明         | 类型                                                                     | 默认值 |
| --------- | ------------ | ------------------------------------------------------------------------ | ------ |
| data      | 系列数据     | `ChartSeriesPoint[]`                                                     | -      |
| name      | 系列名称     | `string`                                                                 | -      |
| color     | 系列颜色     | `string`                                                                 | -      |
| opacity   | 透明度       | `number`                                                                 | -      |
| type      | 系列类型提示 | `'bar' \| 'scatter' \| 'line' \| 'area' \| 'pie' \| 'radar' \| 'custom'` | -      |
| className | 自定义类名   | `string`                                                                 | -      |

## 设计说明

- `ChartSeries` 不负责具体图形渲染，仅提供统一容器与元数据。
- 通过 `data` 和 `type` 为后续图表组件统一数据入口。
