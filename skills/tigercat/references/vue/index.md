---
name: tigercat-vue
description: Vue 3 component library overview
---

# Tigercat Vue 3 Components

## Quick Start

```vue
<script setup>
import { Button, Input, Modal } from '@expcat/tigercat-vue'
import { ref } from 'vue'

const value = ref('')
const visible = ref(false)
</script>

<template>
  <Input v-model="value" placeholder="Type here" />
  <Button @click="visible = true">Open Modal</Button>
  <Modal v-model:visible="visible" title="Hello">Content</Modal>
</template>
```

## Documentation

| Category   | Props Reference                                                | Code Examples                  |
| ---------- | -------------------------------------------------------------- | ------------------------------ |
| Basic      | [../shared/props/basic.md](../shared/props/basic.md)           | [basic.md](basic.md)           |
| Form       | [../shared/props/form.md](../shared/props/form.md)             | [form.md](form.md)             |
| Feedback   | [../shared/props/feedback.md](../shared/props/feedback.md)     | [feedback.md](feedback.md)     |
| Layout     | [../shared/props/layout.md](../shared/props/layout.md)         | [layout.md](layout.md)         |
| Navigation | [../shared/props/navigation.md](../shared/props/navigation.md) | [navigation.md](navigation.md) |
| Data       | [../shared/props/data.md](../shared/props/data.md)             | [data.md](data.md)             |
| Charts     | [../shared/props/charts.md](../shared/props/charts.md)         | [charts.md](charts.md)         |
| Composite  | [../shared/props/composite.md](../shared/props/composite.md)   | [composite.md](composite.md)   |

## Vue-Specific Patterns

### v-model

```vue
<Input v-model="text" />
<Select v-model="selected" :options="options" />
<Modal v-model:visible="show" />
```

### Slots

```vue
<Card>
  <template #header>Title</template>
  <template #default>Content</template>
  <template #footer>Actions</template>
</Card>
```

### Events

```vue
<Button @click="handleClick">Click</Button>
<Input @change="handleChange" @focus="handleFocus" />
```

See [../shared/patterns/common.md](../shared/patterns/common.md) for framework comparison.

## Component Quick Links

**Basic**: Button · Icon · Badge · Tag · Alert · Avatar · Link · Code · Divider · Text  
**Form**: Input · Select · Checkbox · Radio · Switch · Slider · DatePicker · Form  
**Feedback**: Modal · Drawer · Message · Notification · Popconfirm · Popover · Loading · Progress · Skeleton  
**Layout**: Card · Container · Grid · Space · Divider · Descriptions  
**Navigation**: Menu · Breadcrumb · Dropdown · Pagination · Steps · Tabs  
**Data**: Table · List · Tree · Collapse · Timeline  
**Charts**: LineChart · AreaChart · BarChart · PieChart · DonutChart · RadarChart · ScatterChart
**Composite**: ChatWindow · ActivityFeed · DataTableWithToolbar
