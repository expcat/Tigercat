# ChartAxis 坐标轴

提供基础 SVG 坐标轴渲染能力，适用于构建柱状图、折线图、散点图等图表。

## 基本用法

### Vue 3

```vue
<script setup>
import { ChartAxis, ChartCanvas, createLinearScale } from '@expcat/tigercat-vue'

const xScale = createLinearScale([0, 100], [0, 240])
</script>

<template>
  <ChartCanvas :width="280" :height="120" :padding="{ left: 24, right: 16, top: 16, bottom: 24 }">
    <ChartAxis :scale="xScale" orientation="bottom" :y="80" label="X" />
  </ChartCanvas>
</template>
```

### React

```tsx
import { ChartAxis, ChartCanvas, createLinearScale } from '@expcat/tigercat-react'

const xScale = createLinearScale([0, 100], [0, 240])

export default function Demo() {
  return (
    <ChartCanvas width={280} height={120} padding={{ left: 24, right: 16, top: 16, bottom: 24 }}>
      <ChartAxis scale={xScale} orientation="bottom" y={80} label="X" />
    </ChartCanvas>
  )
}
```

## 指定刻度

### Vue 3

```vue
<template>
  <ChartAxis :scale="xScale" orientation="bottom" :y="80" :tick-values="[0, 50, 100]" />
</template>
```

### React

```tsx
<ChartAxis scale={xScale} orientation="bottom" y={80} tickValues={[0, 50, 100]} />
```

## API

### Props

| 属性        | 说明           | 类型                | 默认值     |
| ----------- | -------------- | ------------------- | ---------- | ----- | --------- | ---------- |
| orientation | 坐标轴方向     | `'left'             | 'right'    | 'top' | 'bottom'` | `'bottom'` |
| scale       | 轴比例尺       | `ChartScale`        | -          |
| ticks       | 线性刻度数量   | `number`            | `5`        |
| tickValues  | 自定义刻度值   | `(string            | number)[]` | -     |
| tickFormat  | 刻度格式化函数 | `(value) => string` | -          |
| tickSize    | 刻度线长度     | `number`            | `6`        |
| tickPadding | 刻度文字间距   | `number`            | `4`        |
| label       | 轴标题         | `string`            | -          |
| labelOffset | 标题偏移量     | `number`            | `28`       |
| x           | 轴平移 X       | `number`            | `0`        |
| y           | 轴平移 Y       | `number`            | `0`        |
| className   | 自定义类名     | `string`            | -          |

## 设计说明

- `ChartAxis` 仅负责绘制坐标轴与刻度，图形本体由其它图表组件完成。
- 推荐配合 `ChartCanvas` 使用，统一处理边距与视图尺寸。
