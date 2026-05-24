---
name: tigercat-vue-data
description: Vue data display components usage
---

# Data Components (Vue)

数据展示组件：Collapse, Table, Timeline, Carousel, Descriptions

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

---

## Collapse 折叠面板

### 基础用法

```vue
<template>
  <Collapse>
    <CollapsePanel panel-key="1" header="Section 1"> Content of section 1 </CollapsePanel>
    <CollapsePanel panel-key="2" header="Section 2"> Content of section 2 </CollapsePanel>
    <CollapsePanel panel-key="3" header="Section 3"> Content of section 3 </CollapsePanel>
  </Collapse>
</template>
```

### 受控与自定义标题

```vue
<template>
  <Collapse v-model:active-key="activeKeys" @change="handleChange">
    <CollapsePanel panel-key="1">
      <template #header>
        <span class="font-bold text-blue-600">Custom Header</span>
      </template>
      <template #extra>
        <Button size="sm" @click.stop="handleEdit">Edit</Button>
      </template>
      Panel content
    </CollapsePanel>
    <CollapsePanel panel-key="2" header="Disabled" disabled>Disabled content</CollapsePanel>
  </Collapse>
</template>
<script setup>
import { ref } from 'vue'

const activeKeys = ref(['1'])
const handleChange = (keys) => console.log(keys)
</script>
```

---

## Table 表格

### 基础用法

```vue
<template>
  <Table :columns="columns" :dataSource="tableData" :pagination="false" />
  <Table :columns="columns" :dataSource="tableData" responsive-mode="card" />
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

### 选择、分页、渲染与导出

```vue
<template>
  <Table
    :columns="columns"
    :dataSource="tableData"
    :rowSelection="{
      selectedRowKeys,
      type: 'checkbox'
    }"
    :pagination="{ current: 1, pageSize: 10 }"
    @selection-change="handleSelect"
    @page-change="handlePage" />
</template>
<script setup>
import { ref, h } from 'vue'
import { exportTableToCsv } from '@expcat/tigercat-core/utils/table-export'

const selectedRowKeys = ref([])
const handleSelect = (keys) => (selectedRowKeys.value = keys)
const handlePage = ({ current, pageSize }) => console.log(current, pageSize)
const columns = [
  { key: 'name', title: 'Name' },
  {
    key: 'status',
    title: 'Status',
    render: (record) =>
      h(
        'span',
        {
          class: record.status === 'active' ? 'text-green-600' : 'text-gray-400'
        },
        record.status
      )
  },
  {
    key: 'action',
    title: 'Action',
    render: (record) => h(Button, { size: 'sm', onClick: () => edit(record) }, () => 'Edit')
  }
]
const csv = exportTableToCsv(columns, tableData)
</script>
```

---

## Timeline 时间轴

### 基础用法

```vue
<template>
  <!-- 通过 items 数据驱动 -->
  <Timeline
    :items="[
      { key: 1, label: '2024-01-01', content: 'Created', color: '#10b981' },
      { key: 2, label: '2024-01-02', content: 'Processing', color: '#3b82f6' },
      { key: 3, label: '2024-01-03', content: 'Pending' }
    ]" />
</template>
```

### 自定义渲染与等待状态

```vue
<template>
  <Timeline :items="items" mode="alternate" pending>
    <template #dot="{ item }"><div class="w-4 h-4 bg-green-500 rounded-full" /></template>
    <template #item="{ item, index }">
      <div class="font-medium">{{ item.label }}</div>
      <div class="text-gray-600">{{ item.content }}</div>
    </template>
    <template #pending><span>正在处理...</span></template>
  </Timeline>
</template>
```

---

## Carousel 轮播图

### 基础用法

```vue
<template>
  <Carousel>
    <div class="h-48 bg-blue-500 flex items-center justify-center text-white text-2xl">Slide 1</div>
    <div class="h-48 bg-green-500 flex items-center justify-center text-white text-2xl">
      Slide 2
    </div>
    <div class="h-48 bg-red-500 flex items-center justify-center text-white text-2xl">Slide 3</div>
  </Carousel>
</template>
```

### 自动播放、事件与 ref

```vue
<template>
  <Carousel
    ref="carouselRef"
    arrows
    autoplay
    :autoplay-speed="3000"
    pause-on-hover
    @change="handleChange">
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
    <div class="h-48 bg-red-500">Slide 3</div>
  </Carousel>
  <Space>
    <Button @click="carouselRef?.prev()">Prev</Button>
    <Button @click="carouselRef?.next()">Next</Button>
    <Button @click="carouselRef?.goTo(0)">Go to First</Button>
  </Space>
</template>
<script setup>
import { ref } from 'vue'

const carouselRef = ref()
const handleChange = (current, prev) => console.log(current, prev)
</script>
```

---

## Descriptions 描述列表

### 基础用法

```vue
<template>
  <Descriptions title="用户信息" :items="items" />
</template>
<script setup>
const items = [
  { label: '姓名', content: '张三' },
  { label: '电话', content: '1234567890' },
  { label: '邮箱', content: 'zhangsan@example.com' }
]
</script>
```

### Extra 插槽 + 跨列 + 无冒号

```vue
<template>
  <Descriptions title="订单" bordered :column="3" :colon="false" :items="orderItems">
    <template #extra><Button size="sm">编辑</Button></template>
  </Descriptions>
  <Descriptions
    bordered
    :column="2"
    :items="items"
    :labelStyle="{ fontWeight: '600' }"
    :contentStyle="{ color: '#6b7280' }" />
</template>
<script setup>
const items = [
  {
    label: '高亮',
    content: '重要信息',
    labelClassName: 'text-red-600',
    contentClassName: 'font-bold'
  }
]
</script>
```

---

## Calendar 日历

```vue
<template>
  <Calendar v-model="date" />
  <Calendar v-model="date" mode="month" :date-cell-render="renderDateCell" />
</template>
```
