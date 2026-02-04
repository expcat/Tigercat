---
name: tigercat-react
description: React component library overview
---

# Tigercat React Components

## Quick Start

```tsx
import { Button, Input, Modal } from '@expcat/tigercat-react'
import { useState } from 'react'

function App() {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  return (
    <>
      <Input value={value} onChange={setValue} placeholder="Type here" />
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onOpenChange={setOpen} title="Hello">
        Content
      </Modal>
    </>
  )
}
```

## Documentation

| Category   | Props Reference                                                | Code Examples                  |
| ---------- | -------------------------------------------------------------- | ------------------------------ |
| Basic      | [../shared/props/basic.md](../shared/props/basic.md)           | [basic.md](basic.md)           |
| Form       | [../shared/props/form.md](../shared/props/form.md)             | [form.md](form.md)             |
| Feedback   | [../shared/props/feedback.md](../shared/props/feedback.md)     | [feedback.md](feedback.md)     |
| Layout     | [../shared/props/layout.md](../shared/props/layout.md)         | [layout.md](layout.md)         |
| Navigation | [../shared/props/navigation.md](../shared/props/navigation.md) | [navigation.md](navigation.md) |
| Data       | [../shared/props/data.md](../shared/props/data.md)             | [data.md](data.md)             |
| Charts     | [../shared/props/charts.md](../shared/props/charts.md)         | [charts.md](charts.md)         |
| Composite  | [../shared/props/composite.md](../shared/props/composite.md)   | [composite.md](composite.md)   |

## React-Specific Patterns

### Controlled Components

```tsx
const [value, setValue] = useState('')
<Input value={value} onChange={setValue} />

const [open, setOpen] = useState(false)
<Modal open={open} onOpenChange={setOpen} />
```

### Render Props

```tsx
<Card header={<Title>Header</Title>} footer={<Actions />}>
  Content
</Card>

<Table columns={columns} data={data} renderRow={(row) => <CustomRow {...row} />} />
```

### Event Handlers

```tsx
<Button onClick={handleClick}>Click</Button>
<Input onChange={handleChange} onFocus={handleFocus} />
```

See [../shared/patterns/common.md](../shared/patterns/common.md) for framework comparison.

---

## Component Quick Links

**Basic**: Button · Icon · Badge · Tag · Alert · Avatar · Link · Code · Divider · Text  
**Form**: Input · Select · Checkbox · Radio · Switch · Slider · DatePicker · Form  
**Feedback**: Modal · Drawer · Message · Notification · Popconfirm · Popover · Loading · Progress · Skeleton  
**Layout**: Card · Container · Grid · Space · Divider · Descriptions  
**Navigation**: Menu · Breadcrumb · Dropdown · Pagination · Steps · Tabs  
**Data**: Table · List · Tree · Collapse · Timeline  
**Charts**: LineChart · AreaChart · BarChart · PieChart · DonutChart · RadarChart · ScatterChart  
**Composite**: ChatWindow · ActivityFeed · DataTableWithToolbar
