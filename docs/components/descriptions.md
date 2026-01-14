# Descriptions 描述列表

用于展示结构化数据、详情信息的描述列表组件，支持多种布局和样式。

## 基本用法

### Vue 3

```vue
<script setup>
import { Descriptions } from '@tigercat/vue'

const items = [
  { label: 'Name', content: 'John Doe' },
  { label: 'Email', content: 'john.doe@example.com' },
  { label: 'Phone', content: '+1 234 567 8900' },
  { label: 'Address', content: '123 Main Street, City, Country' }
]
</script>

<template>
  <Descriptions title="User Information" :items="items" />
</template>
```

### React

```tsx
import { Descriptions } from '@tigercat/react'

function App() {
  const items = [
    { label: 'Name', content: 'John Doe' },
    { label: 'Email', content: 'john.doe@example.com' },
    { label: 'Phone', content: '+1 234 567 8900' },
    { label: 'Address', content: '123 Main Street, City, Country' }
  ]

  return <Descriptions title="User Information" items={items} />
}
```

## 带边框的描述列表

使用 `bordered` 属性可以为描述列表添加边框。

### Vue 3

```vue
<template>
  <Descriptions title="Bordered Descriptions" bordered :items="items" />
</template>
```

### React

```tsx
<Descriptions title="Bordered Descriptions" bordered items={items} />
```

## 不同尺寸

Descriptions 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Descriptions size="sm" :items="items" />
  <Descriptions size="md" :items="items" />
  <Descriptions size="lg" :items="items" />
</template>
```

### React

```tsx
<Descriptions size="sm" items={items} />
<Descriptions size="md" items={items} />
<Descriptions size="lg" items={items} />
```

## 垂直布局

使用 `layout="vertical"` 可以将描述列表设置为垂直布局，标签和内容上下排列。

### Vue 3

```vue
<template>
  <Descriptions layout="vertical" :items="items" />
</template>
```

### React

```tsx
<Descriptions layout="vertical" items={items} />
```

## 自定义列数

通过 `column` 属性可以设置每行显示的列数，默认为 3。

### Vue 3

```vue
<template>
  <Descriptions :column="2" :items="items" />
  <Descriptions :column="4" :items="items" />
</template>
```

### React

```tsx
<Descriptions column={2} items={items} />
<Descriptions column={4} items={items} />
```

## 跨列显示

描述项可以通过 `span` 属性实现跨列显示。

### Vue 3

```vue
<script setup>
const items = [
  { label: 'Product', content: 'Cloud Database' },
  { label: 'Billing', content: 'Prepaid' },
  { label: 'Time', content: '2023-01-01' },
  { label: 'Amount', content: '$80.00' },
  {
    label: 'Description',
    content: 'High-performance cloud database service',
    span: 2
  }
]
</script>

<template>
  <Descriptions :items="items" :column="3" />
</template>
```

### React

```tsx
const items = [
  { label: 'Product', content: 'Cloud Database' },
  { label: 'Billing', content: 'Prepaid' },
  { label: 'Time', content: '2023-01-01' },
  { label: 'Amount', content: '$80.00' },
  { label: 'Description', content: 'High-performance cloud database service', span: 2 },
]

<Descriptions items={items} column={3} />
```

## 自定义标题和额外内容

可以通过 `title` 和 `extra` 属性（或插槽）自定义标题和额外内容。

### Vue 3

```vue
<template>
  <Descriptions title="User Information" :items="items">
    <template #extra>
      <a href="#">Edit</a>
    </template>
  </Descriptions>
</template>
```

### React

```tsx
<Descriptions title="User Information" items={items} extra={<a href="#">Edit</a>} />
```

## 自定义样式

可以通过 `labelStyle` 和 `contentStyle` 自定义标签和内容的样式。

### Vue 3

```vue
<template>
  <Descriptions
    :items="items"
    :labelStyle="{ fontWeight: 'bold', color: '#1f2937' }"
    :contentStyle="{ color: '#6b7280' }" />
</template>
```

### React

```tsx
<Descriptions
  items={items}
  labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
  contentStyle={{ color: '#6b7280' }}
/>
```

## 无冒号

通过设置 `colon={false}` 可以隐藏标签后的冒号。

### Vue 3

```vue
<template>
  <Descriptions :colon="false" :items="items" />
