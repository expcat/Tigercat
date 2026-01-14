# Table 表格

数据表格组件，支持排序、筛选、分页、行选择、自定义列渲染等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const dataSource = ref([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
])

const columns = [
  { key: 'name', title: 'Name', width: 200 },
  { key: 'age', title: 'Age', width: 100 },
  { key: 'email', title: 'Email' }
]
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" />
</template>
```

### React

```tsx
import { Table } from '@tigercat/react'

function App() {
  const dataSource = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
  ]

  const columns = [
    { key: 'name', title: 'Name', width: 200 },
    { key: 'age', title: 'Age', width: 100 },
    { key: 'email', title: 'Email' }
  ]

  return <Table columns={columns} dataSource={dataSource} />
}
```

## 受控与非受控（Controlled / Uncontrolled）

Table 的排序/筛选/分页/行选择都支持“受控/非受控”两种模式：

- 排序：`sort`（受控） / `defaultSort`（非受控初始值）
- 筛选：`filters`（受控） / `defaultFilters`（非受控初始值）
- 分页：
  - `pagination.current` / `pagination.pageSize` 传入即视为受控
  - 不传 `current/pageSize` 时，可用 `pagination.defaultCurrent/defaultPageSize` 作为非受控初始值
- 行选择：
  - `rowSelection.selectedRowKeys` 传入即视为受控
  - 不传 `selectedRowKeys` 时，可用 `rowSelection.defaultSelectedRowKeys` 作为非受控初始值

### React（受控分页示例）

```tsx
import React, { useState } from 'react'
import { Table, type SortState } from '@tigercat/react'

export function App() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [sort, setSort] = useState<SortState>({ key: null, direction: null })

  return (
    <Table
      columns={[{ key: 'name', title: 'Name', sortable: true }]}
      dataSource={[{ id: 1, name: 'John' }]}
      sort={sort}
      pagination={{ ...pagination, showSizeChanger: true, showTotal: true }}
      onSortChange={setSort}
      onPageChange={setPagination}
    />
  )
}
```

### Vue 3（受控分页示例）

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Table, type SortState } from '@tigercat/vue'

const pagination = ref({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: true
})
const sort = ref<SortState>({ key: null, direction: null })

function handlePageChange(next: { current: number; pageSize: number }) {
  pagination.value = { ...pagination.value, ...next }
}

function handleSortChange(next: SortState) {
  sort.value = next
}
</script>

<template>
  <Table
    :columns="[{ key: 'name', title: 'Name', sortable: true }]"
    :dataSource="[{ id: 1, name: 'John' }]"
    :sort="sort"
    :pagination="pagination"
    @sort-change="handleSortChange"
    @page-change="handlePageChange" />
</template>
```

## 尺寸 (Sizes)

Table 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <Table :columns="columns" :dataSource="dataSource" size="sm" />
  <Table :columns="columns" :dataSource="dataSource" size="md" />
  <Table :columns="columns" :dataSource="dataSource" size="lg" />
</template>
```

### React

```tsx
<Table columns={columns} dataSource={dataSource} size="sm" />
<Table columns={columns} dataSource={dataSource} size="md" />
<Table columns={columns} dataSource={dataSource} size="lg" />
```

## 边框和条纹 (Border & Striped)

### Vue 3

```vue
<template>
  <!-- 带边框 -->
  <Table :columns="columns" :dataSource="dataSource" bordered />

  <!-- 条纹行 -->
  <Table :columns="columns" :dataSource="dataSource" striped />

  <!-- 边框 + 条纹 -->
  <Table :columns="columns" :dataSource="dataSource" bordered striped />
</template>
```

### React

```tsx
{
  /* 带边框 */
}
;<Table columns={columns} dataSource={dataSource} bordered />

{
  /* 条纹行 */
}
;<Table columns={columns} dataSource={dataSource} striped />

