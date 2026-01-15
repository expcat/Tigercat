# Slider 滑块

滑块组件，用于在数值区间内进行选择，支持单值和范围选择。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const value = ref(50)
</script>

<template>
  <Slider v-model:value="value" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function App() {
  const [value, setValue] = useState(50)

  return <Slider value={value} onChange={setValue} />
}
```

## 范围选择

通过 `range` 属性启用范围选择模式，此时值为一个包含最小值和最大值的数组。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const rangeValue = ref([20, 80])
</script>

<template>
  <Slider v-model:value="rangeValue" range />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function App() {
  const [rangeValue, setRangeValue] = useState([20, 80])

  return <Slider value={rangeValue} onChange={setRangeValue} range />
}
```

## 步进

通过 `step` 属性设置步进值。

### Vue 3

```vue
<template>
  <Slider :min="0" :max="100" :step="10" :default-value="30" />
</template>
```

### React

```tsx
<Slider min={0} max={100} step={10} defaultValue={30} />
```

## 禁用状态

通过 `disabled` 属性禁用滑块。

### Vue 3

```vue
<template>
  <Slider disabled :default-value="50" />
</template>
```

### React

```tsx
<Slider disabled defaultValue={50} />
```

## 尺寸

Slider 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Slider size="sm" :default-value="30" />
  <Slider size="md" :default-value="50" />
  <Slider size="lg" :default-value="70" />
</template>
```

### React

```tsx
<Slider size="sm" defaultValue={30} />
<Slider size="md" defaultValue={50} />
<Slider size="lg" defaultValue={70} />
```

## 带标记

使用 `marks` 属性显示标记点。可以是布尔值或者对象。

### Vue 3

```vue
<template>
  <!-- 简单标记 -->
  <Slider :marks="true" />

  <!-- 自定义标记 -->
  <Slider
    :marks="{ 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' }"
    :default-value="25" />
</template>
```

### React

```tsx
{
  /* 简单标记 */
}
;<Slider marks />

{
  /* 自定义标记 */
}
;<Slider marks={{ 0: '0°C', 25: '25°C', 50: '50°C', 75: '75°C', 100: '100°C' }} defaultValue={25} />
```

## 工具提示

通过 `tooltip` 属性控制是否显示工具提示，默认为 `true`。

### Vue 3

```vue
<template>
  <Slider :tooltip="false" :default-value="50" />
</template>
```

### React

```tsx
<Slider tooltip={false} defaultValue={50} />
```

## 受控与非受控

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

// 受控组件
const value = ref(50)

// 非受控组件
</script>

<template>
  <!-- 受控 -->
  <Slider v-model:value="value" />

  <!-- 非受控 -->
  <Slider :default-value="50" @change="handleChange" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function App() {
  // 受控组件
  const [value, setValue] = useState(50)

  return (
    <>
      {/* 受控 */}
      <Slider value={value} onChange={setValue} />

      {/* 非受控 */}
      <Slider defaultValue={50} onChange={(val) => console.log(val)} />
    </>
  )
}
```

## API

### Props / 属性

| 属性         | 说明             | 类型                                                      | 默认值                           | 可选值                     |
| ------------ | ---------------- | --------------------------------------------------------- | -------------------------------- | -------------------------- |
| value        | 当前值（受控）   | `number \| [number, number]`                              | -                                | -                          |
| defaultValue | 默认值（非受控） | `number \| [number, number]`                              | `0` (单值) / `[min, max]` (范围) | -                          |
| min          | 最小值           | `number`                                                  | `0`                              | -                          |
| max          | 最大值           | `number`                                                  | `100`                            | -                          |
| step         | 步进值           | `number`                                                  | `1`                              | -                          |
| disabled     | 是否禁用         | `boolean`                                                 | `false`                          | `true` \| `false`          |
| marks        | 刻度标记         | `boolean \| Record<number, string>`                       | `false`                          | -                          |
| tooltip      | 是否显示提示     | `boolean`                                                 | `true`                           | `true` \| `false`          |
| size         | 滑块尺寸         | `SliderSize`                                              | `'md'`                           | `'sm'` \| `'md'` \| `'lg'` |
| range        | 是否为范围选择   | `boolean`                                                 | `false`                          | `true` \| `false`          |
| className    | 额外 CSS 类名    | `string`                                                  | -                                | -                          |
| style        | 自定义样式       | `Record<string, string \| number> \| React.CSSProperties` | -                                | -                          |

#### React 专属属性

| 属性     | 说明           | 类型                                          | 默认值 |
| -------- | -------------- | --------------------------------------------- | ------ |
| onChange | 值变化时的回调 | `(value: number \| [number, number]) => void` | -      |

