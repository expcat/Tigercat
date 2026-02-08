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

## Grid 栅格

```tsx
<Grid cols={3} gap="16px">
  <div>Col 1</div><div>Col 2</div><div>Col 3</div>
</Grid>
<Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="16px">
  {[1,2,3,4,5,6,7,8].map(i => <div key={i}>Item {i}</div>)}
</Grid>
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