</template>
```

### React

```tsx
<Descriptions colon={false} items={items} />
```

## 组合布局示例

### Vue 3

```vue
<script setup>
const userInfo = [
  { label: 'Full Name', content: 'John Doe' },
  { label: 'Email', content: 'john.doe@example.com' },
  { label: 'Phone', content: '+1 234 567 8900' },
  { label: 'Country', content: 'United States' },
  { label: 'City', content: 'New York' },
  { label: 'Zip Code', content: '10001' },
  { label: 'Address', content: '123 Main Street, Apartment 4B', span: 3 }
]
</script>

<template>
  <Descriptions title="User Profile" bordered size="md" :column="3" :items="userInfo">
    <template #extra>
      <a href="#" class="text-blue-600 hover:text-blue-800">Edit Profile</a>
    </template>
  </Descriptions>
</template>
```

### React

```tsx
const userInfo = [
  { label: 'Full Name', content: 'John Doe' },
  { label: 'Email', content: 'john.doe@example.com' },
  { label: 'Phone', content: '+1 234 567 8900' },
  { label: 'Country', content: 'United States' },
  { label: 'City', content: 'New York' },
  { label: 'Zip Code', content: '10001' },
  { label: 'Address', content: '123 Main Street, Apartment 4B', span: 3 },
]

<Descriptions
  title="User Profile"
  bordered
  size="md"
  column={3}
  items={userInfo}
  extra={<a href="#" className="text-blue-600 hover:text-blue-800">Edit Profile</a>}
/>
```

## API

### Props / 属性

| 属性         | 说明                             | 类型                                       | 默认值         |
| ------------ | -------------------------------- | ------------------------------------------ | -------------- |
| title        | 描述列表的标题                   | `string`                                   | -              |
| extra        | 描述列表的操作区域，显示在右上方 | `ReactNode` / `VNode`                      | -              |
| bordered     | 是否展示边框                     | `boolean`                                  | `false`        |
| column       | 一行显示的列数                   | `number`                                   | `3`            |
| size         | 设置列表的大小                   | `'sm' \| 'md' \| 'lg'`                     | `'md'`         |
| layout       | 布局方式                         | `'horizontal' \| 'vertical'`               | `'horizontal'` |
| colon        | 是否在标签后显示冒号             | `boolean`                                  | `true`         |
| labelStyle   | 自定义标签样式                   | `CSSProperties` / `Record<string, string>` | -              |
| contentStyle | 自定义内容样式                   | `CSSProperties` / `Record<string, string>` | -              |
| items        | 描述列表项数据                   | `DescriptionsItem[]`                       | `[]`           |

### DescriptionsItem

| 属性             | 说明           | 类型                             | 默认值 |
| ---------------- | -------------- | -------------------------------- | ------ |
| label            | 标签文本       | `string`                         | -      |
| content          | 内容文本或节点 | `ReactNode` / `VNode` / `string` | -      |
| span             | 跨列数         | `number`                         | `1`    |
| labelClassName   | 标签自定义类名 | `string`                         | -      |
| contentClassName | 内容自定义类名 | `string`                         | -      |

### Slots (Vue only)

| 插槽名  | 说明                                    |
| ------- | --------------------------------------- |
| title   | 自定义标题内容                          |
| extra   | 自定义额外内容                          |
| default | 自定义主体内容（可代替 items 属性使用） |

## 主题定制

Descriptions 组件的默认颜色全部基于 CSS 变量（含 fallback），便于统一主题：

- `--tiger-surface`：容器背景（默认 `#fff`）
- `--tiger-surface-muted`：Label 背景（默认 `#f9fafb`）
- `--tiger-border`：边框色（默认 `#e5e7eb`）
- `--tiger-text`：正文色（默认 `#111827`）
- `--tiger-text-muted`：次要文字色（默认 `#6b7280` / `#374151`）

你也可以继续通过以下方式做更细粒度定制：

1. 使用 `labelStyle` / `contentStyle` 自定义样式
2. 通过 `labelClassName` / `contentClassName` 为每个描述项追加类名

## 使用场景

- 用户信息详情页
- 订单详情展示
- 产品规格参数
- 配置信息展示
- 表单只读预览
- 结构化数据展示

## 无障碍性 (Accessibility)

Descriptions 组件尽量使用语义化 HTML 来确保良好的可访问性：

- 水平布局使用表格结构，标签使用 `<th>` 标签
- 垂直布局在边框模式下也使用表格结构（`<table>` / `<th>` / `<td>`）
- 垂直布局在无边框模式下使用描述列表结构（`<dl>` / `<dt>` / `<dd>`）
