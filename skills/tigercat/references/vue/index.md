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
const open = ref(false)
</script>

<template>
  <Input v-model="value" placeholder="Type here" />
  <Button @click="open = true">Open Modal</Button>
  <Modal v-model:open="open" title="Hello">Content</Modal>
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
| Advanced   | [../shared/props/advanced.md](../shared/props/advanced.md)     | -                              |

## Vue-Specific Patterns

### v-model

```vue
<Input v-model="text" />
<Select v-model="selected" :options="options" />
<Modal v-model:open="show" />
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

**Basic**: Alert · Avatar · AvatarGroup · Badge · Button · ButtonGroup · Code · Divider · Empty · Icon · Image · ImageCropper · Link · QRCode · Tag · Text
**Form**: AutoComplete · Cascader · Checkbox · ColorPicker · DatePicker · Form · Input · InputGroup · InputNumber · Mentions · Radio · Rate · Select · Slider · Stepper · Switch · Textarea · TimePicker · Transfer · TreeSelect · Upload
**Feedback**: Drawer · Loading · Message · Modal · Notification · Popconfirm · Popover · Progress · Result · Tooltip · Tour · Watermark
**Layout**: Card · Carousel · Container · Descriptions · Grid (Row/Col) · Layout · List · Resizable · Skeleton · Space · Splitter · Statistic
**Navigation**: Affix · Anchor · BackTop · Breadcrumb · Dropdown · FloatButton · Menu · Pagination · Segmented · Steps · Tabs · Tree
**Data**: Calendar · Collapse · Table · Timeline
**Charts**: AreaChart · BarChart · DonutChart · FunnelChart · GaugeChart · HeatmapChart · LineChart · PieChart · RadarChart · ScatterChart · SunburstChart · TreeMapChart
**Advanced**: CodeEditor · FileManager · ImageViewer · InfiniteScroll · Kanban · PrintLayout · RichTextEditor · TaskBoard · VirtualList · VirtualTable
**Composite**: ActivityFeed · ChatWindow · CommentThread · CropUpload · DataTableWithToolbar · FormWizard · NotificationCenter
