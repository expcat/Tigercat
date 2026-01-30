---
name: tigercat
description: Tigercat UI component library for Vue 3 and React
---

# Tigercat UI Component Library

Tailwind CSS 驱动的跨框架组件库，支持 Vue 3 和 React。

## Quick Navigation

| Category   | Shared Props                          | Vue Examples                   | React Examples                   |
| ---------- | ------------------------------------- | ------------------------------ | -------------------------------- |
| Basic      | [shared/props/basic.md](references/shared/props/basic.md)       | [vue/basic.md](references/vue/basic.md)       | [react/basic.md](references/react/basic.md)       |
| Form       | [shared/props/form.md](references/shared/props/form.md)         | [vue/form.md](references/vue/form.md)         | [react/form.md](references/react/form.md)         |
| Feedback   | [shared/props/feedback.md](references/shared/props/feedback.md) | [vue/feedback.md](references/vue/feedback.md) | [react/feedback.md](references/react/feedback.md) |
| Layout     | [shared/props/layout.md](references/shared/props/layout.md)     | [vue/layout.md](references/vue/layout.md)     | [react/layout.md](references/react/layout.md)     |
| Navigation | [shared/props/navigation.md](references/shared/props/navigation.md) | [vue/navigation.md](references/vue/navigation.md) | [react/navigation.md](references/react/navigation.md) |
| Data       | [shared/props/data.md](references/shared/props/data.md)         | [vue/data.md](references/vue/data.md)         | [react/data.md](references/react/data.md)         |
| Charts     | -                                     | [vue/charts.md](references/vue/charts.md)     | [react/charts.md](references/react/charts.md)     |
| Theme      | [theme.md](references/theme.md)       | -                              | -                                |
| i18n       | [i18n.md](references/i18n.md)         | -                              | -                                |
| Patterns   | [shared/patterns/common.md](references/shared/patterns/common.md) | - | - |

## Installation

```bash
# Vue 3
pnpm add @expcat/tigercat-vue

# React
pnpm add @expcat/tigercat-react
```

## Tailwind Setup

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{vue,tsx,ts}',
    './node_modules/@expcat/tigercat-{vue,react}/dist/**/*.js'
  ]
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

| Concept       | Vue                          | React                      |
| ------------- | ---------------------------- | -------------------------- |
| Two-way bind  | `v-model` / `v-model:xxx`    | `value` + `onChange`       |
| Visibility    | `visible` (v-model:visible)  | `open` + `onOpenChange`    |
| Events        | `@click`, `@change`          | `onClick`, `onChange`      |
| Slots         | `<template #name>`           | `xxxRender` props          |

## Components (60+)

**Basic**: Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text

**Form**: Checkbox, DatePicker, Form, Input, Radio, Select, Slider, Switch, Textarea, TimePicker, Upload

**Feedback**: Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip

**Layout**: Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space

**Navigation**: Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree

**Data**: Table, Timeline

**Charts**: AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart
