# Timeline 时间线

垂直展示时间流信息的时间线组件。支持多种展示模式和自定义渲染。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Timeline } from '@tigercat/vue'

const items = ref([
  { key: 1, label: '2024-01-01', content: 'Create a project' },
  { key: 2, label: '2024-01-05', content: 'Write documentation' },
  { key: 3, label: '2024-01-10', content: 'Release version 1.0' },
])
</script>

<template>
  <Timeline :items="items" />
</template>
```

### React

```tsx
import { Timeline } from '@tigercat/react'

function App() {
  const items = [
    { key: 1, label: '2024-01-01', content: 'Create a project' },
    { key: 2, label: '2024-01-05', content: 'Write documentation' },
    { key: 3, label: '2024-01-10', content: 'Release version 1.0' },
  ]

  return <Timeline items={items} />
}
```

## 展示模式 (Display Modes)

Timeline 组件支持 3 种展示模式：

- `left` - 左侧时间线（默认）
- `right` - 右侧时间线
- `alternate` - 交替展示

### 左侧时间线

### Vue 3

```vue
<template>
  <Timeline :items="items" mode="left" />
</template>
```

### React

```tsx
<Timeline items={items} mode="left" />
```

### 右侧时间线

### Vue 3

```vue
<template>
  <Timeline :items="items" mode="right" />
</template>
```

### React

```tsx
<Timeline items={items} mode="right" />
```

### 交替展示

### Vue 3

```vue
<template>
  <Timeline :items="items" mode="alternate" />
</template>
```

### React

```tsx
<Timeline items={items} mode="alternate" />
```

## 自定义颜色

通过设置 `color` 属性可以自定义时间点的颜色。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Timeline } from '@tigercat/vue'

const items = ref([
  { 
    key: 1, 
    label: '2024-01-01', 
    content: 'Create a project',
    color: '#10b981' 
  },
  { 
    key: 2, 
    label: '2024-01-05', 
    content: 'Write documentation',
    color: '#f59e0b' 
  },
  { 
    key: 3, 
    label: '2024-01-10', 
    content: 'Release version 1.0',
    color: '#ef4444' 
  },
])
</script>

<template>
  <Timeline :items="items" />
</template>
```

### React

```tsx
import { Timeline } from '@tigercat/react'

function App() {
  const items = [
    { 
      key: 1, 
      label: '2024-01-01', 
      content: 'Create a project',
      color: '#10b981' 
    },
    { 
      key: 2, 
      label: '2024-01-05', 
      content: 'Write documentation',
      color: '#f59e0b' 
    },
    { 
      key: 3, 
      label: '2024-01-10', 
      content: 'Release version 1.0',
      color: '#ef4444' 
    },
  ]

  return <Timeline items={items} />
}
```

## 自定义节点

可以通过 `dot` 属性或插槽/render prop 自定义时间轴节点。

### 使用 dot 属性

#### Vue 3

```vue
<script setup>
import { ref, h } from 'vue'
import { Timeline, Icon } from '@tigercat/vue'

const items = ref([
  { 
    key: 1, 
    label: '2024-01-01', 
    content: 'Create a project',
    dot: h(Icon, { name: 'check-circle', class: 'text-green-500' })
  },
  { 
    key: 2, 
    label: '2024-01-05', 
    content: 'In progress',
    dot: h(Icon, { name: 'clock', class: 'text-blue-500' })
  },
])
</script>

<template>
  <Timeline :items="items" />
</template>
```

#### React

```tsx
import { Timeline, Icon } from '@tigercat/react'

function App() {
  const items = [
    { 
      key: 1, 
      label: '2024-01-01', 
      content: 'Create a project',
      dot: <Icon name="check-circle" className="text-green-500" />
    },
    { 
      key: 2, 
      label: '2024-01-05', 
      content: 'In progress',
      dot: <Icon name="clock" className="text-blue-500" />
    },
  ]

  return <Timeline items={items} />
}
```

### 使用插槽/Render Prop

#### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Timeline, Icon } from '@tigercat/vue'

const items = ref([
  { key: 1, label: '2024-01-01', content: 'Create a project' },
  { key: 2, label: '2024-01-05', content: 'In progress' },
])
</script>

<template>
  <Timeline :items="items">
    <template #dot="{ item }">
      <Icon v-if="item.key === 1" name="check-circle" class="text-green-500" />
      <Icon v-else name="clock" class="text-blue-500" />
    </template>
  </Timeline>
</template>
```

#### React

```tsx
import { Timeline, Icon } from '@tigercat/react'

