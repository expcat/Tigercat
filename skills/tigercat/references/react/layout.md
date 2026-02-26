---
name: tigercat-react-layout
description: React layout components usage
---

# Layout Components (React)

布局组件：Card, Container, Descriptions, Divider, Grid, Layout, List, Skeleton, Space

> **Props Reference**: [shared/props/layout.md](../shared/props/layout.md)

---

## Card 卡片

```tsx
{/* 基本用法 */}
<Card><p>基础卡片内容</p></Card>

{/* 变体 */}
<Card variant="bordered">粗边框</Card>
<Card variant="shadow">带阴影</Card>
<Card variant="elevated">浮起</Card>

{/* 尺寸 */}
<Card size="sm">紧凑</Card>
<Card size="lg">宽松</Card>

{/* 悬停效果 */}
<Card hoverable variant="shadow">可交互卡片</Card>

{/* 封面图片 */}
<Card cover="/img.jpg" coverAlt="描述">
  <p>带封面的卡片</p>
</Card>

{/* 完整结构 */}
<Card
  variant="shadow"
  hoverable
  header={<h3>标题</h3>}
  footer={<span>底部信息</span>}
  actions={<Button size="sm">操作</Button>}>
  <p>主体内容</p>
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

## Divider 分割线

```tsx
{/* 基础水平分割线 */}
<Divider />

{/* 线条样式 */}
<Divider lineStyle="dashed" />
<Divider lineStyle="dotted" />

{/* 间距 */}
<Divider spacing="none" />
<Divider spacing="xs" />
<Divider spacing="lg" />

{/* 自定义颜色与粗细 */}
<Divider color="#2563eb" thickness="2px" />

{/* 垂直分割线 */}
<div className="flex items-center h-12">
  <span>Left</span>
  <Divider orientation="vertical" className="h-6" />
  <span>Right</span>
</div>
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

{/* Mini 模式侧边栏（折叠后保留 64px 宽度） */}
const [collapsed, setCollapsed] = useState(false)
<Sidebar width="256px" collapsedWidth="64px" collapsed={collapsed}>
  {/* 折叠后仍可显示图标 */}
</Sidebar>
```

### Admin 后台布局组合示例

将 `Layout`、`Header`、`Sidebar`、`Menu`、`Content` 组合为典型后台管理布局，
包含 mini 模式侧边栏 + 3 级嵌套菜单。

```tsx
import { useState } from 'react'
import { Layout, Header, Sidebar, Content, Footer, Menu, Button } from '@expcat/tigercat-react'
import type { MenuItem } from '@expcat/tigercat-react'

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems: MenuItem[] = [
    { key: 'home', label: '首页' },
    {
      key: 'system',
      label: '系统管理',
      children: [
        { key: 'users', label: '用户管理' },
        {
          key: 'roles',
          label: '角色管理',
          children: [
            { key: 'role-list', label: '角色列表' },
            { key: 'role-perms', label: '权限配置' }
          ]
        }
      ]
    },
    { key: 'settings', label: '设置' }
  ]

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-4">
        <span>Logo</span>
        <Button size="sm" variant="ghost" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? '展开' : '折叠'}
        </Button>
      </Header>
      <div className="flex flex-1">
        <Sidebar width="256px" collapsedWidth="64px" collapsed={collapsed}>
          <Menu items={menuItems} mode="inline" collapsed={collapsed} />
        </Sidebar>
        <Content className="p-6">主内容区</Content>
      </div>
      <Footer>© 2025 Tigercat</Footer>
    </Layout>
  )
}
```

**重点说明：**

- `collapsedWidth="64px"`：折叠后保留 64px 宽度（mini 模式），而非完全隐藏
- `Menu` 的 `collapsed` prop 需与 `Sidebar` 同步，使菜单在折叠态仅显示图标
- 3 级嵌套菜单：`系统管理 → 角色管理 → 角色列表 / 权限配置`

---

## Space 间距

```tsx
<Space><Button>A</Button><Button>B</Button></Space>
<Space direction="vertical" size="lg"><div>1</div><div>2</div></Space>
<Space size={24}><div>Custom 24px gap</div><div>Item</div></Space>
<Space align="center"><div className="h-10">Short</div><div className="h-16">Tall</div></Space>
<Space wrap>{[1,2,3,4,5].map(i => <Button key={i}>{i}</Button>)}</Space>
```

---

## List 列表

```tsx
import { List } from '@expcat/tigercat-react'

const data = [
  { key: 1, title: '列表项 1', description: '描述信息' },
  { key: 2, title: '列表项 2', description: '描述信息' }
]

{
  /* 基本用法 */
}
;<List dataSource={data} />

{
  /* 自定义渲染 + 头尾 + hoverable */
}
;<List
  dataSource={data}
  size="sm"
  bordered="bordered"
  hoverable
  header={<span>标题</span>}
  footer={<span>底部</span>}
  renderItem={(item) => <span>{item.title}</span>}
  onItemClick={(item, i) => console.log(item, i)}
/>

{
  /* 网格布局 */
}
;<List
  dataSource={data}
  grid={{ column: 3, gutter: 16 }}
  bordered="none"
  renderItem={(item) => <Card>{item.title}</Card>}
/>
```

---

## Descriptions 描述列表

```tsx
<Descriptions items={[{ label: 'Name', value: 'John' }]} columns={2} />
```

---

## Skeleton 骨架屏

```tsx
{/* 基本用法 */}
<Skeleton />

{/* 变体 */}
<Skeleton variant="avatar" shape="circle" />
<Skeleton variant="image" />
<Skeleton variant="button" />
<Skeleton variant="custom" width="300px" height="150px" />

{/* 动画 */}
<Skeleton animation="wave" />
<Skeleton animation="none" />

{/* 多行文本 */}
<Skeleton variant="text" rows={3} />

{/* 段落模式（行宽自动变化） */}
<Skeleton variant="text" rows={4} paragraph />

{/* 自定义尺寸 */}
<Skeleton width="200px" height="50px" />

{/* 组合使用 */}
<div className="flex items-start gap-4">
  <Skeleton variant="avatar" />
  <div className="flex-1">
    <Skeleton variant="text" width="150px" className="mb-2" />
    <Skeleton variant="text" rows={2} paragraph />
  </div>
</div>
```
