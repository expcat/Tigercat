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

;<Collapse activeKey={activeKeys} onChange={handleChange}>
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
{
  /* 无边框 */
}
;<Collapse bordered={false}>
  <CollapsePanel panelKey="1" header="No Border">
    Content without border
  </CollapsePanel>
</Collapse>

{
  /* Ghost 模式（透明背景） */
}
;<Collapse ghost>
  <CollapsePanel panelKey="1" header="Ghost Style">
    Transparent background
  </CollapsePanel>
</Collapse>

{
  /* 箭头在右侧 */
}
;<Collapse expandIconPosition="end">
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
    extra={
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleEdit()
        }}>
        Edit
      </Button>
    }>
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

<Table columns={columns} dataSource={tableData} pagination={false} />
```

### 行选择、分页、自定义渲染

```tsx
const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
const columns = [
  { key: 'name', title: 'Name' },
  {
    key: 'status', title: 'Status',
    render: (record) => (
      <span className={record.status === 'active' ? 'text-green-600' : 'text-gray-400'}>
        {record.status}
      </span>
    )
  },
  {
    key: 'action', title: 'Action',
    render: (record) => <Button size="sm" onClick={() => edit(record)}>Edit</Button>
  }
]

<Table
  columns={columns}
  dataSource={tableData}
  rowSelection={{
    selectedRowKeys,
    type: 'checkbox'
  }}
  pagination={{ current: 1, pageSize: 10 }}
  onSelectionChange={setSelectedRowKeys}
  onPageChange={({ current, pageSize }) => { /* ... */ }}
/>
```

### 行展开（Expandable Row）

```tsx
// 基础用法
<Table
  columns={columns}
  dataSource={tableData}
  expandable={{
    expandedRowRender: (record) => (
      <div>Email: {record.email}, Age: {record.age}</div>
    )
  }}
  onExpandChange={(keys, record, expanded) => {
    console.log('Expand changed:', { keys, record, expanded })
  }}
/>

// 受控模式 + rowExpandable + expandIconPosition
const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>([])

<Table
  columns={columns}
  dataSource={tableData}
  expandable={{
    expandedRowKeys,
    expandedRowRender: (record) => <div>Details: {record.email}</div>,
    rowExpandable: (record) => (record.age as number) > 25,
    expandIconPosition: 'end'
  }}
  onExpandChange={(keys) => setExpandedRowKeys(keys)}
/>

// 点击整行展开
<Table
  columns={columns}
  dataSource={tableData}
  expandable={{
    expandedRowRender: (record) => <div>Details: {record.email}</div>,
    expandRowByClick: true
  }}
/>
```

---

## Timeline 时间轴

### 基础用法

```tsx
<Timeline
  items={[
    { key: 1, label: '2024-01-01', content: 'Created', color: '#10b981' },
    { key: 2, label: '2024-01-02', content: 'Processing', color: '#3b82f6' },
    { key: 3, label: '2024-01-03', content: 'Pending' }
  ]}
/>
```

### 布局模式

```tsx
<Timeline items={items} mode="right" />
<Timeline items={items} mode="alternate" />
```

### 自定义渲染

```tsx
{
  /* 自定义节点 */
}
;<Timeline
  items={items}
  renderDot={(item) => <div className="w-4 h-4 bg-green-500 rounded-full" />}
/>

{
  /* 自定义内容 */
}
;<Timeline
  items={items}
  renderItem={(item, index) => (
    <div>
      <div className="font-medium">{item.label}</div>
      <div className="text-gray-600">{item.content}</div>
    </div>
  )}
/>
```

### 等待中状态

```tsx
<Timeline
  items={items}
  pending
  pendingContent={<span>正在处理...</span>}
  pendingDot={<div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />}
/>
```

### 反转顺序

```tsx
<Timeline items={items} reverse />
```

---

## Carousel 轮播图

### 基础用法

```tsx
<Carousel>
  <div className="h-48 bg-blue-500 flex items-center justify-center text-white text-2xl">
    Slide 1
  </div>
  <div className="h-48 bg-green-500 flex items-center justify-center text-white text-2xl">
    Slide 2
  </div>
  <div className="h-48 bg-red-500 flex items-center justify-center text-white text-2xl">
    Slide 3
  </div>
</Carousel>
```

### 显示箭头

```tsx
<Carousel arrows>
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
  <div className="h-48 bg-red-500">Slide 3</div>
</Carousel>
```

### 自动播放

```tsx
<Carousel autoplay autoplaySpeed={3000} pauseOnHover>
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
  <div className="h-48 bg-red-500">Slide 3</div>
</Carousel>
```

### 淡入淡出效果

```tsx
<Carousel effect="fade" arrows>
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
  <div className="h-48 bg-red-500">Slide 3</div>
</Carousel>
```

### 指示点位置

```tsx
{
  /* 指示点在上方 */
}
;<Carousel dotPosition="top">
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
</Carousel>

{
  /* 指示点在左侧 */
}
;<Carousel dotPosition="left">
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
</Carousel>
```

### 使用 ref 调用方法

```tsx
import { useRef } from 'react'
import { Carousel, Button, Space, type CarouselRef } from '@expcat/tigercat-react'

const carouselRef = useRef<CarouselRef>(null)

<>
  <Carousel ref={carouselRef}>
    <div className="h-48 bg-blue-500">Slide 1</div>
    <div className="h-48 bg-green-500">Slide 2</div>
    <div className="h-48 bg-red-500">Slide 3</div>
  </Carousel>
  <Space>
    <Button onClick={() => carouselRef.current?.prev()}>Prev</Button>
    <Button onClick={() => carouselRef.current?.next()}>Next</Button>
    <Button onClick={() => carouselRef.current?.goTo(0)}>Go to First</Button>
  </Space>
</>
```

### 事件监听

```tsx
const handleChange = (current: number, prev: number) => {
  console.log(`Changed from slide ${prev} to slide ${current}`)
}

const handleBeforeChange = (current: number, next: number) => {
  console.log(`About to change from slide ${current} to slide ${next}`)
}

;<Carousel onChange={handleChange} onBeforeChange={handleBeforeChange}>
  <div className="h-48 bg-blue-500">Slide 1</div>
  <div className="h-48 bg-green-500">Slide 2</div>
</Carousel>
```

---

## Descriptions 描述列表

### 基础用法

```tsx
const items = [
  { label: '姓名', content: '张三' },
  { label: '电话', content: '1234567890' },
  { label: '邮箱', content: 'zhangsan@example.com' }
]

;<Descriptions title="用户信息" items={items} />
```

### 带边框 + 自定义列数

```tsx
<Descriptions bordered column={2} items={items} />
```

### 垂直布局

```tsx
<Descriptions layout="vertical" items={items} />
<Descriptions layout="vertical" bordered items={items} />
```

### Extra + 跨列 + 无冒号

```tsx
const orderItems = [
  { label: '订单号', content: 'ORDER-001' },
  { label: '地址', content: '上海市浦东新区', span: 2 }
]

;<Descriptions
  title="订单"
  bordered
  column={3}
  colon={false}
  items={orderItems}
  extra={<Button size="sm">编辑</Button>}
/>
```

### 自定义样式 + Item 级 class

```tsx
const items = [
  {
    label: '高亮',
    content: '重要信息',
    labelClassName: 'text-red-600',
    contentClassName: 'font-bold'
  }
]

;<Descriptions
  bordered
  column={2}
  items={items}
  labelStyle={{ fontWeight: 600 }}
  contentStyle={{ color: '#6b7280' }}
/>
```
