---
name: tigercat-react-navigation
description: React navigation components - Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree
---

# Navigation Components (React)

导航组件：Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree

## Breadcrumb 面包屑

```tsx
import { Breadcrumb } from '@expcat/tigercat-react'

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Detail' }
]

function App() {
  return (
    <>
      <Breadcrumb items={items} />
      <Breadcrumb items={items} separator=">" />
    </>
  )
}
```

**Props:**

| Prop      | Type                                 | Default | Description |
| --------- | ------------------------------------ | ------- | ----------- |
| items     | `{ label: string, href?: string }[]` | `[]`    | 层级数据    |
| separator | `string`                             | `'/'`   | 分隔符      |

---

## Dropdown 下拉菜单

```tsx
import { Dropdown, Button } from '@expcat/tigercat-react'

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete', danger: true },
  { type: 'divider' },
  { key: 'more', label: 'More', disabled: true }
]

function App() {
  return (
    <>
      <Dropdown items={items} onSelect={(key) => console.log('Selected:', key)}>
        <Button>Actions ▼</Button>
      </Dropdown>

      <Dropdown items={items} trigger="click">
        <Button>Click me</Button>
      </Dropdown>

      <Dropdown items={items} placement="bottom-end">
        <Button>Bottom End</Button>
      </Dropdown>
    </>
  )
}
```

**Props:**

| Prop      | Type                                         | Default          | Description |
| --------- | -------------------------------------------- | ---------------- | ----------- |
| items     | `DropdownItem[]`                             | `[]`             | 菜单项      |
| trigger   | `'hover' \| 'click'`                         | `'hover'`        | 触发方式    |
| placement | `'bottom-start' \| 'bottom' \| 'bottom-end'` | `'bottom-start'` | 弹出位置    |
| disabled  | `boolean`                                    | `false`          | 禁用        |

**Callbacks:** `onSelect(key: string)`

---

## Menu 菜单

```tsx
import { useState } from 'react'
import { Menu } from '@expcat/tigercat-react'

const items = [
  { key: 'home', label: 'Home', icon: '🏠' },
  {
    key: 'products',
    label: 'Products',
    icon: '📦',
    children: [
      { key: 'list', label: 'Product List' },
      { key: 'add', label: 'Add Product' }
    ]
  },
  { key: 'settings', label: 'Settings', icon: '⚙️' }
]

function App() {
  const [activeKey, setActiveKey] = useState('home')

  return (
    <>
      {/* Vertical menu (sidebar) */}
      <Menu activeKey={activeKey} items={items} onSelect={setActiveKey} />

      {/* Horizontal menu */}
      <Menu activeKey={activeKey} items={items} onSelect={setActiveKey} mode="horizontal" />

      {/* Collapsed menu */}
      <Menu activeKey={activeKey} items={items} onSelect={setActiveKey} collapsed />
    </>
  )
}
```

**Props:**

| Prop      | Type                         | Default      | Description |
| --------- | ---------------------------- | ------------ | ----------- |
| activeKey | `string`                     | -            | 当前选中项  |
| items     | `MenuItem[]`                 | `[]`         | 菜单数据    |
| mode      | `'vertical' \| 'horizontal'` | `'vertical'` | 模式        |
| collapsed | `boolean`                    | `false`      | 折叠状态    |

**Callbacks:** `onSelect(key: string)`

---

## Tabs 标签页

```tsx
import { useState } from 'react'
import { Tabs } from '@expcat/tigercat-react'

const items = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2' },
  { key: 'tab3', label: 'Tab 3', disabled: true }
]

function App() {
  const [activeTab, setActiveTab] = useState('tab1')

  return (
    <>
      <Tabs value={activeTab} onChange={setActiveTab} items={items}>
        {activeTab === 'tab1' && <p>Content of Tab 1</p>}
        {activeTab === 'tab2' && <p>Content of Tab 2</p>}
      </Tabs>

      {/* Card style */}
      <Tabs value={activeTab} onChange={setActiveTab} items={items} type="card" />

      {/* Closable */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={items}
        closable
        onClose={handleClose}
      />
    </>
  )
}
```

**Props:**

| Prop     | Type                                                   | Default  | Description  |
| -------- | ------------------------------------------------------ | -------- | ------------ |
| value    | `string`                                               | -        | 当前激活 key |
| items    | `{ key: string, label: string, disabled?: boolean }[]` | `[]`     | 标签项       |
| type     | `'line' \| 'card'`                                     | `'line'` | 样式类型     |
| closable | `boolean`                                              | `false`  | 可关闭       |

