---
name: tigercat-react-data
description: React data display components usage
---

# Data Components (React)

数据展示组件：Collapse, Table, Timeline, Carousel, Descriptions, Countdown

> **Props Reference**: [shared/props/data.md](../shared/props/data.md)

---

## Countdown 倒计时

### 基础用法

```tsx
<Countdown title="活动结束" value={Date.now() + 2 * 60 * 60 * 1000} />
<Countdown title="发售倒计时" value={Date.now() + 15 * 60 * 1000} format="mm:ss" />
```

### 格式化与结束事件

```tsx
const initialNow = Date.now()

;<Countdown
  title="跨天任务"
  value={initialNow + 26 * 60 * 60 * 1000}
  now={initialNow}
  format="D 天 HH:mm:ss"
  onFinish={() => console.log('finished')}
/>
```

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

### 受控与自定义标题

```tsx
const [activeKeys, setActiveKeys] = useState<string[]>(['1'])
const handleChange = (keys: string | number | (string | number)[]) => {
  setActiveKeys(Array.isArray(keys) ? keys : [keys])
}

;<Collapse activeKey={activeKeys} onChange={handleChange}>
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
  <CollapsePanel panelKey="2" header="Disabled" disabled>
    Disabled content
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

{/* 小屏横向滚动（默认）或切换为卡片列表 */}
<Table columns={columns} dataSource={tableData} responsiveMode="card" />
```

### 选择、分页、渲染与导出

```tsx
import { exportTableToCsv } from '@expcat/tigercat-core/utils/table-export'

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

const csv = exportTableToCsv(columns, tableData)
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

### 自定义渲染与等待状态

```tsx
;<Timeline
  items={items}
  mode="alternate"
  pending
  pendingContent={<span>正在处理...</span>}
  renderDot={(item) => <div className="w-4 h-4 bg-green-500 rounded-full" />}
  renderItem={(item, index) => (
    <div>
      <div className="font-medium">{item.label}</div>
      <div className="text-gray-600">{item.content}</div>
    </div>
  )}
/>
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

### 自动播放、事件与 ref

```tsx
import { useRef } from 'react'
import { Carousel, Button, Space, type CarouselRef } from '@expcat/tigercat-react'

const carouselRef = useRef<CarouselRef>(null)
const handleChange = (current: number, prev: number) => console.log(current, prev)

<>
  <Carousel ref={carouselRef} arrows autoplay autoplaySpeed={3000} pauseOnHover onChange={handleChange}>
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

---

## Calendar 日历

```tsx
<Calendar value={date} onChange={setDate} />
<Calendar value={date} onChange={setDate} mode="month" dateCellRender={renderDateCell} />
```
