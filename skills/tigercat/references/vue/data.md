---
name: tigercat-vue-data
description: Vue 3 data display components - Table, Timeline
---

# Data Display Components (Vue 3)

数据展示组件：Table, Timeline

## Table 表格

```vue
<script setup>
import { ref, h } from 'vue'
import { Table, Button, Tag } from '@expcat/tigercat-vue'

const data = ref([
  { id: 1, name: 'John', age: 28, status: 'active' },
  { id: 2, name: 'Jane', age: 32, status: 'inactive' },
  { id: 3, name: 'Bob', age: 45, status: 'active' }
])

const columns = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  {
    key: 'status',
    title: 'Status',
    render: (row) => h(Tag, { color: row.status === 'active' ? 'green' : 'gray' }, row.status)
  },
  {
    key: 'action',
    title: 'Action',
    render: (row) => h(Button, { size: 'sm', onClick: () => handleEdit(row) }, 'Edit')
  }
]

const handleRowClick = (row) => {
  console.log('Row clicked:', row)
}
</script>

<template>
  <Table :columns="columns" :data="data" row-key="id" @row-click="handleRowClick" />
</template>
```

### Sortable & Filterable

```vue
<script setup>
const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true },
  {
    key: 'status',
    title: 'Status',
    filters: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ],
    onFilter: (value, row) => row.status === value
  }
]
</script>

<template>
  <Table :columns="columns" :data="data" row-key="id" />
</template>
```

### Selection

```vue
<script setup>
import { ref } from 'vue'

const selectedRows = ref([])
</script>

<template>
  <Table
    :columns="columns"
    :data="data"
    row-key="id"
    selectable
    v-model:selected-rows="selectedRows" />
</template>
```

### Expandable Rows

```vue
<template>
  <Table :columns="columns" :data="data" row-key="id" expandable>
    <template #expand="{ row }">
      <div class="p-4">
        <p>Details for {{ row.name }}</p>
      </div>
    </template>
  </Table>
</template>
```

**Props:**

| Prop         | Type                          | Default     | Description      |
| ------------ | ----------------------------- | ----------- | ---------------- |
| columns      | `TableColumn[]`               | `[]`        | 列配置           |
| data         | `any[]`                       | `[]`        | 数据源           |
| rowKey       | `string \| ((row) => string)` | -           | 行唯一键         |
| loading      | `boolean`                     | `false`     | 加载状态         |
| selectable   | `boolean`                     | `false`     | 可选择           |
| selectedRows | `any[]`                       | `[]`        | 选中行 (v-model) |
| expandable   | `boolean`                     | `false`     | 可展开           |
| bordered     | `boolean`                     | `false`     | 显示边框         |
| stripe       | `boolean`                     | `false`     | 斑马纹           |
| emptyText    | `string`                      | `'No Data'` | 空数据文案       |

**Column Props:**

| Prop     | Type                              | Description |
| -------- | --------------------------------- | ----------- |
| key      | `string`                          | 字段名      |
| title    | `string`                          | 列标题      |
| width    | `number \| string`                | 列宽        |
| align    | `'left' \| 'center' \| 'right'`   | 对齐方式    |
| sortable | `boolean`                         | 可排序      |
| filters  | `{ label: string, value: any }[]` | 筛选项      |
| onFilter | `(value, row) => boolean`         | 筛选函数    |
| render   | `(row, index) => VNode`           | 自定义渲染  |
| fixed    | `'left' \| 'right'`               | 固定列      |

**Events:** `@row-click(row, index)`, `@sort-change({ key, order })`, `@filter-change({ key, value })`

**Slots:** `expand` (scoped: `{ row, index }`)

---

## Timeline 时间线

```vue
<script setup>
import { Timeline } from '@expcat/tigercat-vue'

const items = [
  { content: 'Create project', time: '2024-01-01' },
  { content: 'First commit', time: '2024-01-02', color: 'green' },
  { content: 'Release v1.0', time: '2024-01-15', color: 'blue' }
]
</script>

<template>
  <Timeline :items="items" />
</template>
```

### Custom Node

```vue
<template>
  <Timeline>
    <Timeline.Item>
      <template #dot>
        <span class="text-green-500">✓</span>
      </template>
      <p>Step 1: Project created</p>
      <p class="text-sm text-gray-500">2024-01-01</p>
    </Timeline.Item>
    <Timeline.Item color="blue">
      <p>Step 2: Development</p>
    </Timeline.Item>
    <Timeline.Item color="red">
      <p>Step 3: Testing</p>
    </Timeline.Item>
  </Timeline>
</template>
```

### Alternate Layout

```vue
<template>
  <Timeline :items="items" mode="alternate" />
  <Timeline :items="items" mode="right" />
</template>
```

**Props:**

| Prop    | Type                               | Default  | Description      |
| ------- | ---------------------------------- | -------- | ---------------- |
| items   | `TimelineItem[]`                   | `[]`     | 时间线数据       |
| mode    | `'left' \| 'right' \| 'alternate'` | `'left'` | 布局模式         |
| pending | `boolean \| string`                | `false`  | 最后一项为进行中 |

**TimelineItem Props:**

| Prop    | Type                                             | Default  | Description |
| ------- | ------------------------------------------------ | -------- | ----------- |
| content | `string`                                         | -        | 内容        |
| time    | `string`                                         | -        | 时间        |
| color   | `'blue' \| 'green' \| 'red' \| 'gray' \| string` | `'blue'` | 节点颜色    |

**Slots (Timeline.Item):** `default`, `dot`
