---
name: tigercat
description: Tigercat UI component library for Vue 3 and React
---

# Tigercat UI Component Library

Tailwind CSS 驱动的跨框架组件库，支持 Vue 3 和 React。

## Quick Navigation

| Category   | Shared Props                                                        | Vue Examples                                      | React Examples                                        |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| Basic      | [shared/props/basic.md](references/shared/props/basic.md)           | [vue/basic.md](references/vue/basic.md)           | [react/basic.md](references/react/basic.md)           |
| Form       | [shared/props/form.md](references/shared/props/form.md)             | [vue/form.md](references/vue/form.md)             | [react/form.md](references/react/form.md)             |
| Feedback   | [shared/props/feedback.md](references/shared/props/feedback.md)     | [vue/feedback.md](references/vue/feedback.md)     | [react/feedback.md](references/react/feedback.md)     |
| Layout     | [shared/props/layout.md](references/shared/props/layout.md)         | [vue/layout.md](references/vue/layout.md)         | [react/layout.md](references/react/layout.md)         |
| Navigation | [shared/props/navigation.md](references/shared/props/navigation.md) | [vue/navigation.md](references/vue/navigation.md) | [react/navigation.md](references/react/navigation.md) |
| Data       | [shared/props/data.md](references/shared/props/data.md)             | [vue/data.md](references/vue/data.md)             | [react/data.md](references/react/data.md)             |
| Charts     | [shared/props/charts.md](references/shared/props/charts.md)         | [vue/charts.md](references/vue/charts.md)         | [react/charts.md](references/react/charts.md)         |
| Composite  | [shared/props/composite.md](references/shared/props/composite.md)   | [vue/composite.md](references/vue/composite.md)   | [react/composite.md](references/react/composite.md)   |
| Advanced   | [shared/props/advanced.md](references/shared/props/advanced.md)     | -                                                 | -                                                     |
| Theme      | [theme.md](references/theme.md)                                     | -                                                 | -                                                     |
| i18n       | [i18n.md](references/i18n.md)                                       | -                                                 | -                                                     |
| Patterns   | [shared/patterns/common.md](references/shared/patterns/common.md)   | -                                                 | -                                                     |
| CLI        | [cli.md](references/cli.md)                                         | -                                                 | -                                                     |

## Installation

```bash
# Vue 3
pnpm add @expcat/tigercat-vue @expcat/tigercat-core

# React
pnpm add @expcat/tigercat-react @expcat/tigercat-core
```

## Tailwind Setup

```js
// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  plugins: [tigercatPlugin]
}
```

## Import

```ts
// Vue
import { Button, Input } from '@expcat/tigercat-vue'

// React
import { Button, Input } from '@expcat/tigercat-react'
```

## Vue vs React Differences

详见 [shared/patterns/common.md](references/shared/patterns/common.md)

| Concept      | Vue                       | React                   |
| ------------ | ------------------------- | ----------------------- |
| Two-way bind | `v-model` / `v-model:xxx` | `value` + `onChange`    |
| Visibility   | `open` (v-model:open)     | `open` + `onOpenChange` |
| Events       | `@click`, `@change`       | `onClick`, `onChange`   |
| Slots        | `<template #name>`        | `xxxRender` props       |

## Components (133+)

**Basic (16)**: Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Code, Divider, Empty, Icon, Image, ImageCropper, Link, QRCode, Tag, Text

**Form (22)**: AutoComplete, Cascader, Checkbox, CheckboxGroup, ColorPicker, DatePicker, Form, Input, InputGroup, InputNumber, Mentions, Radio, RadioGroup, Rate, Select, Slider, Stepper, Switch, Textarea, TimePicker, Transfer, TreeSelect, Upload

**Feedback (12)**: Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Result, Tooltip, Tour, Watermark

**Layout (14)**: Card, Carousel, Container, Descriptions, Grid (Row/Col), Layout (Header/Sidebar/Content/Footer), List, Resizable, Skeleton, Space, Splitter, Statistic

**Navigation (13)**: Affix, Anchor, BackTop, Breadcrumb, Dropdown, FloatButton, Menu, Pagination, Segmented, Steps, Tabs, Tree

**Data (4)**: Calendar, Collapse, Table, Timeline

**Charts (17)**: AreaChart, BarChart, ChartCanvas, ChartLegend, ChartTooltip, DonutChart, FunnelChart, GaugeChart, HeatmapChart, LineChart, PieChart, RadarChart, ScatterChart, SunburstChart, TreeMapChart

**Advanced (10)**: CodeEditor, FileManager, ImageViewer, InfiniteScroll, Kanban, PrintLayout, RichTextEditor, TaskBoard, VirtualList, VirtualTable

**Composite (7)**: ActivityFeed, ChatWindow, CommentThread, CropUpload, DataTableWithToolbar, FormWizard, NotificationCenter