### Events / 事件 (Vue)

| 事件名       | 说明         | 回调参数                              |
| ------------ | ------------ | ------------------------------------- |
| update:value | 值变化时触发 | `(value: number \| [number, number])` |
| change       | 值变化时触发 | `(value: number \| [number, number])` |

## 样式定制

Slider 组件使用 Tailwind CSS 构建，支持通过 CSS 变量进行主题配置。

### 主题颜色配置

Slider 组件使用与 Button 相同的主题颜色系统：

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;

  /* Slider/通用表面与边框 */
  --tiger-border: #e5e7eb;
  --tiger-surface: #ffffff;
  --tiger-text: #111827;
  --tiger-text-muted: #6b7280;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #10b981;
  --tiger-primary-hover: #059669;

  --tiger-border: #34d399;
}
```

查看完整的主题配置文档：[主题配置指南](../theme.md)

### 额外样式

Vue/React 版本的 Slider 组件都支持 `className` 与 `style`：

```tsx
<Slider className="my-4" defaultValue={50} />

<Slider style={{ marginTop: 16 }} defaultValue={50} />
```

## 键盘导航

Slider 组件支持键盘导航：

- `←` / `↓` - 减小值
- `→` / `↑` - 增大值
- `Home` - 跳到最小值
- `End` - 跳到最大值

## 无障碍 (Accessibility)

- 使用 ARIA 属性 `role="slider"` 标识滑块
- 提供 `aria-valuenow`、`aria-valuemin`、`aria-valuemax` 属性
- 可通过 `aria-label` / `aria-labelledby` / `aria-describedby` 提供可访问名称与说明
- `range` 模式下，若传入 `aria-label` 会自动为两个滑块追加 `(min)` / `(max)` 后缀；未提供标签时会提供默认的 `Minimum value` / `Maximum value`
- 支持键盘导航
- 禁用状态下会设置 `aria-disabled` 属性
- 使用 `focus:ring` 提供清晰的焦点指示器

## TypeScript 支持

Slider 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { SliderProps, SliderSize } from '@expcat/tigercat-core'
// Vue
import type { Slider, VueSliderProps } from '@expcat/tigercat-vue'
// React
import type { Slider, SliderProps as ReactSliderProps } from '@expcat/tigercat-react'
```

## 示例

### 温度控制器

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const temperature = ref(22)
</script>

<template>
  <div>
    <h3>室内温度：{{ temperature }}°C</h3>
    <Slider
      v-model:value="temperature"
      :min="16"
      :max="30"
      :step="0.5"
      :marks="{
        16: '16°C',
        20: '20°C',
        24: '24°C',
        28: '28°C',
        30: '30°C'
      }" />
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function TemperatureControl() {
  const [temperature, setTemperature] = useState(22)

  return (
    <div>
      <h3>室内温度：{temperature}°C</h3>
      <Slider
        value={temperature}
        onChange={setTemperature}
        min={16}
        max={30}
        step={0.5}
        marks={{
          16: '16°C',
          20: '20°C',
          24: '24°C',
          28: '28°C',
          30: '30°C'
        }}
      />
    </div>
  )
}
```

### 价格区间选择

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const priceRange = ref([200, 800])
</script>

<template>
  <div>
    <h3>价格区间：¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}</h3>
    <Slider
      v-model:value="priceRange"
      :min="0"
      :max="1000"
      :step="50"
      range
      :marks="{
        0: '¥0',
        500: '¥500',
        1000: '¥1000'
      }" />
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function PriceRangeSelector() {
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 800])

  return (
    <div>
      <h3>
        价格区间：¥{priceRange[0]} - ¥{priceRange[1]}
      </h3>
      <Slider
        value={priceRange}
        onChange={setPriceRange}
        min={0}
        max={1000}
        step={50}
        range
        marks={{
          0: '¥0',
          500: '¥500',
          1000: '¥1000'
        }}
      />
    </div>
  )
}
```

### 音量控制

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Slider } from '@expcat/tigercat-vue'

const volume = ref(50)
</script>

<template>
  <div class="flex items-center gap-4">
    <span>🔇</span>
    <Slider v-model:value="volume" :min="0" :max="100" class="flex-1" />
    <span>🔊</span>
    <span class="w-12">{{ volume }}%</span>
  </div>
</template>
```

#### React

```tsx
import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react'

function VolumeControl() {
  const [volume, setVolume] = useState(50)

  return (
    <div className="flex items-center gap-4">
      <span>🔇</span>
      <Slider value={volume} onChange={setVolume} min={0} max={100} className="flex-1" />
      <span>🔊</span>
      <span className="w-12">{volume}%</span>
    </div>
  )
}
```
