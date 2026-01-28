---
name: tigercat-react-data
description: React data display components - Table, Timeline
---

# Data Display Components (React)

数据展示组件：Table, Timeline

## Table 表格

```tsx
import { Table, Button, Tag } from '@expcat/tigercat-react'

interface DataItem {
  id: number
  name: string
  age: number
  status: 'active' | 'inactive'
}

const data: DataItem[] = [
  { id: 1, name: 'John', age: 28, status: 'active' },
  { id: 2, name: 'Jane', age: 32, status: 'inactive' },
  { id: 3, name: 'Bob', age: 45, status: 'active' }
]

const columns = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100 },
  {
    key: 'status',
    title: 'Status',
    render: (row: DataItem) => (
      <Tag color={row.status === 'active' ? 'green' : 'gray'}>{row.status}</Tag>
    )
  },
  {
    key: 'action',
    title: 'Action',
    render: (row: DataItem) => (
      <Button size="sm" onClick={() => handleEdit(row)}>
        Edit
      </Button>
    )
  }
]

function App() {
  return <Table columns={columns} data={data} rowKey="id" onRowClick={handleRowClick} />
}
```

### Sortable & Filterable

```tsx
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

<Table columns={columns} data={data} rowKey="id" />
```

### Selection

```tsx
import { useState } from 'react'

function App() {
  const [selectedRows, setSelectedRows] = useState<DataItem[]>([])

  return (
    <Table
      columns={columns}
      data={data}
      rowKey="id"
      selectable
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
    />
  )
}
```

### Expandable Rows

```tsx
<Table
  columns={columns}
  data={data}
  rowKey="id"
  expandable
  expandedRowRender={(row) => (
    <div className="p-4">
      <p>Details for {row.name}</p>
    </div>
  )}
/>
```

**Props:**

| Prop              | Type                             | Default     | Description |
| ----------------- | -------------------------------- | ----------- | ----------- |
| columns           | `TableColumn[]`                  | `[]`        | 列配置      |
| data              | `T[]`                            | `[]`        | 数据源      |
| rowKey            | `string \| ((row: T) => string)` | -           | 行唯一键    |
| loading           | `boolean`                        | `false`     | 加载状态    |
| selectable        | `boolean`                        | `false`     | 可选择      |
| selectedRows      | `T[]`                            | `[]`        | 选中行      |
| expandable        | `boolean`                        | `false`     | 可展开      |
| expandedRowRender | `(row: T) => ReactNode`          | -           | 展开行渲染  |
| bordered          | `boolean`                        | `false`     | 显示边框    |
| stripe            | `boolean`                        | `false`     | 斑马纹      |
| emptyText         | `string`                         | `'No Data'` | 空数据文案  |

**Column Props:**

| Prop     | Type                                   | Description |
| -------- | -------------------------------------- | ----------- |
| key      | `string`                               | 字段名      |
| title    | `string`                               | 列标题      |
| width    | `number \| string`                     | 列宽        |
| align    | `'left' \| 'center' \| 'right'`        | 对齐方式    |
| sortable | `boolean`                              | 可排序      |
| filters  | `{ label: string, value: any }[]`      | 筛选项      |
| onFilter | `(value: any, row: T) => boolean`      | 筛选函数    |
| render   | `(row: T, index: number) => ReactNode` | 自定义渲染  |
| fixed    | `'left' \| 'right'`                    | 固定列      |

**Callbacks:** `onRowClick(row, index)`, `onSortChange({ key, order })`, `onFilterChange({ key, value })`, `onSelectedRowsChange(rows)`

---

## Timeline 时间线

```tsx
import { Timeline } from '@expcat/tigercat-react'

const items = [
  { content: 'Create project', time: '2024-01-01' },
  { content: 'First commit', time: '2024-01-02', color: 'green' },
  { content: 'Release v1.0', time: '2024-01-15', color: 'blue' }
]

function App() {
  return <Timeline items={items} />
}
```

### Custom Node

```tsx
<Timeline>
  <Timeline.Item dot={<span className="text-green-500">✓</span>}>
    <p>Step 1: Project created</p>
    <p className="text-sm text-gray-500">2024-01-01</p>
  </Timeline.Item>
  <Timeline.Item color="blue">
    <p>Step 2: Development</p>
  </Timeline.Item>
  <Timeline.Item color="red">
    <p>Step 3: Testing</p>
  </Timeline.Item>
</Timeline>
```

### Alternate Layout

```tsx
<Timeline items={items} mode="alternate" />
<Timeline items={items} mode="right" />
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
| dot     | `ReactNode`                                      | -        | 自定义节点  |
