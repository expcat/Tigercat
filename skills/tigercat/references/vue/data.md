---
name: tigercat-vue-data
description: Vue data display components usage
---

# Data Components (Vue)

数据展示组件：Table, Timeline

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

---

## Table 表格

### 基础用法

```vue
<template>
  <Table :columns="columns" :data="tableData" row-key="id" />
</template>
<script setup>
const columns = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100, sortable: true },
  { key: 'email', title: 'Email' }
]
const tableData = [
  { id: 1, name: 'John', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane', age: 32, email: 'jane@example.com' }
]
</script>
```

### 可选择、分页、自定义渲染

```vue
<template>
  <Table
    :columns="columns"
    :data="tableData"
    row-key="id"
    v-model:selected-keys="selectedKeys"
    selectable
    :pagination="{ current: 1, pageSize: 10, total: 100 }"
    @page-change="onPageChange"
  />
</template>
<script setup>
const selectedKeys = ref([])
const columns = [
  { key: 'name', title: 'Name' },
  { key: 'status', title: 'Status', render: (row) => h(Badge, { color: row.status === 'active' ? 'green' : 'gray' }, row.status) },
  { key: 'action', title: 'Action', render: (row) => h(Button, { size: 'sm', onClick: () => edit(row) }, 'Edit') }
]
</script>
```

---

## Timeline 时间轴

```vue
<template>
  <Timeline>
    <TimelineItem color="green">Created 2024-01-01</TimelineItem>
    <TimelineItem color="blue">Processing 2024-01-02</TimelineItem>
    <TimelineItem color="gray">Pending 2024-01-03</TimelineItem>
  </Timeline>
  
  <Timeline :items="[
    { content: 'Created', time: '2024-01-01', color: 'green' },
    { content: 'Updated', time: '2024-01-02', color: 'blue' }
  ]" />
</template>
```
