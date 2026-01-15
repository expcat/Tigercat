# Steps 步骤条

步骤条组件，用于引导用户按照流程完成任务，支持横向和纵向布局，可自定义状态和样式。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current">
    <StepsItem title="已完成" description="这是步骤的描述信息" />
    <StepsItem title="进行中" description="这是步骤的描述信息" />
    <StepsItem title="待完成" description="这是步骤的描述信息" />
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current}>
      <StepsItem title="已完成" description="这是步骤的描述信息" />
      <StepsItem title="进行中" description="这是步骤的描述信息" />
      <StepsItem title="待完成" description="这是步骤的描述信息" />
    </Steps>
  )
}
```

## 纵向步骤条

通过 `direction` 属性设置步骤条方向为纵向。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current" direction="vertical">
    <StepsItem title="已完成" description="这是步骤的描述信息" />
    <StepsItem title="进行中" description="这是步骤的描述信息" />
    <StepsItem title="待完成" description="这是步骤的描述信息" />
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current} direction="vertical">
      <StepsItem title="已完成" description="这是步骤的描述信息" />
      <StepsItem title="进行中" description="这是步骤的描述信息" />
      <StepsItem title="待完成" description="这是步骤的描述信息" />
    </Steps>
  )
}
```

## 迷你版

通过 `simple` 属性开启迷你版模式，隐藏描述信息，使用更小的图标。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current" simple>
    <StepsItem title="已完成" />
    <StepsItem title="进行中" />
    <StepsItem title="待完成" />
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current} simple>
      <StepsItem title="已完成" />
      <StepsItem title="进行中" />
      <StepsItem title="待完成" />
    </Steps>
  )
}
```

## 小尺寸

通过 `size` 属性设置步骤条尺寸为 `small`。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current" size="small">
    <StepsItem title="已完成" description="这是步骤的描述信息" />
    <StepsItem title="进行中" description="这是步骤的描述信息" />
    <StepsItem title="待完成" description="这是步骤的描述信息" />
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current} size="small">
      <StepsItem title="已完成" description="这是步骤的描述信息" />
      <StepsItem title="进行中" description="这是步骤的描述信息" />
      <StepsItem title="待完成" description="这是步骤的描述信息" />
    </Steps>
  )
}
```

## 错误状态

通过 `status` 属性设置当前步骤的状态为错误。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current" status="error">
    <StepsItem title="已完成" description="这是步骤的描述信息" />
    <StepsItem title="出错了" description="这是步骤的描述信息" />
    <StepsItem title="待完成" description="这是步骤的描述信息" />
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current} status="error">
      <StepsItem title="已完成" description="这是步骤的描述信息" />
      <StepsItem title="出错了" description="这是步骤的描述信息" />
      <StepsItem title="待完成" description="这是步骤的描述信息" />
    </Steps>
  )
}
```

## 可点击步骤

通过 `clickable` 属性使步骤可点击，配合 `v-model:current` (Vue) 或 `onChange` (React) 实现步骤切换。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(0)
</script>

<template>
  <Steps v-model:current="current" clickable>
    <StepsItem title="步骤 1" description="点击切换步骤" />
    <StepsItem title="步骤 2" description="点击切换步骤" />
    <StepsItem title="步骤 3" description="点击切换步骤" />
  </Steps>
  <div class="mt-4">当前步骤: {{ current + 1 }}</div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(0)

  return (
    <div>
      <Steps current={current} clickable onChange={setCurrent}>
        <StepsItem title="步骤 1" description="点击切换步骤" />
        <StepsItem title="步骤 2" description="点击切换步骤" />
        <StepsItem title="步骤 3" description="点击切换步骤" />
      </Steps>
      <div className="mt-4">当前步骤: {current + 1}</div>
    </div>
  )
}
```

## 自定义图标

通过 `icon` 属性自定义步骤图标。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Steps, StepsItem } from '@expcat/tigercat-vue'

const current = ref(1)
</script>