function App() {
  const items = [
    { key: 1, label: '2024-01-01', content: 'Create a project' },
    { key: 2, label: '2024-01-05', content: 'In progress' },
  ]

  return (
    <Timeline 
      items={items}
      renderDot={(item) => (
        item.key === 1 
          ? <Icon name="check-circle" className="text-green-500" />
          : <Icon name="clock" className="text-blue-500" />
      )}
    />
  )
}
```

## 自定义内容

可以通过插槽或 render prop 自定义时间轴内容。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Timeline, Tag } from '@tigercat/vue'

const items = ref([
  { 
    key: 1, 
    date: '2024-01-01',
    title: 'Project Started',
    description: 'Initial project setup and planning',
    status: 'completed'
  },
  { 
    key: 2, 
    date: '2024-01-05',
    title: 'Development Phase',
    description: 'Writing code and implementing features',
    status: 'in-progress'
  },
])
</script>

<template>
  <Timeline :items="items">
    <template #item="{ item }">
      <div class="mb-2">
        <span class="text-sm text-gray-500">{{ item.date }}</span>
      </div>
      <div class="font-medium text-gray-900 mb-1">
        {{ item.title }}
        <Tag 
          :variant="item.status === 'completed' ? 'success' : 'primary'"
          size="sm"
          class="ml-2"
        >
          {{ item.status }}
        </Tag>
      </div>
      <div class="text-gray-600">
        {{ item.description }}
      </div>
    </template>
  </Timeline>
</template>
```

### React

```tsx
import { Timeline, Tag } from '@tigercat/react'

function App() {
  const items = [
    { 
      key: 1, 
      date: '2024-01-01',
      title: 'Project Started',
      description: 'Initial project setup and planning',
      status: 'completed'
    },
    { 
      key: 2, 
      date: '2024-01-05',
      title: 'Development Phase',
      description: 'Writing code and implementing features',
      status: 'in-progress'
    },
  ]

  return (
    <Timeline 
      items={items}
      renderItem={(item) => (
        <div>
          <div className="mb-2">
            <span className="text-sm text-gray-500">{item.date}</span>
          </div>
          <div className="font-medium text-gray-900 mb-1">
            {item.title}
            <Tag 
              variant={item.status === 'completed' ? 'success' : 'primary'}
              size="sm"
              className="ml-2"
            >
              {item.status}
            </Tag>
          </div>
          <div className="text-gray-600">
            {item.description}
          </div>
        </div>
      )}
    />
  )
}
```

## 等待中状态

通过 `pending` 属性可以显示等待中的时间节点。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Timeline } from '@tigercat/vue'

const items = ref([
  { key: 1, label: '2024-01-01', content: 'Create a project' },
  { key: 2, label: '2024-01-05', content: 'Write documentation' },
  { key: 3, label: '2024-01-10', content: 'Release version 1.0' },
])
</script>

<template>
  <Timeline :items="items" :pending="true" />
</template>
```

### React

```tsx
import { Timeline } from '@tigercat/react'

function App() {
  const items = [
    { key: 1, label: '2024-01-01', content: 'Create a project' },
    { key: 2, label: '2024-01-05', content: 'Write documentation' },
    { key: 3, label: '2024-01-10', content: 'Release version 1.0' },
  ]

  return <Timeline items={items} pending />
}
```

### 自定义等待中内容

#### Vue 3

```vue
<template>
  <Timeline :items="items" :pending="true">
    <template #pending>
      <div class="text-gray-500">Processing...</div>
    </template>
  </Timeline>
</template>
```

#### React

```tsx
<Timeline 
  items={items} 
  pending 
  pendingContent={<div className="text-gray-500">Processing...</div>}
/>
```

## 反转顺序

通过 `reverse` 属性可以反转时间线的顺序。

### Vue 3

```vue
<template>
  <Timeline :items="items" :reverse="true" />
</template>
```

### React

```tsx
<Timeline items={items} reverse />
```

## 完整示例

### Vue 3

```vue
<script setup>
import { ref, h } from 'vue'
import { Timeline, Tag, Icon } from '@tigercat/vue'

const events = ref([
  {
    key: 1,
    date: '2024-01-01 09:00',
    title: 'Project Kickoff',
    description: 'Team meeting and project planning',
    status: 'completed',
    color: '#10b981',
    dot: h(Icon, { name: 'check-circle', class: 'text-white bg-green-500 rounded-full p-1' })
  },
  {
    key: 2,
    date: '2024-01-05 14:30',
    title: 'Design Review',
    description: 'UI/UX design presentation and feedback',
    status: 'completed',
    color: '#10b981',
    dot: h(Icon, { name: 'check-circle', class: 'text-white bg-green-500 rounded-full p-1' })
  },
  {
    key: 3,
    date: '2024-01-10 10:00',
    title: 'Development Sprint 1',
    description: 'Implementing core features',
    status: 'in-progress',
    color: '#3b82f6',
    dot: h(Icon, { name: 'code', class: 'text-white bg-blue-500 rounded-full p-1' })
  },
  {
    key: 4,
    date: '2024-01-20',
    title: 'Testing Phase',
    description: 'QA testing and bug fixes',
    status: 'pending',
    color: '#6b7280'
  },
])
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Project Timeline</h2>
    <Timeline :items="events" mode="left">
      <template #item="{ item }">
        <div class="mb-2">
          <span class="text-sm text-gray-500">{{ item.date }}</span>
        </div>
        <div class="font-medium text-gray-900 mb-1">
          {{ item.title }}
          <Tag 
            :variant="
              item.status === 'completed' ? 'success' : 
              item.status === 'in-progress' ? 'primary' : 
              'secondary'
            "
            size="sm"
            class="ml-2"
          >
            {{ item.status }}
          </Tag>
        </div>
        <div class="text-gray-600">
          {{ item.description }}
        </div>
      </template>
    </Timeline>
  </div>
