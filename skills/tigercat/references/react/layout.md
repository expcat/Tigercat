---
name: tigercat-react-layout
description: React layout components usage
---

# Layout Components (React)

布局组件：Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space

> **Props Reference**: [shared/props/layout.md](../shared/props/layout.md)

---

## Card 卡片

```tsx
<Card title="Title"><p>Content</p></Card>
<Card title="With Actions" bordered shadow="hover" extra={<Button size="sm">Edit</Button>}>
  <p>Content</p>
</Card>
```

---

## Container 容器

```tsx
<Container width="1200px" padding="24px">
  <p>Centered content</p>
</Container>
```

---

## Grid 栅格（Row + Col）

```tsx
{
  /* 基础 24 分栏 */
}
;<Row gutter={16}>
  <Col span={8}>A</Col>
  <Col span={8}>B</Col>
  <Col span={8}>C</Col>
</Row>

{
  /* 响应式 */
}
;<Row gutter={[16, 16]}>
  <Col span={{ xs: 24, md: 12, lg: 8 }}>1</Col>
  <Col span={{ xs: 24, md: 12, lg: 8 }}>2</Col>
  <Col span={{ xs: 24, md: 12, lg: 8 }}>3</Col>
</Row>

{
  /* 对齐与分布 */
}
;<Row justify="space-between" align="middle">
  <Col span={6}>A</Col>
  <Col span={6}>B</Col>
</Row>

{
  /* 偏移与排序 */
}
;<Row gutter={16}>
  <Col span={8} offset={4}>
    offset=4
  </Col>
  <Col span={8} order={{ xs: 2, md: 1 }}>
    order
  </Col>
</Row>

{
  /* Flex 自适应 */
}
;<Row gutter={16}>
  <Col span={0} flex={1}>
    auto
  </Col>
  <Col span={0} flex="0_0_200px">
    fixed
  </Col>
</Row>
```

---

## Layout 布局

```tsx
import { useState } from 'react'
import { Layout, Header, Sidebar, Content, Footer } from '@expcat/tigercat-react'

{/* 基础布局 */}
<Layout>
  <Header>Header</Header>
  <Content>Main</Content>
  <Footer>Footer</Footer>
</Layout>

{/* 侧边栏布局 */}
<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="256px">Sidebar</Sidebar>
    <Content>Main</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>

{/* 可折叠侧边栏 */}
const [collapsed, setCollapsed] = useState(false)
<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="256px" collapsed={collapsed}>Sidebar</Sidebar>
    <Content>Main</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>
```

---

## Space 间距

```tsx
<Space><Button>A</Button><Button>B</Button></Space>
<Space direction="vertical" size="lg"><div>1</div><div>2</div></Space>
<Space wrap>{[1,2,3,4,5].map(i => <Button key={i}>{i}</Button>)}</Space>
```

---

## List 列表

```tsx
<List items={items} rowKey="id" split renderItem={(item) => <div>{item.title}</div>} />
```

---

## Descriptions 描述列表

```tsx
<Descriptions items={[{ label: 'Name', value: 'John' }]} columns={2} />
```

---

## Skeleton 骨架屏

```tsx
<Skeleton loading={loading} rows={3} animated>
  <p>Loaded content</p>
</Skeleton>
```