<template>
  <Steps :current="current">
    <StepsItem title="登录">
      <template #icon>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </template>
    </StepsItem>
    <StepsItem title="验证">
      <template #icon>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </template>
    </StepsItem>
    <StepsItem title="完成">
      <template #icon>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7" />
        </svg>
      </template>
    </StepsItem>
  </Steps>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react'

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current}>
      <StepsItem
        title="登录"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
      <StepsItem
        title="验证"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      />
      <StepsItem
        title="完成"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        }
      />
    </Steps>
  )
}
```

## Steps API

### Props

| 参数      | 说明                      | 类型                                         | 默认值         |
| --------- | ------------------------- | -------------------------------------------- | -------------- |
| current   | 当前步骤索引（从 0 开始） | `number`                                     | `0`            |
| status    | 当前步骤的状态            | `'wait' \| 'process' \| 'finish' \| 'error'` | `'process'`    |
| direction | 步骤条方向                | `'horizontal' \| 'vertical'`                 | `'horizontal'` |
| size      | 步骤条尺寸                | `'small' \| 'default'`                       | `'default'`    |
| simple    | 是否启用简洁模式          | `boolean`                                    | `false`        |
| clickable | 步骤是否可点击            | `boolean`                                    | `false`        |
| className | 自定义 CSS 类名           | `string`                                     | -              |
| style     | 自定义样式                | `object`                                     | -              |

### Vue Events

| 事件名         | 说明                      | 回调参数                    |
| -------------- | ------------------------- | --------------------------- |
| update:current | 步骤改变时触发（v-model） | `(current: number) => void` |
| change         | 步骤改变时触发            | `(current: number) => void` |

### React Events

| 事件名   | 说明           | 回调参数                    |
| -------- | -------------- | --------------------------- |
| onChange | 步骤改变时触发 | `(current: number) => void` |

## StepsItem API

### Props

| 参数        | 说明                           | 类型                                         | 默认值  |
| ----------- | ------------------------------ | -------------------------------------------- | ------- |
| title       | 步骤标题                       | `string`                                     | -       |
| description | 步骤描述                       | `string`                                     | -       |
| icon        | 自定义图标                     | `ReactNode` (React) / slot (Vue)             | -       |
| status      | 步骤状态（覆盖自动计算的状态） | `'wait' \| 'process' \| 'finish' \| 'error'` | -       |
| disabled    | 是否禁用                       | `boolean`                                    | `false` |

### Vue Slots

| 插槽名      | 说明           |
| ----------- | -------------- |
| icon        | 自定义图标     |
| description | 自定义描述内容 |

## 主题定制

Steps 组件使用 Tigercat 主题系统，支持通过 CSS 变量自定义颜色：

```css
:root {
  --tiger-primary: #2563eb; /* 进行中/已完成步骤 */
  --tiger-border: #e5e7eb; /* 分隔线/等待态边框 */
  --tiger-surface-muted: #f3f4f6; /* 等待态背景 */
  --tiger-text: #111827; /* 标题默认文字 */
  --tiger-text-muted: #6b7280; /* 等待态/描述文字 */
  --tiger-error: #ef4444; /* 错误态 */
  --tiger-error-bg: #fef2f2; /* 错误态背景 */
}
```

## 无障碍支持

- 语义结构：Steps 使用 `ol`/`li` 渲染列表
- 当前步骤：当前项会标记 `aria-current="step"`
- 可点击模式：当 `clickable=true` 时，标题使用 `button`，支持 Tab 聚焦与 Enter/Space 激活
- 状态指示：状态变化同时通过颜色与图标区分（包含 fallback 的 CSS vars）

## 设计指南

### 何时使用

- 当任务需要分步骤完成时
- 告知用户当前进度和后续步骤
- 引导用户完成复杂流程

### 使用建议

- 步骤数量建议在 2-7 个之间
- 步骤标题要简洁明了
- 适当使用描述信息提供额外说明
- 纵向布局适合移动端或侧边栏
- 横向布局适合桌面端主要内容区域