{
  /* 边框 + 条纹 */
}
;<Table columns={columns} dataSource={dataSource} bordered striped />
```

## 排序 (Sorting)

通过设置列的 `sortable` 属性启用排序功能。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const columns = [
  {
    key: 'name',
    title: 'Name',
    sortable: true
  },
  {
    key: 'age',
    title: 'Age',
    sortable: true,
    // 自定义排序函数
    sortFn: (a, b) => a - b
  },
  { key: 'email', title: 'Email' }
]

const dataSource = ref([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
])

function handleSortChange(sortState) {
  console.log('Sort changed:', sortState)
}
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" @sort-change="handleSortChange" />
</template>
```

### React

```tsx
import { Table } from '@tigercat/react'

function App() {
  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true
    },
    {
      key: 'age',
      title: 'Age',
      sortable: true,
      // 自定义排序函数
      sortFn: (a, b) => a - b
    },
    { key: 'email', title: 'Email' }
  ]

  const dataSource = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
  ]

  const handleSortChange = (sortState) => {
    console.log('Sort changed:', sortState)
  }

  return <Table columns={columns} dataSource={dataSource} onSortChange={handleSortChange} />
}
```

## 筛选 (Filtering)

通过设置列的 `filter` 属性启用筛选功能。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const columns = [
  {
    key: 'name',
    title: 'Name',
    filter: {
      type: 'text',
      placeholder: 'Search name...'
    }
  },
  {
    key: 'status',
    title: 'Status',
    filter: {
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  },
  { key: 'email', title: 'Email' }
]

const dataSource = ref([
  { id: 1, name: 'John Doe', status: 'active', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', status: 'inactive', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', status: 'active', email: 'bob@example.com' }
])

function handleFilterChange(filters) {
  console.log('Filters changed:', filters)
}
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" @filter-change="handleFilterChange" />
</template>
```

### React

```tsx
import { Table } from '@tigercat/react'

function App() {
  const columns = [
    {
      key: 'name',
      title: 'Name',
      filter: {
        type: 'text',
        placeholder: 'Search name...'
      }
    },
    {
      key: 'status',
      title: 'Status',
      filter: {
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    },
    { key: 'email', title: 'Email' }
  ]

  const dataSource = [
    { id: 1, name: 'John Doe', status: 'active', email: 'john@example.com' },
    {
      id: 2,
      name: 'Jane Smith',
      status: 'inactive',
      email: 'jane@example.com'
    },
    { id: 3, name: 'Bob Johnson', status: 'active', email: 'bob@example.com' }
  ]

  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters)
  }

  return <Table columns={columns} dataSource={dataSource} onFilterChange={handleFilterChange} />
}
```

## 分页 (Pagination)

Table 组件默认开启分页功能，每页显示 10 条数据。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'email', title: 'Email' }
]

const dataSource = ref([
  // ... 大量数据
])

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: dataSource.value.length,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showTotal: true
})

function handlePageChange({ current, pageSize }) {
  console.log('Page changed:', current, pageSize)
}
</script>

<template>
  <!-- 自定义分页配置 -->
  <Table
    :columns="columns"
    :dataSource="dataSource"
    :pagination="pagination"
    @page-change="handlePageChange" />

  <!-- 禁用分页 -->
  <Table :columns="columns" :dataSource="dataSource" :pagination="false" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Table } from '@tigercat/react'

function App() {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    { key: 'email', title: 'Email' }
  ]

  const dataSource = [
    // ... 大量数据
  ]

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: dataSource.length,
    pageSizeOptions: [10, 20, 50, 100],
    showSizeChanger: true,
    showTotal: true
  })

  const handlePageChange = ({ current, pageSize }) => {
    console.log('Page changed:', current, pageSize)
  }

  return (
    <>
      {/* 自定义分页配置 */}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {/* 禁用分页 */}
      <Table columns={columns} dataSource={dataSource} pagination={false} />
    </>
  )
}
```

## 行选择 (Row Selection)

启用行选择功能可以选择表格中的一行或多行。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'email', title: 'Email' }
]

const dataSource = ref([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
])

const rowSelection = ref({
  selectedRowKeys: [],
  type: 'checkbox', // 'checkbox' | 'radio'
  showCheckbox: true,
  getRowKey: (record) => record.id
})

