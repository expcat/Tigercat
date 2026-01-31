---
name: tigercat-react-data
description: React data display components usage
---

# Data Components (React)

数据展示组件：Table, Timeline, Collapse

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

---

## Collapse 折叠面板

### 基础用法

```tsx
<Collapse>
  <CollapsePanel panelKey="1" header="Section 1">
    Content of section 1
  </CollapsePanel>
  <CollapsePanel panelKey="2" header="Section 2">
    Content of section 2
  </CollapsePanel>
  <CollapsePanel panelKey="3" header="Section 3">
    Content of section 3
  </CollapsePanel>
</Collapse>
```

### 手风琴模式（Accordion）

```tsx
<Collapse accordion defaultActiveKey="1">
  <CollapsePanel panelKey="1" header="Panel 1">
    Only one panel can be expanded at a time
  </CollapsePanel>
  <CollapsePanel panelKey="2" header="Panel 2">
    Click to expand this panel
  </CollapsePanel>
</Collapse>
```

### 受控模式

```tsx
const [activeKeys, setActiveKeys] = useState<string[]>(['1'])

const handleChange = (keys: string | number | (string | number)[]) => {
  console.log('Active keys:', keys)
  setActiveKeys(Array.isArray(keys) ? keys : [keys])
}

<Collapse activeKey={activeKeys} onChange={handleChange}>
  <CollapsePanel panelKey="1" header="Panel 1">
    Content 1
  </CollapsePanel>
  <CollapsePanel panelKey="2" header="Panel 2">
    Content 2
  </CollapsePanel>
</Collapse>
```

### 自定义样式

```tsx
{/* 无边框 */}
<Collapse bordered={false}>
  <CollapsePanel panelKey="1" header="No Border">
    Content without border
  </CollapsePanel>
</Collapse>

{/* Ghost 模式（透明背景） */}
<Collapse ghost>
  <CollapsePanel panelKey="1" header="Ghost Style">
    Transparent background
  </CollapsePanel>
</Collapse>

{/* 箭头在右侧 */}
<Collapse expandIconPosition="end">
  <CollapsePanel panelKey="1" header="Arrow on right">
    Content
  </CollapsePanel>
</Collapse>
```

### 禁用面板

```tsx
<Collapse>
  <CollapsePanel panelKey="1" header="Normal Panel">
    This panel can be expanded
  </CollapsePanel>
  <CollapsePanel panelKey="2" header="Disabled Panel" disabled>
    This panel is disabled
  </CollapsePanel>
</Collapse>
```

### 自定义标题与额外内容

```tsx
<Collapse>
  <CollapsePanel 
    panelKey="1"
    header={<span className="font-bold text-blue-600">Custom Header</span>}
    extra={<Button size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>Edit</Button>}
  >
    Panel content
  </CollapsePanel>
</Collapse>
```

---

## Table 表格

### 基础用法

```tsx
const columns = [
  { key: 'name', title: 'Name', width: 150 },
  { key: 'age', title: 'Age', width: 100, sortable: true },
  { key: 'email', title: 'Email' }
]
const tableData = [
  { id: 1, name: 'John', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane', age: 32, email: 'jane@example.com' }
]

<Table columns={columns} data={tableData} rowKey="id" />
```

### 可选择、分页、自定义渲染

```tsx
const [selectedKeys, setSelectedKeys] = useState<number[]>([])
const columns = [
  { key: 'name', title: 'Name' },
  { key: 'status', title: 'Status', render: (row) => <Badge color={row.status === 'active' ? 'green' : 'gray'}>{row.status}</Badge> },
  { key: 'action', title: 'Action', render: (row) => <Button size="sm" onClick={() => edit(row)}>Edit</Button> }
]

<Table
  columns={columns}
  data={tableData}
  rowKey="id"
  selectedKeys={selectedKeys}
  onSelect={setSelectedKeys}
  selectable
  pagination={{ current: 1, pageSize: 10, total: 100 }}
  onPageChange={handlePageChange}
/>
```

---

## Timeline 时间轴

```tsx
<Timeline>
  <Timeline.Item color="green">Created 2024-01-01</Timeline.Item>
  <Timeline.Item color="blue">Processing 2024-01-02</Timeline.Item>
  <Timeline.Item color="gray">Pending 2024-01-03</Timeline.Item>
</Timeline>

<Timeline items={[
  { content: 'Created', time: '2024-01-01', color: 'green' },
  { content: 'Updated', time: '2024-01-02', color: 'blue' }
]} />
```
