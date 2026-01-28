---
name: tigercat-react-layout
description: React layout components - Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space
---

# Layout Components (React)

布局组件：Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space

## Card 卡片

```tsx
import { Card, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Card title="Card Title">
        <p>Card content</p>
      </Card>

      <Card title="With Actions" bordered shadow="hover" extra={<Button size="sm">Edit</Button>}>
        <p>Content with header actions</p>
      </Card>

      <Card
        header={
          <div className="flex justify-between">
            <span>Custom Header</span>
            <Button size="sm" variant="ghost">
              More
            </Button>
          </div>
        }>
        <p>Content</p>
      </Card>
    </>
  )
}
```

**Props:**

| Prop     | Type                             | Default    | Description    |
| -------- | -------------------------------- | ---------- | -------------- |
| title    | `string`                         | -          | 标题           |
| bordered | `boolean`                        | `true`     | 显示边框       |
| shadow   | `'always' \| 'hover' \| 'never'` | `'always'` | 阴影显示方式   |
| header   | `ReactNode`                      | -          | 自定义头部     |
| extra    | `ReactNode`                      | -          | 头部右侧操作区 |

---

## Container 容器

```tsx
import { Container } from '@expcat/tigercat-react'

function App() {
  return (
    <Container width="1200px" padding="24px">
      <p>Centered content with max-width</p>
    </Container>
  )
}
```

**Props:**

| Prop    | Type               | Default | Description |
| ------- | ------------------ | ------- | ----------- |
| width   | `string \| number` | -       | 最大宽度    |
| padding | `string \| number` | -       | 内边距      |

---

## Grid 栅格

```tsx
import { Grid } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Grid cols={3} gap="16px">
        <div>Column 1</div>
        <div>Column 2</div>
        <div>Column 3</div>
      </Grid>

      {/* Responsive */}
      <Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="16px">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>Item {i + 1}</div>
        ))}
      </Grid>
    </>
  )
}
```

**Props:**

| Prop | Type                                    | Default | Description |
| ---- | --------------------------------------- | ------- | ----------- |
| cols | `number \| { xs?, sm?, md?, lg?, xl? }` | `1`     | 列数        |
| gap  | `string \| number`                      | `0`     | 间距        |

---

## Layout 布局

```tsx
import { Layout } from '@expcat/tigercat-react'
const { Header, Sider, Content, Footer } = Layout

function App() {
  return (
    <Layout>
      <Header>Header</Header>
      <Layout>
        <Sider width="200px">Sidebar</Sider>
        <Content>Main Content</Content>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  )
}
```

**Layout Props:**

| Prop | Type                         | Default      | Description |
| ---- | ---------------------------- | ------------ | ----------- |
| mode | `'horizontal' \| 'vertical'` | `'vertical'` | 布局模式    |

**Sider Props:**

| Prop           | Type               | Default | Description |
| -------------- | ------------------ | ------- | ----------- |
| width          | `string \| number` | `200`   | 宽度        |
| collapsed      | `boolean`          | `false` | 折叠状态    |
| collapsedWidth | `number`           | `80`    | 折叠宽度    |

---

## Space 间距

```tsx
import { Space, Button } from '@expcat/tigercat-react'

function App() {
  return (
    <>
      <Space>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </Space>

      <Space direction="vertical" size="lg">
        <div>Item 1</div>
        <div>Item 2</div>
      </Space>

      <Space wrap>
        {Array.from({ length: 10 }, (_, i) => (
          <Button key={i}>Button {i + 1}</Button>
        ))}
      </Space>
    </>
  )
}
```

**Props:**

| Prop      | Type                                         | Default        | Description |
| --------- | -------------------------------------------- | -------------- | ----------- |
| direction | `'horizontal' \| 'vertical'`                 | `'horizontal'` | 方向        |
| size      | `'sm' \| 'md' \| 'lg' \| number`             | `'md'`         | 间距大小    |
| wrap      | `boolean`                                    | `false`        | 自动换行    |
| align     | `'start' \| 'center' \| 'end' \| 'baseline'` | -              | 对齐方式    |

---

## List 列表

```tsx
import { List } from '@expcat/tigercat-react'

const items = [
  { title: 'Item 1', description: 'Description 1' },
  { title: 'Item 2', description: 'Description 2' }
]

function App() {
  return (
    <>
      <List
        items={items}
        rowKey="title"
        renderItem={(item) => (
          <div>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        )}
      />

      <List
        items={items}
        split
        renderItem={(item, index) => (
          <div>
            {index + 1}. {item.title}
          </div>
        )}
      />
    </>
  )
}
```

**Props:**

| Prop       | Type                                    | Default | Description |
| ---------- | --------------------------------------- | ------- | ----------- |
| items      | `T[]`                                   | `[]`    | 数据源      |
| rowKey     | `string \| ((item: T) => string)`       | -       | 行键        |
| split      | `boolean`                               | `false` | 显示分割线  |
| renderItem | `(item: T, index: number) => ReactNode` | -       | 渲染函数    |

---

## Descriptions 描述列表

```tsx
import { Descriptions } from '@expcat/tigercat-react'

const items = [
  { label: 'Name', value: 'John Doe' },
  { label: 'Email', value: 'john@example.com' },
  { label: 'Phone', value: '123-456-7890' }
]

function App() {
  return (
    <>
      <Descriptions items={items} columns={2} />

      <Descriptions layout="vertical" columns={3}>
        <Descriptions.Item label="Name">John</Descriptions.Item>
        <Descriptions.Item label="Age">25</Descriptions.Item>
      </Descriptions>
    </>
  )
}
```

**Props:**

| Prop       | Type                              | Default        | Description |
| ---------- | --------------------------------- | -------------- | ----------- |
| items      | `{ label: string, value: any }[]` | -              | 数据项      |
| columns    | `number`                          | `3`            | 列数        |
| layout     | `'horizontal' \| 'vertical'`      | `'horizontal'` | 布局        |
| labelStyle | `CSSProperties`                   | -              | 标签样式    |

---

## Skeleton 骨架屏

```tsx
import { useState } from 'react'
import { Skeleton } from '@expcat/tigercat-react'

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <>
      <Skeleton loading={loading} rows={3} animated>
        <p>Content loaded</p>
      </Skeleton>

      {/* Avatar skeleton */}
      <Skeleton loading={loading} shape="circle" />

      {/* Button skeleton */}
      <Skeleton loading={loading} shape="button" />
    </>
  )
}
```

**Props:**

| Prop     | Type                                        | Default  | Description |
| -------- | ------------------------------------------- | -------- | ----------- |
| loading  | `boolean`                                   | `true`   | 加载状态    |
| rows     | `number`                                    | `3`      | 行数        |
| shape    | `'text' \| 'circle' \| 'button' \| 'image'` | `'text'` | 形状        |
| animated | `boolean`                                   | `true`   | 动画效果    |
