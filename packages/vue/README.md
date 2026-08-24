# @expcat/tigercat-vue

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-vue.svg)](https://www.npmjs.com/package/@expcat/tigercat-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Vue 3 UI components for [Tigercat](https://github.com/expcat/Tigercat) - A Tailwind CSS based component library.

## 📖 Documentation

**[Live Demo & Docs →](https://expcat.github.io/Tigercat/vue/)**

## Installation

```bash
pnpm add @expcat/tigercat-vue
# or
npm install @expcat/tigercat-vue
```

**Requirements:** Vue 3.x, Tailwind CSS 4.x, Node.js ≥22.13.0

## Quick Start

```vue
<script setup>
import { ConfigProvider, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <ConfigProvider>
    <Button variant="primary">Click me</Button>
  </ConfigProvider>
</template>
```

## Components

172 public component entries across 9 categories. The authoritative list with
import subpaths lives in
[component-index.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/component-index.md)
(generated); the table below is only a sampler.

| Category       | Count | Examples                                                      |
| -------------- | ----- | ------------------------------------------------------------- |
| **Basic**      | 30    | Button, Alert, Avatar, Badge, Icon, Tag, Text, Result, QRCode |
| **Form**       | 31    | Input, Select, DatePicker, Form, Upload, InputOTP, TagsInput  |
| **Layout**     | 19    | Card, Row/Col, Layout, List, Descriptions, Skeleton, Space    |
| **Navigation** | 33    | Menu, Tabs, Breadcrumb, Pagination, Steps, Dropdown, Tree     |
| **Feedback**   | 13    | Modal, Drawer, Message, Popover, Tooltip, Progress, Tour      |
| **Data**       | 7     | Table, Calendar, Collapse, Timeline, DataExport               |
| **Charts**     | 20    | BarChart, LineChart, PieChart, RadarChart, GaugeChart, Gantt  |
| **Advanced**   | 12    | VirtualTable, VirtualList, RichTextEditor, CodeEditor         |
| **Composite**  | 7     | DataTableWithToolbar, ChatWindow, FormWizard, TaskBoard       |

`Message` and `notification` are also available as imperative command APIs from
the package root; `notification` is a command API, not a component.

## License

[MIT](https://opensource.org/licenses/MIT)
