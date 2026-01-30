---
name: tigercat-react-data
description: React data display components usage
---

# Data Components (React)

数据展示组件：Table, Timeline

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

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