function handleSelectionChange(selectedKeys) {
  console.log('Selected rows:', selectedKeys)
}
</script>

<template>
  <Table
    :columns="columns"
    :dataSource="dataSource"
    :rowSelection="rowSelection"
    @selection-change="handleSelectionChange" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Table } from '@tigercat/react'

function App() {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    { key: 'email', title: 'Email' }
  ]

  const dataSource = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
  ]

  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const rowSelection = {
    selectedRowKeys,
    type: 'checkbox', // 'checkbox' | 'radio'
    showCheckbox: true,
    getRowKey: (record) => record.id
  }

  const handleSelectionChange = (selectedKeys) => {
    console.log('Selected rows:', selectedKeys)
    setSelectedRowKeys(selectedKeys)
  }

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowSelection={rowSelection}
      onSelectionChange={handleSelectionChange}
    />
  )
}
```

## 自定义列渲染 (Custom Column Rendering)

通过 `render` 函数自定义单元格内容。

### Vue 3

```vue
<script setup>
import { ref, h } from 'vue'
import { Table, Button } from '@tigercat/vue'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  {
    key: 'status',
    title: 'Status',
    render: (record) => {
      const color = record.status === 'active' ? 'text-green-600' : 'text-red-600'
      return h('span', { class: color }, record.status)
    }
  },
  {
    key: 'actions',
    title: 'Actions',
    align: 'center',
    render: (record) => {
      return h(
        Button,
        {
          size: 'sm',
          onClick: () => handleEdit(record)
        },
        () => 'Edit'
      )
    }
  }
]

const dataSource = ref([
  { id: 1, name: 'John Doe', age: 28, status: 'active' },
  { id: 2, name: 'Jane Smith', age: 32, status: 'inactive' },
  { id: 3, name: 'Bob Johnson', age: 45, status: 'active' }
])

function handleEdit(record) {
  console.log('Edit:', record)
}
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" />
</template>
```

### React

```tsx
import { Table, Button } from '@tigercat/react'

function App() {
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    {
      key: 'status',
      title: 'Status',
      render: (record) => {
        const color = record.status === 'active' ? 'text-green-600' : 'text-red-600'
        return <span className={color}>{record.status}</span>
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      align: 'center',
      render: (record) => (
        <Button size="sm" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      )
    }
  ]

  const dataSource = [
    { id: 1, name: 'John Doe', age: 28, status: 'active' },
    { id: 2, name: 'Jane Smith', age: 32, status: 'inactive' },
    { id: 3, name: 'Bob Johnson', age: 45, status: 'active' }
  ]

  const handleEdit = (record) => {
    console.log('Edit:', record)
  }

  return <Table columns={columns} dataSource={dataSource} />
}
```

## 固定表头和滚动 (Sticky Header & Scrolling)

### Vue 3

```vue
<template>
  <!-- 固定表头 + 最大高度 -->
  <Table :columns="columns" :dataSource="dataSource" stickyHeader :maxHeight="400" />
</template>
```

### React

```tsx
{
  /* 固定表头 + 最大高度 */
}
;<Table columns={columns} dataSource={dataSource} stickyHeader maxHeight={400} />
```

## 固定列（锁定列）(Fixed Columns)

通过给列设置 `fixed: 'left' | 'right'` 可实现左右滚动时固定列不动。

注意：为了正确计算固定列的偏移，建议为固定列（以及与其相邻的列）提供明确的 `width`（number 或 px 字符串）。

### 表头锁按钮

当开启 `columnLockable` 时，表头会显示一个小锁按钮。点击后会在“未锁定”与“锁定到左侧”之间切换（等价于切换该列的 `fixed` 状态）。

### Vue 3

```vue
<script setup>
import { ref, h } from 'vue'
import { Table } from '@tigercat/vue'

const dataSource = ref([
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' }
])

const columns = [
  { key: 'name', title: 'Name', width: 160, fixed: 'left' },
  { key: 'age', title: 'Age', width: 120 },
  { key: 'email', title: 'Email', width: 240 },
  {
    key: 'actions',
    title: 'Actions',
    width: 160,
    fixed: 'right',
    render: (record) => h('span', {}, 'Edit')
  }
]
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" :pagination="false" />
</template>
```

### React

```tsx
import { Table } from '@tigercat/react'

