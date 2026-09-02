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

Sampler: Button, Avatar, Badge, Input, Select, DatePicker, Form, Card, Layout, Menu, Tabs, Modal, Drawer, Table, BarChart, LineChart, VirtualTable, RichTextEditor, DataTableWithToolbar, ChatWindow. The generated catalog with import subpaths is
[component-index.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/component-index.md).

`Message`, `notification`, and `LoadingBar` are root command APIs;
[command-apis.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/command-apis.md).
`notification` is not a component.

## Composables

`useFormController`, `useDrag`, and `useChartInteraction`. Signatures are listed
in
[api-summary.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/shared/api-summary.md).

## Next

- Install, compatibility, and MCP client config:
  [root README](https://github.com/expcat/Tigercat/blob/main/README.md)
- Agent docs:
  [SKILL.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/SKILL.md)

## License

[MIT](https://opensource.org/licenses/MIT)
