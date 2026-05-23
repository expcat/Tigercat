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
| SSR        | [ssr.md](references/ssr.md)                                         | -                                                 | -                                                     |
| Patterns   | [shared/patterns/common.md](references/shared/patterns/common.md)   | -                                                 | -                                                     |
| Glossary   | [shared/glossary.md](references/shared/glossary.md)                 | -                                                 | -                                                     |
| CLI        | [cli.md](references/cli.md)                                         | -                                                 | -                                                     |

## 2-Step Component Lookup

1. 在下表搜索组件名，确认所属分类。
2. 打开同一行的 Props / Vue / React 分类文档，再搜索组件标题。

| Category   | Components                                                                                                                                                                                                                             | Props                                          | Vue                                 | React                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- | --------------------------------------- |
| Basic      | Alert, Avatar, AvatarGroup, Badge, Button, ButtonGroup, Code, Divider, Empty, Icon, Image, ImageCropper, Link, QRCode, Tag, Text                                                                                                       | [Props](references/shared/props/basic.md)      | [Vue](references/vue/basic.md)      | [React](references/react/basic.md)      |
| Form       | AutoComplete, Cascader, Checkbox, CheckboxGroup, ColorPicker, DatePicker, Form, Input, InputGroup, InputNumber, Mentions, Radio, RadioGroup, Rate, Select, Slider, Stepper, Switch, Textarea, TimePicker, Transfer, TreeSelect, Upload | [Props](references/shared/props/form.md)       | [Vue](references/vue/form.md)       | [React](references/react/form.md)       |
| Feedback   | Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Result, Tooltip, Tour, Watermark                                                                                                                         | [Props](references/shared/props/feedback.md)   | [Vue](references/vue/feedback.md)   | [React](references/react/feedback.md)   |
| Layout     | Card, Carousel, Container, Descriptions, Grid, Layout, List, Resizable, Skeleton, Space, Splitter, Statistic                                                                                                                           | [Props](references/shared/props/layout.md)     | [Vue](references/vue/layout.md)     | [React](references/react/layout.md)     |
| Navigation | Affix, Anchor, BackTop, Breadcrumb, Dropdown, FloatButton, Menu, Pagination, Segmented, Steps, Tabs, Tree                                                                                                                              | [Props](references/shared/props/navigation.md) | [Vue](references/vue/navigation.md) | [React](references/react/navigation.md) |
| Data       | Calendar, Collapse, Table, Timeline                                                                                                                                                                                                    | [Props](references/shared/props/data.md)       | [Vue](references/vue/data.md)       | [React](references/react/data.md)       |
| Charts     | AreaChart, BarChart, ChartCanvas, ChartLegend, ChartTooltip, DonutChart, FunnelChart, GaugeChart, HeatmapChart, LineChart, PieChart, RadarChart, ScatterChart, SunburstChart, TreeMapChart                                             | [Props](references/shared/props/charts.md)     | [Vue](references/vue/charts.md)     | [React](references/react/charts.md)     |
| Advanced   | CodeEditor, FileManager, ImageViewer, InfiniteScroll, Kanban, PrintLayout, RichTextEditor, TaskBoard, VirtualList, VirtualTable                                                                                                        | [Props](references/shared/props/advanced.md)   | [Vue](references/vue/advanced.md)   | [React](references/react/advanced.md)   |
| Composite  | ActivityFeed, ChatWindow, CommentThread, CropUpload, DataTableWithToolbar, FormWizard, NotificationCenter                                                                                                                              | [Props](references/shared/props/composite.md)  | [Vue](references/vue/composite.md)  | [React](references/react/composite.md)  |

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