</template>
```

### React

```tsx
import { Timeline, Tag, Icon } from '@tigercat/react'

function App() {
  const events = [
    {
      key: 1,
      date: '2024-01-01 09:00',
      title: 'Project Kickoff',
      description: 'Team meeting and project planning',
      status: 'completed',
      color: '#10b981',
      dot: <Icon name="check-circle" className="text-white bg-green-500 rounded-full p-1" />
    },
    {
      key: 2,
      date: '2024-01-05 14:30',
      title: 'Design Review',
      description: 'UI/UX design presentation and feedback',
      status: 'completed',
      color: '#10b981',
      dot: <Icon name="check-circle" className="text-white bg-green-500 rounded-full p-1" />
    },
    {
      key: 3,
      date: '2024-01-10 10:00',
      title: 'Development Sprint 1',
      description: 'Implementing core features',
      status: 'in-progress',
      color: '#3b82f6',
      dot: <Icon name="code" className="text-white bg-blue-500 rounded-full p-1" />
    },
    {
      key: 4,
      date: '2024-01-20',
      title: 'Testing Phase',
      description: 'QA testing and bug fixes',
      status: 'pending',
      color: '#6b7280'
    },
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      <Timeline 
        items={events}
        mode="left"
        renderItem={(item) => (
          <div>
            <div className="mb-2">
              <span className="text-sm text-gray-500">{item.date}</span>
            </div>
            <div className="font-medium text-gray-900 mb-1">
              {item.title}
              <Tag 
                variant={
                  item.status === 'completed' ? 'success' : 
                  item.status === 'in-progress' ? 'primary' : 
                  'secondary'
                }
                size="sm"
                className="ml-2"
              >
                {item.status}
              </Tag>
            </div>
            <div className="text-gray-600">
              {item.description}
            </div>
          </div>
        )}
      />
    </div>
  )
}
```

## API

### Timeline Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `items` | 时间线数据源 | `TimelineItem[]` | `[]` |
| `mode` | 时间线展示模式 | `'left' \| 'right' \| 'alternate'` | `'left'` |
| `pending` | 是否显示等待中状态 | `boolean` | `false` |
| `pendingDot` | 等待中节点的自定义内容 | `ReactNode` (React) / VNode (Vue) | - |
| `pendingContent` | 等待中内容 (React only) | `ReactNode` | `'Loading...'` |
| `reverse` | 是否反转时间线顺序 | `boolean` | `false` |
| `renderItem` | 自定义渲染时间线项内容 (React only) | `(item: TimelineItem, index: number) => ReactNode` | - |
| `renderDot` | 自定义渲染时间点 (React only) | `(item: TimelineItem) => ReactNode` | - |
| `className` | 额外的 CSS 类名 | `string` | - |

### TimelineItem

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| `key` | 时间线项唯一键 | `string \| number` | - |
| `label` | 时间标签 | `string` | - |
| `content` | 内容描述 | `string` | - |
| `color` | 时间点颜色（CSS颜色值） | `string` | - |
| `dot` | 自定义时间点内容 | `ReactNode` / VNode | - |
| `position` | 交替模式下的位置 | `'left' \| 'right'` | 自动计算 |
| `[key: string]` | 自定义数据 | `unknown` | - |

### 插槽 (Vue)

| 插槽名称 | 说明 | 参数 |
|----------|------|------|
| `item` | 自定义时间线项内容 | `{ item: TimelineItem, index: number }` |
| `dot` | 自定义时间点 | `{ item: TimelineItem }` |
| `pending` | 自定义等待中内容 | - |

## 主题定制

Timeline 组件使用 Tailwind CSS 类，可以通过覆盖相应的类来自定义样式。主要支持以下 CSS 变量：

- `--tiger-primary` - 主题色（用于等待中状态的动画点）

## 无障碍支持

- 使用语义化的 HTML 结构（`ul` 和 `li`）
- 提供清晰的视觉层次结构
- 支持键盘导航

## 使用场景

Timeline 组件适用于以下场景：

- 项目进度展示
- 历史记录展示
- 订单状态跟踪
- 活动时间轴
- 版本发布历史
- 工作流程展示
- 事件日志

## 注意事项

1. `items` 数据源必须是一个数组
2. 使用 `key` 确保每个时间线项有唯一标识
3. 在 `alternate` 模式下，可以通过 `position` 属性手动指定项的位置
4. 自定义颜色需要提供有效的 CSS 颜色值
5. Vue 中的自定义渲染通过插槽实现，React 中通过 render props 实现
