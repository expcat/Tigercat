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
    <CollapsePanel panel-key="1" header="Section 1"> Content of section 1 </CollapsePanel>
    <CollapsePanel panel-key="2" header="Section 2"> Content of section 2 </CollapsePanel>
    <CollapsePanel panel-key="3" header="Section 3"> Content of section 3 </CollapsePanel>
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
    <CollapsePanel panel-key="2" header="Panel 2"> Click to expand this panel </CollapsePanel>
  </Collapse>
</template>
```

### 受控模式

```vue
<template>
  <Collapse v-model:active-key="activeKeys" @change="handleChange">
    <CollapsePanel panel-key="1" header="Panel 1"> Content 1 </CollapsePanel>
    <CollapsePanel panel-key="2" header="Panel 2"> Content 2 </CollapsePanel>
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
    <CollapsePanel panel-key="1" header="No Border"> Content without border </CollapsePanel>
  </Collapse>

  <!-- Ghost 模式（透明背景） -->
  <Collapse ghost>
    <CollapsePanel panel-key="1" header="Ghost Style"> Transparent background </CollapsePanel>
  </Collapse>

  <!-- 箭头在右侧 -->
  <Collapse expand-icon-position="end">
    <CollapsePanel panel-key="1" header="Arrow on right"> Content </CollapsePanel>
  </Collapse>
</template>
```

### 禁用面板

```vue
<template>
  <Collapse>
    <CollapsePanel panel-key="1" header="Normal Panel"> This panel can be expanded </CollapsePanel>
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
  <Table :columns="columns" :dataSource="tableData" :pagination="false" />
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

### 行选择、分页、自定义渲染

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
const selectedRowKeys = ref([])
const handleSelect = (keys) => {
  selectedRowKeys.value = keys
}
const handlePage = ({ current, pageSize }) => {
  /* ... */
}
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
</script>
```

### 行展开（Expandable Row）

```vue
<template>
  <!-- 方式一：使用 expandedRowRender 函数 -->
  <Table
    :columns="columns"
    :dataSource="tableData"
    :expandable="{
      expandedRowRender: (record) => h('div', `Email: ${record.email}, Age: ${record.age}`)
    }"
    @expand-change="handleExpandChange" />

  <!-- 方式二：使用 #expanded-row slot -->
  <Table :columns="columns" :dataSource="tableData" :expandable="{}">
    <template #expanded-row="{ record }">
      <div class="p-4">
        <p>Name: {{ record.name }}</p>
        <p>Email: {{ record.email }}</p>
      </div>
    </template>
  </Table>

  <!-- 受控模式 + expandIconPosition -->
  <Table
    :columns="columns"
    :dataSource="tableData"
    :expandable="{
      expandedRowKeys,
      expandedRowRender: (record) => h('div', `Details: ${record.email}`),
      rowExpandable: (record) => record.age > 25,
      expandIconPosition: 'end'
    }"
    @expand-change="(keys) => (expandedRowKeys = keys)" />
</template>
<script setup>
import { ref, h } from 'vue'
const expandedRowKeys = ref([])
const handleExpandChange = (keys, record, expanded) => {
  console.log('Expand changed:', { keys, record, expanded })
}
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

### 布局模式

```vue
<template>
  <Timeline :items="items" mode="right" />
  <Timeline :items="items" mode="alternate" />
</template>
```

### 自定义渲染（slot）

```vue
<template>
  <!-- 自定义节点 -->
  <Timeline :items="items">
    <template #dot="{ item }">
      <div class="w-4 h-4 bg-green-500 rounded-full" />
    </template>
  </Timeline>

  <!-- 自定义内容 -->
  <Timeline :items="items">
    <template #item="{ item, index }">
      <div class="font-medium">{{ item.label }}</div>
      <div class="text-gray-600">{{ item.content }}</div>
    </template>
  </Timeline>
</template>
```

### 等待中状态

```vue
<template>
  <Timeline :items="items" :pending="true">
    <template #pending>
      <span>正在处理...</span>
    </template>
  </Timeline>
</template>
```

### 反转顺序

```vue
<template>
  <Timeline :items="items" :reverse="true" />
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

### 显示箭头

```vue
<template>
  <Carousel arrows>
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
    <div class="h-48 bg-red-500">Slide 3</div>
  </Carousel>
</template>
```

### 自动播放

```vue
<template>
  <Carousel autoplay :autoplay-speed="3000" pause-on-hover>
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
    <div class="h-48 bg-red-500">Slide 3</div>
  </Carousel>
</template>
```

### 淡入淡出效果

```vue
<template>
  <Carousel effect="fade" arrows>
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
    <div class="h-48 bg-red-500">Slide 3</div>
  </Carousel>
</template>
```

### 指示点位置

```vue
<template>
  <!-- 指示点在上方 -->
  <Carousel dot-position="top">
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
  </Carousel>

  <!-- 指示点在左侧 -->
  <Carousel dot-position="left">
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
  </Carousel>
</template>
```

### 使用 ref 调用方法

```vue
<template>
  <Carousel ref="carouselRef">
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
</script>
```

### 事件监听

```vue
<template>
  <Carousel @change="handleChange" @before-change="handleBeforeChange">
    <div class="h-48 bg-blue-500">Slide 1</div>
    <div class="h-48 bg-green-500">Slide 2</div>
  </Carousel>
</template>
<script setup>
const handleChange = (current, prev) => {
  console.log(`Changed from slide ${prev} to slide ${current}`)
}

const handleBeforeChange = (current, next) => {
  console.log(`About to change from slide ${current} to slide ${next}`)
}
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

### 带边框 + 自定义列数

```vue
<template>
  <Descriptions bordered :column="2" :items="items" />
</template>
```

### 垂直布局

```vue
<template>
  <Descriptions layout="vertical" :items="items" />
  <Descriptions layout="vertical" bordered :items="items" />
</template>
```

### Extra 插槽 + 跨列 + 无冒号

```vue
<template>
  <Descriptions title="订单" bordered :column="3" :colon="false" :items="orderItems">
    <template #extra><Button size="sm">编辑</Button></template>
  </Descriptions>
</template>
<script setup>
const orderItems = [
  { label: '订单号', content: 'ORDER-001' },
  { label: '地址', content: '上海市浦东新区', span: 2 }
]
</script>
```

### 自定义样式 + Item 级 class

```vue
<template>
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
