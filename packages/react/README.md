# @expcat/tigercat-react

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-react.svg)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React UI components for [Tigercat](https://github.com/expcat/Tigercat) - A Tailwind CSS based component library.

## Documentation

**[Live Demo & Docs →](https://expcat.github.io/Tigercat/react/)**

## Installation

These commands install the current **3.0.2** release and match this documentation. The preview channel `@next` is not this 3.0.2 documentation. Keep core on the same version. Current versions and setup are in the [root README](https://github.com/expcat/Tigercat/blob/main/README.md#快速开始).

```bash
pnpm add @expcat/tigercat-react @expcat/tigercat-core
# or
npm install @expcat/tigercat-react @expcat/tigercat-core
```

**Requirements:** React / React DOM 19.x, Tailwind CSS 4.x, Node.js ≥22.13.0

## Quick Start

```tsx
import { ConfigProvider, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <ConfigProvider>
      <Button variant="primary">Click me</Button>
    </ConfigProvider>
  )
}
```

## Components

Sampler: Button, Avatar, Badge, Input, Select, DatePicker, Form, Card, Layout, Menu, Tabs, Modal, Drawer, Table, BarChart, LineChart, VirtualTable, RichTextEditor, DataTableWithToolbar, ChatWindow, WorkflowDesigner, WorkflowDetailShell. The generated catalog with import subpaths is
[component-index.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/component-index.md).

`Message`, `notification`, and `LoadingBar` are root command APIs;
[command-apis.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/command-apis.md).
`notification` is not a component.

## Hooks

`useTigerConfig`, `useControlledState`, `useDrag`, `useChartInteraction`,
`useFormController`, plus the component context hooks `useFormContext`,
`useMenuContext`, `useTabsContext`, `useCollapseContext`, `useAnchorContext`,
`useBreadcrumbContext` and `useStepsContext`. Signatures are listed in
[api-summary.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/shared/api-summary.md).

## Next

- Install, compatibility, and MCP client config:
  [root README](https://github.com/expcat/Tigercat/blob/main/README.md)
- Agent docs:
  [SKILL.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/SKILL.md)

## License

[MIT](https://opensource.org/licenses/MIT)
