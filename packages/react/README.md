# @expcat/tigercat-react

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-react.svg)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React UI components for [Tigercat](https://github.com/expcat/Tigercat) - A Tailwind CSS based component library.

## 📖 Documentation

**[Live Demo & Docs →](https://expcat.github.io/Tigercat/react/)**

## Installation

```bash
pnpm add @expcat/tigercat-react
# or
npm install @expcat/tigercat-react
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

152 public component entries across 9 categories. The authoritative list with
import subpaths lives in
[component-index.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/component-index.md)
(generated); the table below is only a sampler.

| Category       | Count | Examples                                                      |
| -------------- | ----- | ------------------------------------------------------------- |
| **Basic**      | 25    | Button, Alert, Avatar, Badge, Icon, Tag, Text, Result, QRCode |
| **Form**       | 31    | Input, Select, DatePicker, Form, Upload, InputOTP, TagsInput  |
| **Layout**     | 16    | Card, Row/Col, Layout, List, Descriptions, Skeleton, Space    |
| **Navigation** | 23    | Menu, Tabs, Breadcrumb, Pagination, Steps, Dropdown, Tree     |
| **Feedback**   | 11    | Modal, Drawer, Message, Popover, Tooltip, Progress, Tour      |
| **Data**       | 7     | Table, Calendar, Collapse, Timeline, DataExport               |
| **Charts**     | 20    | BarChart, LineChart, PieChart, RadarChart, GaugeChart, Gantt  |
| **Advanced**   | 12    | VirtualTable, VirtualList, RichTextEditor, CodeEditor         |
| **Composite**  | 7     | DataTableWithToolbar, ChatWindow, FormWizard, TaskBoard       |

`Message` and `notification` are also available as imperative command APIs from
the package root; `notification` is a command API, not a component.

## Hooks

`useTigerConfig`, `useControlledState`, `useDrag`, `useChartInteraction`,
`useFormController`, plus the component context hooks `useFormContext`,
`useMenuContext`, `useTabsContext`, `useCollapseContext`, `useAnchorContext`,
`useBreadcrumbContext` and `useStepsContext`. Signatures are listed in
[api-summary.md](https://github.com/expcat/Tigercat/blob/main/skills/tigercat/references/shared/api-summary.md).

## License

[MIT](https://opensource.org/licenses/MIT)
