---
name: tigercat-vue-data
description: Vue data display components usage
---

# Data Components (Vue)

数据展示组件：Table, Timeline, Collapse

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

---

## Collapse 折叠面板

### 基础用法

```vue
<template>
  <Collapse>
    <CollapsePanel panel-key="1" header="Section 1">
      Content of section 1
    </CollapsePanel>
    <CollapsePanel panel-key="2" header="Section 2">
      Content of section 2
    </CollapsePanel>
    <CollapsePanel panel-key="3" header="Section 3">
      Content of section 3
    </CollapsePanel>
  </Collapse>
</template>
```

### 手风琴模式（Accordion）

```vue
<template>
  <Collapse accordion :default-active-key="'1'">
    <CollapsePanel panel-key="1" header="Panel 1">
      Only one panel can be expanded at a time
    </CollapsePanel>
    <CollapsePanel panel-key="2" header="Panel 2">
      Click to expand this panel
    </CollapsePanel>
  </Collapse>
</template>
```

### 受控模式

```vue
<template>
  <Collapse v-model:active-key="activeKeys" @change="handleChange">
    <CollapsePanel panel-key="1" header="Panel 1">
      Content 1
    </CollapsePanel>
    <CollapsePanel panel-key="2" header="Panel 2">
      Content 2
    </CollapsePanel>
  </Collapse>
</template>
<script setup>
import { ref } from 'vue'

const activeKeys = ref(['1'])

const handleChange = (keys) => {
  console.log('Active keys:', keys)
}
</script>
```

### 自定义样式

```vue
<template>
  <!-- 无边框 -->
  <Collapse :bordered="false">
    <CollapsePanel panel-key="1" header="No Border">
      Content without border
    </CollapsePanel>
  </Collapse>

  <!-- Ghost 模式（透明背景） -->
  <Collapse ghost>
    <CollapsePanel panel-key="1" header="Ghost Style">
      Transparent background
    </CollapsePanel>
  </Collapse>

  <!-- 箭头在右侧 -->
  <Collapse expand-icon-position="end">
    <CollapsePanel panel-key="1" header="Arrow on right">
      Content
    </CollapsePanel>
  </Collapse>
</template>
```

### 禁用面板

```vue
<template>
  <Collapse>
    <CollapsePanel panel-key="1" header="Normal Panel">
      This panel can be expanded
    </CollapsePanel>
    <CollapsePanel panel-key="2" header="Disabled Panel" disabled>
      This panel is disabled
    </CollapsePanel>
  </Collapse>
</template>
```

### 自定义标题与额外内容

```vue
<template>
  <Collapse>
    <CollapsePanel panel-key="1">
      <template #header>
        <span class="font-bold text-blue-600">Custom Header</span>
      </template>
      <template #extra>
        <Button size="sm" @click.stop="handleEdit">Edit</Button>
      </template>
      Panel content
    </CollapsePanel>
  </Collapse>
</template>
```

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