function App() {
  const dataSource = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' }
  ]

  const columns = [
    { key: 'name', title: 'Name', width: 160, fixed: 'left' },
    { key: 'age', title: 'Age', width: 120 },
    { key: 'email', title: 'Email', width: 240 },
    {
      key: 'actions',
      title: 'Actions',
      width: 160,
      fixed: 'right',
      render: () => 'Edit'
    }
  ]

  return <Table columns={columns} dataSource={dataSource} pagination={false} />
}
```

## 加载状态 (Loading)

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Table } from '@tigercat/vue'

const loading = ref(true)

// 模拟数据加载
setTimeout(() => {
  loading.value = false
}, 2000)
</script>

<template>
  <Table :columns="columns" :dataSource="dataSource" :loading="loading" />
</template>
```

### React

```tsx
import { useState, useEffect } from 'react'
import { Table } from '@tigercat/react'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }, [])

  return <Table columns={columns} dataSource={dataSource} loading={loading} />
}
```

## API

### Table Props

| 属性             | 说明                                                         | 类型                                               | 默认值      |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------- | ----------- |
| `columns`        | 表格列配置                                                   | `TableColumn[]`                                    | -           |
| `dataSource`     | 数据源                                                       | `T[]`                                              | `[]`        |
| `size`           | 表格尺寸                                                     | `'sm' \| 'md' \| 'lg'`                             | `'md'`      |
| `bordered`       | 是否显示边框                                                 | `boolean`                                          | `false`     |
| `striped`        | 是否显示条纹行                                               | `boolean`                                          | `false`     |
| `hoverable`      | 是否高亮悬停行                                               | `boolean`                                          | `true`      |
| `columnLockable` | 是否显示表头锁按钮（点击后切换该列 `fixed`，默认锁定到左侧） | `boolean`                                          | `false`     |
| `loading`        | 加载状态                                                     | `boolean`                                          | `false`     |
| `emptyText`      | 空状态文本                                                   | `string`                                           | `'No data'` |
| `pagination`     | 分页配置，设为 `false` 禁用                                  | `PaginationConfig \| false`                        | 默认配置    |
| `rowSelection`   | 行选择配置                                                   | `RowSelectionConfig`                               | -           |
| `rowKey`         | 行键名或函数                                                 | `string \| ((record: T) => string \| number)`      | `'id'`      |
| `rowClassName`   | 自定义行类名                                                 | `string \| ((record: T, index: number) => string)` | -           |
| `stickyHeader`   | 固定表头                                                     | `boolean`                                          | `false`     |
| `maxHeight`      | 最大高度（触发滚动）                                         | `string \| number`                                 | -           |

### TableColumn

| 属性              | 说明                       | 类型                                      | 默认值   |
| ----------------- | -------------------------- | ----------------------------------------- | -------- |
| `key`             | 列键名（唯一）             | `string`                                  | -        |
| `title`           | 列标题                     | `string`                                  | -        |
| `dataKey`         | 数据键名（默认使用 `key`） | `string`                                  | -        |
| `width`           | 列宽                       | `string \| number`                        | -        |
| `align`           | 对齐方式                   | `'left' \| 'center' \| 'right'`           | `'left'` |
| `sortable`        | 是否可排序                 | `boolean`                                 | `false`  |
| `sortFn`          | 自定义排序函数             | `(a: unknown, b: unknown) => number`      | -        |
| `filter`          | 筛选配置                   | `ColumnFilter`                            | -        |
| `fixed`           | 固定列（锁定列）           | `'left' \| 'right' \| false`              | `false`  |
| `render`          | 自定义渲染函数             | `(record: T, index: number) => ReactNode` | -        |
| `renderHeader`    | 自定义表头渲染函数         | `() => ReactNode`                         | -        |
| `className`       | 单元格类名                 | `string`                                  | -        |
| `headerClassName` | 表头单元格类名             | `string`                                  | -        |

