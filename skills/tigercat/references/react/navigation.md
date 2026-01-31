---
name: tigercat-react-navigation
description: React navigation components usage
---

# Navigation Components (React)

导航组件：Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree, BackTop, Anchor

> **Props Reference**: [shared/props/navigation.md](../shared/props/navigation.md)

---

## Breadcrumb 面包屑

```tsx
<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Products', path: '/products' }, { label: 'Detail' }]} separator="/" />
```

---

## Dropdown 下拉菜单

```tsx
<Dropdown items={[{ key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }]} onSelect={handleSelect}>
  <Button>Actions</Button>
</Dropdown>
```

---

## Menu 菜单

```tsx
const [selectedKeys, setSelectedKeys] = useState(['home'])
const [openKeys, setOpenKeys] = useState(['sub1'])
const menuItems = [
  { key: 'home', label: 'Home', icon: <HomeIcon /> },
  { key: 'sub1', label: 'Sub Menu', children: [
    { key: 'opt1', label: 'Option 1' },
    { key: 'opt2', label: 'Option 2' }
  ]}
]

<Menu selectedKeys={selectedKeys} onSelect={setSelectedKeys} items={menuItems} mode="horizontal" />
<Menu selectedKeys={selectedKeys} openKeys={openKeys} onOpenChange={setOpenKeys} items={menuItems} mode="vertical" collapsed />
```

---

## Tabs 标签页

```tsx
const [activeKey, setActiveKey] = useState('tab1')
const items = [
  { key: 'tab1', label: 'Tab 1', content: <div>Tab 1 content</div> },
  { key: 'tab2', label: 'Tab 2', content: <div>Tab 2 content</div> }
]

<Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
<Tabs activeKey={activeKey} onChange={setActiveKey} type="card" addable closable onAdd={handleAdd} onClose={handleClose} />
```

---

## Pagination 分页

```tsx
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

<Pagination current={page} pageSize={pageSize} total={100} onChange={setPage} onPageSizeChange={setPageSize} showSizeChanger showQuickJumper />
```

---

## Steps 步骤条

```tsx
const [step, setStep] = useState(0)

<Steps current={step} items={[{ title: 'Step 1' }, { title: 'Step 2' }, { title: 'Step 3' }]} />
<Steps direction="vertical" items={items} />
```

---

## Tree 树形控件

```tsx
const [expandedKeys, setExpandedKeys] = useState(['node1'])
const [checkedKeys, setCheckedKeys] = useState([])
const treeData = [
  { key: 'node1', label: 'Node 1', children: [
    { key: 'node1-1', label: 'Child 1' }
  ]}
]

<Tree data={treeData} expandedKeys={expandedKeys} onExpand={setExpandedKeys} checkedKeys={checkedKeys} onCheck={setCheckedKeys} checkable />
```

---

## BackTop 回到顶部

```tsx
// 基础用法
<BackTop />

// 自定义显示高度
<BackTop visibilityHeight={200} />

// 自定义滚动目标
const scrollRef = useRef<HTMLDivElement>(null)
<BackTop target={() => scrollRef.current!} />

// 自定义内容
<BackTop>
  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white">
    ↑
  </div>
</BackTop>

// 点击事件
<BackTop onClick={(e) => console.log('clicked', e)} />
```

---

## Anchor 锚点导航

```tsx
import { Anchor, AnchorLink } from '@expcat/tigercat-react'

// 基础用法
<Anchor>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
  <AnchorLink href="#section3" title="Section 3" />
</Anchor>

// 横向导航
<Anchor direction="horizontal">
  <AnchorLink href="#intro" title="Introduction" />
  <AnchorLink href="#api" title="API" />
  <AnchorLink href="#examples" title="Examples" />
</Anchor>

// 固定定位并显示指示器
<Anchor affix offsetTop={80} showInkInFixed>
  <AnchorLink href="#overview" title="Overview" />
  <AnchorLink href="#features" title="Features" />
</Anchor>

// 自定义滚动容器
const containerRef = useRef<HTMLDivElement>(null)

<div ref={containerRef} className="h-96 overflow-auto">
  <Anchor getContainer={() => containerRef.current!}>
    <AnchorLink href="#part1" title="Part 1" />
    <AnchorLink href="#part2" title="Part 2" />
  </Anchor>
</div>

// 监听事件
<Anchor
  onClick={(e, href) => console.log('Clicked:', href)}
  onChange={(activeLink) => console.log('Active link changed:', activeLink)}
>
  <AnchorLink href="#section1" title="Section 1" />
  <AnchorLink href="#section2" title="Section 2" />
</Anchor>

// 自定义链接内容
<Anchor>
  <AnchorLink href="#custom">
    <span className="flex items-center gap-2">
      <Icon name="star" />
      Custom Link
    </span>
  </AnchorLink>
</Anchor>
```
