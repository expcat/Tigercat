# @expcat/tigercat-vue

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-vue.svg)](https://www.npmjs.com/package/@expcat/tigercat-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Vue 3 UI components for [Tigercat](https://github.com/expcats/Tigercat) - A Tailwind CSS based component library.

## 📖 Documentation

**[Live Demo & Docs →](https://expcat.github.io/Tigercat/vue/)**

## Installation

```bash
pnpm add @expcat/tigercat-vue
# or
npm install @expcat/tigercat-vue
```

**Requirements:** Vue ≥3.3, Tailwind CSS ≥3.4

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

| Category       | Components                                                                            |
| -------------- | ------------------------------------------------------------------------------------- |
| **Basic**      | Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text                    |
| **Form**       | Input, Select, Checkbox, Radio, Switch, Slider, DatePicker, TimePicker, Upload, Form  |
| **Layout**     | Card, Container, Grid (Row/Col), Layout, List, Descriptions, Skeleton, Space          |
| **Navigation** | Menu, Tabs, Breadcrumb, Pagination, Steps, Dropdown, Tree                             |
| **Feedback**   | Modal, Drawer, Message, Notification, Loading, Popconfirm, Popover, Tooltip, Progress |
| **Data**       | Table, Timeline                                                                       |
| **Charts**     | BarChart, LineChart, AreaChart, PieChart, DonutChart, RadarChart, ScatterChart        |

## License

[MIT](https://opensource.org/licenses/MIT)
