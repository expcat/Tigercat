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
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react'

// 基本用法
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>

// 箭头分隔符
<Breadcrumb separator="arrow">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>

// 带图标
<Breadcrumb>
  <BreadcrumbItem href="/" icon={<HomeIcon />}>Home</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>

// extra 扩展区
<Breadcrumb extra={<Button size="small">Edit</Button>}>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>

// 外部链接
<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="https://github.com" target="_blank">GitHub</BreadcrumbItem>
  <BreadcrumbItem current>Current Page</BreadcrumbItem>
</Breadcrumb>

// 单独设置分隔符
<Breadcrumb>
  <BreadcrumbItem href="/" separator="arrow">Home</BreadcrumbItem>
  <BreadcrumbItem href="/products" separator="chevron">Products</BreadcrumbItem>
  <BreadcrumbItem current>Details</BreadcrumbItem>
</Breadcrumb>
```

---

## Dropdown 下拉菜单

```tsx
import { useState } from 'react'
import { Dropdown, DropdownMenu, DropdownItem, Button } from '@expcat/tigercat-react'

// 基本用法（悬浮触发）
<Dropdown>
  <Button>操作</Button>
  <DropdownMenu>
    <DropdownItem onClick={() => console.log('edit')}>编辑</DropdownItem>
    <DropdownItem onClick={() => console.log('copy')}>复制</DropdownItem>
    <DropdownItem divided onClick={() => console.log('delete')}>删除</DropdownItem>
  </DropdownMenu>
</Dropdown>

// 点击触发
<Dropdown trigger="click">
  <Button>点击打开</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
    <DropdownItem>菜单项 2</DropdownItem>
  </DropdownMenu>
</Dropdown>

// 受控模式
const [visible, setVisible] = useState(false)
<Dropdown visible={visible} onVisibleChange={setVisible}>
  <Button>受控</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
  </DropdownMenu>
</Dropdown>

// 无箭头
<Dropdown showArrow={false}>
  <Button>无箭头</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
  </DropdownMenu>
</Dropdown>

// 禁用
<Dropdown disabled>
  <Button disabled>禁用</Button>
  <DropdownMenu>
    <DropdownItem>菜单项 1</DropdownItem>
  </DropdownMenu>
</Dropdown>

// 点击不关闭
<Dropdown closeOnClick={false} trigger="click">
  <Button>点击不关闭</Button>
  <DropdownMenu>
    <DropdownItem>多选项 1</DropdownItem>
    <DropdownItem>多选项 2</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

---

## Menu 菜单

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-react'

// 基本垂直菜单
const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['home'])

<Menu selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
  <MenuItem itemKey="home">首页</MenuItem>
  <MenuItem itemKey="products">产品</MenuItem>
  <MenuItem itemKey="about" disabled>关于</MenuItem>
</Menu>

// 水平菜单
<Menu mode="horizontal" selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
  <MenuItem itemKey="home">首页</MenuItem>
  <MenuItem itemKey="products">产品</MenuItem>
</Menu>

// 带子菜单
const [openKeys, setOpenKeys] = useState<(string | number)[]>(['sub1'])

<Menu
  selectedKeys={selectedKeys}
  openKeys={openKeys}
  onSelect={(key) => setSelectedKeys([key])}
  onOpenChange={(_key, { openKeys }) => setOpenKeys(openKeys)}>
  <SubMenu itemKey="sub1" title="导航一" icon={homeIcon}>
    <MenuItem itemKey="1">选项 1</MenuItem>
    <MenuItem itemKey="2">选项 2</MenuItem>
  </SubMenu>
  <MenuItem itemKey="3">导航二</MenuItem>
</Menu>

// 内联模式 + 自定义缩进
<Menu mode="inline" inlineIndent={32}
  selectedKeys={selectedKeys} openKeys={openKeys}
  onSelect={(key) => setSelectedKeys([key])}
  onOpenChange={(_key, { openKeys }) => setOpenKeys(openKeys)}>
  <SubMenu itemKey="sub1" title="分类一">
    <MenuItem itemKey="1">子项 1</MenuItem>
    <SubMenu itemKey="sub1-1" title="分类一-一">
      <MenuItem itemKey="1-1">深层子项</MenuItem>
    </SubMenu>
  </SubMenu>
</Menu>

// 折叠菜单
<Menu mode="vertical" collapsed={collapsed}
  selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
  <MenuItem itemKey="1" icon={homeIcon}>首页</MenuItem>
  <SubMenu itemKey="sub1" title="设置" icon={settingsIcon}>
    <MenuItem itemKey="2">常规</MenuItem>
  </SubMenu>
</Menu>

// 暗色主题
<Menu theme="dark" selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
  <MenuItem itemKey="1">菜单项 1</MenuItem>
  <MenuItem itemKey="2">菜单项 2</MenuItem>
</Menu>

// 单一展开模式（multiple=false）
<Menu multiple={false}
  selectedKeys={selectedKeys} openKeys={openKeys}
  onSelect={(key) => setSelectedKeys([key])}
  onOpenChange={(_key, { openKeys }) => setOpenKeys(openKeys)}>
  <SubMenu itemKey="sub1" title="导航一">
    <MenuItem itemKey="1">选项 1</MenuItem>
  </SubMenu>
  <SubMenu itemKey="sub2" title="导航二">
    <MenuItem itemKey="2">选项 2</MenuItem>
  </SubMenu>
</Menu>

// 非受控模式（使用 defaultSelectedKeys / defaultOpenKeys）
<Menu defaultSelectedKeys={['1']} defaultOpenKeys={['sub1']}>
  <SubMenu itemKey="sub1" title="导航一">
    <MenuItem itemKey="1">选项 1</MenuItem>
  </SubMenu>
</Menu>

// 分组菜单
<Menu>
  <MenuItemGroup title="分组一">
    <MenuItem itemKey="1">选项 1</MenuItem>
    <MenuItem itemKey="2">选项 2</MenuItem>
  </MenuItemGroup>
  <MenuItemGroup title="分组二">
    <MenuItem itemKey="3">选项 3</MenuItem>
  </MenuItemGroup>
</Menu>
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
