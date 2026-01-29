# @expcat/tigercat-react

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-react.svg)](https://www.npmjs.com/package/@expcat/tigercat-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

React UI components for [Tigercat](https://github.com/expcats/Tigercat) - A Tailwind CSS based component library.

## 📖 Documentation

**[Live Demo & Docs →](https://expcat.github.io/Tigercat/react/)**

## Installation

```bash
pnpm add @expcat/tigercat-react
# or
npm install @expcat/tigercat-react
```

**Requirements:** React ≥19, Tailwind CSS ≥3.4

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

| Category       | Components                                                                            |
| -------------- | ------------------------------------------------------------------------------------- |
| **Basic**      | Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text                    |
| **Form**       | Input, Select, Checkbox, Radio, Switch, Slider, DatePicker, TimePicker, Upload, Form  |
| **Layout**     | Card, Container, Grid (Row/Col), Layout, List, Descriptions, Skeleton, Space          |
| **Navigation** | Menu, Tabs, Breadcrumb, Pagination, Steps, Dropdown, Tree                             |
| **Feedback**   | Modal, Drawer, Message, Notification, Loading, Popconfirm, Popover, Tooltip, Progress |
| **Data**       | Table, Timeline                                                                       |
| **Charts**     | BarChart, LineChart, AreaChart, PieChart, DonutChart, RadarChart, ScatterChart        |

## Hooks

- `useChartInteraction` - Chart interaction utilities
- `useFormContext` - Form state management
- `useMenuContext` - Menu state access
- `useTabsContext` - Tabs state access
- `useBreadcrumbContext` - Breadcrumb navigation
- `useStepsContext` - Steps state access

## License

[MIT](https://opensource.org/licenses/MIT)
