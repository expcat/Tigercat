---
name: tigercat-react-index
description: React component overview for Tigercat UI. Import all components from @expcat/tigercat-react. Events use camelCase, controlled components supported.
---

# Tigercat React 组件总览

从 `@expcat/tigercat-react` 导入所有组件。

## Quick Start

```tsx
import { Button, ConfigProvider } from '@expcat/tigercat-react'

export function App() {
  return (
    <ConfigProvider>
      <Button variant="primary" onClick={handleClick}>
        Click Me
      </Button>
    </ConfigProvider>
  )
}
```

## React Conventions

- **Event naming**: camelCase (`onClick`, `onChange`, `onClose`)
- **Controlled components**: Use `value` + `onChange` pattern
- **Class binding**: Use `className` attribute
- **Children/Slots**: Use props (e.g., `footer={<Component />}`) or `children`

## Component Index by Category

| Category       | Components                                                                                                                                                | Reference                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Basic**      | Alert, Avatar, Badge, Button, Code, Divider, Icon, Link, Tag, Text                                                                                        | [basic.md](basic.md)           |
| **Layout**     | Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space                                                                                        | [layout.md](layout.md)         |
| **Form**       | Checkbox, CheckboxGroup, DatePicker, Form, FormItem, Input, Radio, RadioGroup, Select, Slider, Switch, Textarea, TimePicker, Upload                       | [form.md](form.md)             |
| **Navigation** | Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree                                                                                                 | [navigation.md](navigation.md) |
| **Feedback**   | Drawer, Loading, Message, Modal, Notification, Popconfirm, Popover, Progress, Tooltip                                                                     | [feedback.md](feedback.md)     |
| **Data**       | Table, Timeline                                                                                                                                           | [data.md](data.md)             |
| **Charts**     | AreaChart, BarChart, DonutChart, LineChart, PieChart, RadarChart, ScatterChart, ChartCanvas, ChartAxis, ChartGrid, ChartLegend, ChartSeries, ChartTooltip | [charts.md](charts.md)         |

## Quick Props Reference

### Basic

- **Button**: `variant`(primary/secondary/outline/ghost/link), `size`(sm/md/lg), `disabled`, `loading`, `loadingIcon`, `block`, `type`
- **Icon**: `name`, `size`, `color`, `rotate`
- **Text**: `size`, `weight`, `color`, `ellipsis`
- **Tag**: `color`, `size`, `closable` → `onClose`
- **Badge**: `value`, `max`, `dot`
- **Avatar**: `src`, `size`, `shape`, `text`
- **Alert**: `type`(success/info/warning/error), `closable`, `title`, `description` → `onClose`

### Form (Controlled)

- **Input**: `value`, `onChange`, `placeholder`, `disabled`, `clearable`, `prefix`, `suffix`, `status`, `errorMessage`
- **Select**: `value`, `onChange`, `options`, `multiple`, `clearable`
- **Checkbox/Radio**: `checked`, `onChange`, `disabled`
- **Switch**: `checked`, `onChange`, `disabled`, `size`
- **DatePicker**: `value`, `onChange`, `format`, `disabled`, `range`

### Feedback

- **Modal**: `open`, `onOk`, `onCancel`, `title`, `size`, `okText`, `cancelText`, `footer`
- **Drawer**: `open`, `onClose`, `title`, `placement`
- **Message**: `Message.success(content)`, `Message.error(content)`, `Message.info(content)`
- **Notification**: `Notification.open({ title, description, type })`

### Charts

- **BarChart/LineChart/PieChart**: `data`, `width`, `height`, `hoverable`, `selectable`, `showLegend`, `showTooltip`
- **Callbacks**: `onBarClick`, `onSeriesClick`, `onSliceClick`, `onPointHover`

## Common Patterns

### Form with Validation

```tsx
import { useState } from 'react'
import { Form, FormItem, Input, Button } from '@expcat/tigercat-react'

function MyForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      console.log('Submit:', form)
    }
  }

  return (
    <Form labelWidth={100}>
      <FormItem label="Email" error={errors.email}>
        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </FormItem>
      <FormItem label="Password" error={errors.password}>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </FormItem>
      <Button onClick={handleSubmit}>Submit</Button>
    </Form>
  )
}
```

### Modal with Form

```tsx
import { useState } from 'react'
import { Modal, Button, Input } from '@expcat/tigercat-react'

function App() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        title="Edit"
        onCancel={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log(value)
                setOpen(false)
              }}>
              OK
            </Button>
          </>
        }>
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </Modal>
    </>
  )
}
```

### Data Table

```tsx
import { Table, Button } from '@expcat/tigercat-react'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'action', title: 'Action', render: (row) => <Button size="sm">Edit</Button> }
]

function App() {
  return <Table columns={columns} data={data} rowKey="id" onRowClick={handleRowClick} />
}
```

## TypeScript Support

组件 Props 类型也从 `@expcat/tigercat-react` 导出：

```tsx
import type { ButtonProps, InputProps, ModalProps } from '@expcat/tigercat-react'
```