**Callbacks:** `onChange(key: string)`, `onClose(key: string)`

---

## Pagination 分页

```tsx
import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react'
import { ZH_CN_PAGINATION_LABELS } from '@expcat/tigercat-core'

function App() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  return (
    <>
      <Pagination page={page} onChange={setPage} total={100} />

      <Pagination
        page={page}
        onChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={200}
        pageSizes={[10, 20, 50, 100]}
        showSizeChanger
        showQuickJumper
      />

      {/* i18n */}
      <Pagination
        page={page}
        onChange={setPage}
        total={100}
        locale={{ pagination: ZH_CN_PAGINATION_LABELS }}
      />
    </>
  )
}
```

**Props:**

| Prop            | Type                               | Default          | Description  |
| --------------- | ---------------------------------- | ---------------- | ------------ |
| page            | `number`                           | `1`              | 当前页       |
| pageSize        | `number`                           | `10`             | 每页条数     |
| total           | `number`                           | `0`              | 总条数       |
| pageSizes       | `number[]`                         | `[10,20,50,100]` | 每页条数选项 |
| showSizeChanger | `boolean`                          | `false`          | 显示条数选择 |
| showQuickJumper | `boolean`                          | `false`          | 显示快速跳转 |
| locale          | `{ pagination: PaginationLocale }` | -                | 国际化       |

**Callbacks:** `onChange(page: number)`, `onPageSizeChange(pageSize: number)`

---

## Steps 步骤条

```tsx
import { Steps } from '@expcat/tigercat-react'

const items = [
  { title: 'Step 1', description: 'Description' },
  { title: 'Step 2', description: 'Description' },
  { title: 'Step 3', description: 'Description' }
]

function App() {
  const [current, setCurrent] = useState(1)

  return (
    <>
      <Steps current={current} items={items} />

      {/* Vertical */}
      <Steps current={current} items={items} direction="vertical" />

      {/* With status */}
      <Steps current={current} items={items} status="error" />
    </>
  )
}
```

**Props:**

| Prop      | Type                                         | Default        | Description  |
| --------- | -------------------------------------------- | -------------- | ------------ |
| current   | `number`                                     | `0`            | 当前步骤     |
| items     | `{ title: string, description?: string }[]`  | `[]`           | 步骤数据     |
| direction | `'horizontal' \| 'vertical'`                 | `'horizontal'` | 方向         |
| status    | `'wait' \| 'process' \| 'finish' \| 'error'` | -              | 当前步骤状态 |

---

## Tree 树形控件

```tsx
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react'

const data = [
  {
    key: '1',
    title: 'Parent 1',
    children: [
      { key: '1-1', title: 'Child 1-1' },
      { key: '1-2', title: 'Child 1-2' }
    ]
  },
  {
    key: '2',
    title: 'Parent 2',
    children: [{ key: '2-1', title: 'Child 2-1' }]
  }
]

function App() {
  const [expandedKeys, setExpandedKeys] = useState(['1'])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  return (
    <>
      {/* Basic */}
      <Tree data={data} expandedKeys={expandedKeys} onExpand={setExpandedKeys} />

      {/* Checkable */}
      <Tree data={data} checkable checkedKeys={checkedKeys} onCheck={setCheckedKeys} />

      {/* Selectable */}
      <Tree
        data={data}
        selectable
        selectedKeys={selectedKeys}
        onSelect={(keys, info) => {
          setSelectedKeys(keys)
          console.log('Selected:', info.node)
        }}
      />

      {/* Default expand all */}
      <Tree data={data} defaultExpandAll />
    </>
  )
}
```

**Props:**

| Prop             | Type         | Default | Description  |
| ---------------- | ------------ | ------- | ------------ |
| data             | `TreeNode[]` | `[]`    | 树形数据     |
| expandedKeys     | `string[]`   | `[]`    | 展开的节点   |
| checkedKeys      | `string[]`   | `[]`    | 选中的节点   |
| selectedKeys     | `string[]`   | `[]`    | 选择的节点   |
| checkable        | `boolean`    | `false` | 显示复选框   |
| selectable       | `boolean`    | `false` | 可选择       |
| defaultExpandAll | `boolean`    | `false` | 默认展开所有 |

**Callbacks:** `onExpand(keys, { node, expanded })`, `onCheck(keys, { node, checked })`, `onSelect(keys, { node, selected })`
