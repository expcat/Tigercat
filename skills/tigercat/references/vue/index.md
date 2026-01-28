---
name: tigercat-vue-index
description: Vue 3 component overview for Tigercat UI. Import all components from @expcat/tigercat-vue. Events use kebab-case, v-model supported.
---

# Tigercat Vue 3 组件总览

从 `@expcat/tigercat-vue` 导入所有组件。

## Quick Start

```vue
<script setup>
import { Button, ConfigProvider } from '@expcat/tigercat-vue'
</script>

<template>
  <ConfigProvider>
    <Button variant="primary" @click="handleClick">Click Me</Button>
  </ConfigProvider>
</template>
```

## Vue 3 Conventions

- **Event naming**: kebab-case (`@click`, `@change`, `@update:modelValue`)
- **Two-way binding**: Use `v-model` (e.g., `v-model="value"`, `v-model:visible="show"`)
- **Class binding**: Use `class` attribute
- **Slots**: Use `<template #slotName>` syntax

## Component Index by Category

| Category       | Components                                                                                                                                                | Reference                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Basic**      | Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text                                                                                        | [basic.md](basic.md)           |
| **Layout**     | Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space                                                                                        | [layout.md](layout.md)         |
| **Form**       | Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload                       | [form.md](form.md)             |
| **Navigation** | Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree                                                                                                 | [navigation.md](navigation.md) |
| **Feedback**   | Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip                                                                     | [feedback.md](feedback.md)     |
| **Data**       | Table, Timeline                                                                                                                                           | [data.md](data.md)             |
| **Charts**     | AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart, ChartCanvas, ChartAxis, ChartGrid, ChartLegend, ChartSeries, ChartTooltip | [charts.md](charts.md)         |

## Quick Props Reference

### Basic

- **Button**: `variant`(primary/secondary/outline/ghost/link), `size`(sm/md/lg), `disabled`, `loading`, `block`, `type`
- **Icon**: `name`, `size`, `color`, `rotate`
- **Text**: `size`, `weight`, `color`, `ellipsis`
- **Tag**: `color`, `size`, `closable` → `@close`
- **Badge**: `value`, `max`, `dot`
- **Avatar**: `src`, `size`, `shape`, `text`
- **Alert**: `type`(success/info/warning/error), `closable`, `title`, `description` → `@close`

### Form (v-model supported)

- **Input**: `v-model`, `placeholder`, `disabled`, `clearable`, `prefix`, `suffix`, `status`, `errorMessage`
- **Select**: `v-model`, `options`, `multiple`, `clearable`
- **Checkbox/Radio**: `v-model`, `disabled`
- **Switch**: `v-model`, `disabled`, `size`
- **DatePicker**: `v-model`, `format`, `disabled`, `range`

### Feedback

- **Modal**: `v-model:visible`, `title`, `size`, `okText`, `cancelText` → `@ok`, `@cancel`
- **Drawer**: `v-model:visible`, `title`, `placement` → `@close`
- **Message**: `Message.success(content)`, `Message.error(content)`, `Message.info(content)`
- **Notification**: `Notification.open({ title, description, type })`

### Charts

- **BarChart/LineChart/PieChart**: `data`, `width`, `height`, `hoverable`, `selectable`, `showLegend`, `showTooltip`
- **Events**: `@bar-click`, `@series-click`, `@slice-click`, `@point-hover`

## Common Patterns

### Form Validation

```vue
<template>
  <Form ref="formRef" :model="form" :rules="rules">
    <FormItem prop="email" label="Email">
      <Input v-model="form.email" />
    </FormItem>
    <Button @click="submit">Submit</Button>
  </Form>
</template>

<script setup>
import { ref } from 'vue'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-vue'

const formRef = ref()
const form = ref({ email: '' })
const rules = {
  email: [{ required: true, message: 'Email is required' }]
}

const submit = async () => {
  const valid = await formRef.value.validate()
  if (valid) {
    /* submit */
  }
}
</script>
```

### Modal with Form

```vue
<template>
  <Button @click="visible = true">Open Modal</Button>
  <Modal v-model:visible="visible" title="Edit">
    <Input v-model="value" />
    <template #footer>
      <Button variant="secondary" @click="visible = false">Cancel</Button>
      <Button @click="handleOk">OK</Button>
    </template>
  </Modal>
</template>
```

### Data Table

```vue
<template>
  <Table :columns="columns" :data="data" row-key="id" @row-click="handleRowClick" />
</template>

<script setup>
const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'action', title: 'Action', render: (row) => h(Button, { size: 'sm' }, 'Edit') }
]
</script>
```