### PaginationConfig

| 属性              | 说明                   | 类型                                                 | 默认值              |
| ----------------- | ---------------------- | ---------------------------------------------------- | ------------------- |
| `current`         | 当前页码               | `number`                                             | `1`                 |
| `pageSize`        | 每页条数               | `number`                                             | `10`                |
| `total`           | 总条数                 | `number`                                             | -                   |
| `pageSizeOptions` | 每页条数选项           | `number[]`                                           | `[10, 20, 50, 100]` |
| `showSizeChanger` | 是否显示每页条数选择器 | `boolean`                                            | `true`              |
| `showTotal`       | 是否显示总条数         | `boolean`                                            | `true`              |
| `totalText`       | 自定义总条数文本       | `(total: number, range: [number, number]) => string` | -                   |

### RowSelectionConfig

| 属性               | 说明           | 类型                                    | 默认值                  |
| ------------------ | -------------- | --------------------------------------- | ----------------------- |
| `selectedRowKeys`  | 已选择的行键   | `(string \| number)[]`                  | -                       |
| `type`             | 选择类型       | `'checkbox' \| 'radio'`                 | `'checkbox'`            |
| `showCheckbox`     | 是否显示选择框 | `boolean`                               | `true`                  |
| `getRowKey`        | 获取行键函数   | `(record: T) => string \| number`       | `(record) => record.id` |
| `getCheckboxProps` | 获取选择框属性 | `(record: T) => { disabled?: boolean }` | -                       |

### Events (Vue)

| 事件名             | 说明                         | 回调参数                        |
| ------------------ | ---------------------------- | ------------------------------- |
| `change`           | 表格变化（排序、筛选、分页） | `{ sort, filters, pagination }` |
| `row-click`        | 行点击事件                   | `(record, index)`               |
| `selection-change` | 选择变化                     | `selectedKeys`                  |
| `sort-change`      | 排序变化                     | `sortState`                     |
| `filter-change`    | 筛选变化                     | `filters`                       |
| `page-change`      | 分页变化                     | `{ current, pageSize }`         |

### Event Handlers (React)

| 属性                | 说明                         | 类型                                                    |
| ------------------- | ---------------------------- | ------------------------------------------------------- |
| `onChange`          | 表格变化（排序、筛选、分页） | `(params: { sort, filters, pagination }) => void`       |
| `onRowClick`        | 行点击事件                   | `(record: T, index: number) => void`                    |
| `onSelectionChange` | 选择变化                     | `(selectedKeys: (string \| number)[]) => void`          |
| `onSortChange`      | 排序变化                     | `(sort: SortState) => void`                             |
| `onFilterChange`    | 筛选变化                     | `(filters: Record<string, unknown>) => void`            |
| `onPageChange`      | 分页变化                     | `(page: { current: number; pageSize: number }) => void` |

## 主题定制

Table 组件使用 Tailwind CSS 类，可以通过覆盖相应的类来自定义样式。主要支持以下 CSS 变量：

- `--tiger-primary` - 主题色（用于选中状态、排序图标等）

## 无障碍支持

- 表格使用语义化的 `<table>` 标签
- 可排序表头会自动设置 `aria-sort`（`none/ascending/descending`）
- 加载中会在容器上设置 `aria-busy`，并提供 `role="status"` 的 Loading 语义
- 空态文案使用 `role="status"` + `aria-live="polite"`，便于辅助技术感知状态变化
- 选择框具有正确的 ARIA 属性
- 固定表头时保持合理的滚动体验

## 注意事项

1. 数据源 `dataSource` 必须是一个数组
2. 列配置 `columns` 中的 `key` 必须唯一
3. 使用 `rowKey` 确保每行有唯一标识，默认使用 `id` 字段
4. 自定义渲染函数 `render` 在 Vue 中返回 VNode，在 React 中返回 ReactNode
5. 分页、排序、筛选都是前端处理，如需后端处理，请监听相关事件并自行实现
6. 固定表头时，建议设置 `maxHeight` 以触发滚动
