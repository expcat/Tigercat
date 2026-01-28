---
name: tigercat
description: Tigercat UI component library for Vue 3 and React with Tailwind CSS theming. Use when building frontend applications that need UI components like Button, Input, Modal, Table, Form, Charts (60+ components). For Vue 3 projects query references/vue/, for React projects query references/react/. Supports dark mode, i18n, and CSS variable theming.
metadata:
  packages: '@expcat/tigercat-vue, @expcat/tigercat-react, @expcat/tigercat-core'
  styling: 'Tailwind CSS + CSS Variables'
  vue-version: '>=3.3.0'
  react-version: '>=18.0.0'
  tailwind-version: '>=3.4.0'
---

# Tigercat UI

基于 Tailwind CSS 的 UI 组件库，同时支持 Vue 3 与 React。

## Quick Navigation

根据项目技术栈选择对应文档：

| 技术栈       | 参考文档                                               |
| ------------ | ------------------------------------------------------ |
| **Vue 3**    | [references/vue/index.md](references/vue/index.md)     |
| **React**    | [references/react/index.md](references/react/index.md) |
| **主题配置** | [references/theme.md](references/theme.md)             |
| **国际化**   | [references/i18n.md](references/i18n.md)               |

## Installation

```bash
# Vue 3
pnpm add @expcat/tigercat-vue @expcat/tigercat-core

# React
pnpm add @expcat/tigercat-react @expcat/tigercat-core
```

## Tailwind Configuration (Required)

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

## CSS Import

```css
@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-vue/dist/**/*.{js,mjs}'; /* Vue */
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}'; /* React */
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';
```

## Component Categories

| Category       | Components                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Basic**      | Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text                                                                                        |
| **Layout**     | Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space                                                                                        |
| **Form**       | Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload                       |
| **Navigation** | Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree                                                                                                 |
| **Feedback**   | Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip                                                                     |
| **Data**       | Table, Timeline                                                                                                                                           |
| **Charts**     | AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart, ChartCanvas, ChartAxis, ChartGrid, ChartLegend, ChartSeries, ChartTooltip |

## Key Differences: Vue vs React

| Aspect          | Vue 3                              | React                                        |
| --------------- | ---------------------------------- | -------------------------------------------- |
| Package         | `@expcat/tigercat-vue`             | `@expcat/tigercat-react`                     |
| Event naming    | kebab-case (`@click`, `@change`)   | camelCase (`onClick`, `onChange`)            |
| Two-way binding | `v-model` supported                | Controlled components (`value` + `onChange`) |
| Class prop      | `class`                            | `className`                                  |
| Slot/Children   | Named slots (`<template #footer>`) | Props (`footer={<Component />}`)             |

## Core Conventions

### Styling with Theme Variables

Always use CSS variables with fallbacks for theme colors:

```html
<!-- Correct -->
<div class="bg-[var(--tiger-primary,#2563eb)]">...</div>

<!-- Wrong - no fallback -->
<div class="bg-[var(--tiger-primary)]">...</div>
```

### ConfigProvider

Wrap your app with `ConfigProvider` for global configuration:

```vue
<!-- Vue -->
<ConfigProvider :locale="zhCN">
  <App />
</ConfigProvider>
```

```tsx
// React
<ConfigProvider locale={zhCN}>
  <App />
</ConfigProvider>
```

### Common Pitfalls

1. **Styles not applied**: Ensure Tailwind `content` includes `./node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}`
2. **Theme variables not working**: Must add `tigercatPlugin` to Tailwind plugins
3. **Vue: v-model not reactive**: Don't mix `:value` with `@update:modelValue`, use only `v-model`
4. **React: Controlled vs Uncontrolled**: Don't mix `value` (controlled) with `defaultValue` (uncontrolled)

## File References

- Vue components: See [references/vue/](references/vue/) for all Vue 3 component docs
- React components: See [references/react/](references/react/) for all React component docs
- Theme customization: See [references/theme.md](references/theme.md)
- Internationalization: See [references/i18n.md](references/i18n.md)
