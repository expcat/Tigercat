# Tree 树形控件

用于展示层级结构的树形数据。支持节点展开收拢、多选、懒加载等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const treeData = ref([
  {
    key: '1',
    label: 'Parent Node 1',
    children: [
      { key: '1-1', label: 'Child Node 1-1' },
      { key: '1-2', label: 'Child Node 1-2' }
    ]
  },
  {
    key: '2',
    label: 'Parent Node 2',
    children: [{ key: '2-1', label: 'Child Node 2-1' }]
  }
])
</script>

<template>
  <Tree :treeData="treeData" />
</template>
```

### React

```tsx
import { Tree } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    {
      key: '1',
      label: 'Parent Node 1',
      children: [
        { key: '1-1', label: 'Child Node 1-1' },
        { key: '1-2', label: 'Child Node 1-2' }
      ]
    },
    {
      key: '2',
      label: 'Parent Node 2',
      children: [{ key: '2-1', label: 'Child Node 2-1' }]
    }
  ]

  return <Tree treeData={treeData} />
}
```

## 可选择的树

通过设置 `checkable` 属性来展示复选框，支持节点多选。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const treeData = ref([
  {
    key: '1',
    label: 'Parent Node 1',
    children: [
      { key: '1-1', label: 'Child Node 1-1' },
      { key: '1-2', label: 'Child Node 1-2' }
    ]
  }
])

const checkedKeys = ref(['1-1'])

function handleCheck(keys, info) {
  console.log('Checked keys:', keys)
  console.log('Info:', info)
}
</script>

<template>
  <Tree :treeData="treeData" checkable v-model:checkedKeys="checkedKeys" @check="handleCheck" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    {
      key: '1',
      label: 'Parent Node 1',
      children: [
        { key: '1-1', label: 'Child Node 1-1' },
        { key: '1-2', label: 'Child Node 1-2' }
      ]
    }
  ]

  const [checkedKeys, setCheckedKeys] = useState(['1-1'])

  const handleCheck = (keys, info) => {
    console.log('Checked keys:', keys)
    console.log('Info:', info)
    setCheckedKeys(keys)
  }

  return <Tree treeData={treeData} checkable checkedKeys={checkedKeys} onCheck={handleCheck} />
}
```

## 父子节点独立选择

设置 `checkStrictly` 为 `true` 时，父节点和子节点的选中状态互不关联。

### Vue 3

```vue
<template>
  <Tree :treeData="treeData" checkable checkStrictly v-model:checkedKeys="checkedKeys" />
</template>
```

### React

```tsx
<Tree
  treeData={treeData}
  checkable
  checkStrictly
  checkedKeys={checkedKeys}
  onCheck={setCheckedKeys}
/>
```

## 可选中的树

通过设置 `selectable` 属性控制节点是否可选中。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1-1'])

function handleSelect(keys, info) {
  console.log('Selected keys:', keys)
  console.log('Selected nodes:', info.selectedNodes)
}
</script>

<template>
  <Tree
    :treeData="treeData"
    selectable
    v-model:selectedKeys="selectedKeys"
    @select="handleSelect" />
</template>
```

### React

```tsx
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1-1'])

  const handleSelect = (keys, info) => {
    console.log('Selected keys:', keys)
    console.log('Selected nodes:', info.selectedNodes)
    setSelectedKeys(keys)
  }

  return <Tree treeData={treeData} selectable selectedKeys={selectedKeys} onSelect={handleSelect} />
}
```

## 默认展开所有节点

通过 `defaultExpandAll` 属性设置默认展开所有节点。

### Vue 3

```vue
<template>
  <Tree :treeData="treeData" defaultExpandAll />
</template>
```

### React

```tsx
<Tree treeData={treeData} defaultExpandAll />
```

## 懒加载

通过 `loadData` 属性实现节点的异步加载。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const treeData = ref([
  { key: '1', label: 'Parent Node 1' },
  { key: '2', label: 'Parent Node 2' }
])

async function loadData(node) {
  // 模拟异步加载
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { key: `${node.key}-1`, label: `Child of ${node.label}` },
        { key: `${node.key}-2`, label: `Child of ${node.label}` }
      ])
    }, 1000)
  })
}
</script>

<template>
  <Tree :treeData="treeData" :loadData="loadData" />
</template>
```

### React

```tsx
import { Tree } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    { key: '1', label: 'Parent Node 1' },
    { key: '2', label: 'Parent Node 2' }
  ]

  const loadData = async (node) => {
    // 模拟异步加载
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-1`, label: `Child of ${node.label}` },
          { key: `${node.key}-2`, label: `Child of ${node.label}` }
        ])
      }, 1000)
    })
  }

  return <Tree treeData={treeData} loadData={loadData} />
}
```

## 节点过滤

通过 `filterValue` 和 `filterFn` 属性实现节点过滤功能。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const treeData = ref([
  {
    key: '1',
    label: 'Parent Node 1',
    children: [
      { key: '1-1', label: 'Child Node 1-1' },
      { key: '1-2', label: 'Child Node 1-2' }
    ]
  }
])

const filterValue = ref('')
</script>

<template>
  <div>
    <input v-model="filterValue" placeholder="Search..." />
    <Tree :treeData="treeData" :filterValue="filterValue" />
  </div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    {
      key: '1',
      label: 'Parent Node 1',
      children: [
        { key: '1-1', label: 'Child Node 1-1' },
        { key: '1-2', label: 'Child Node 1-2' }
      ]
    }
  ]

  const [filterValue, setFilterValue] = useState('')

  return (
    <div>
      <input
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        placeholder="Search..."
      />
      <Tree treeData={treeData} filterValue={filterValue} />
    </div>
  )
}
```

## 自定义节点图标

通过在节点数据中设置 `icon` 属性自定义节点图标。

### Vue 3

```vue
<script setup>
import { ref, h } from 'vue'
import { Tree, Icon } from '@expcat/tigercat-vue'

const treeData = ref([
  {
    key: '1',
    label: 'Folder',
    icon: h(Icon, { name: 'folder' }),
    children: [
      { key: '1-1', label: 'File 1', icon: h(Icon, { name: 'file' }) },
      { key: '1-2', label: 'File 2', icon: h(Icon, { name: 'file' }) }
    ]
  }
])
</script>

<template>
  <Tree :treeData="treeData" />
</template>
```

### React

```tsx
import { Tree, Icon } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    {
      key: '1',
      label: 'Folder',
      icon: <Icon name="folder" />,
      children: [
        { key: '1-1', label: 'File 1', icon: <Icon name="file" /> },
        { key: '1-2', label: 'File 2', icon: <Icon name="file" /> }
      ]
    }
  ]

  return <Tree treeData={treeData} />
}
```

## 禁用节点

通过在节点数据中设置 `disabled` 属性禁用节点。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const treeData = ref([
  {
    key: '1',
    label: 'Parent Node 1',
    children: [
      { key: '1-1', label: 'Child Node 1-1' },
      { key: '1-2', label: 'Child Node 1-2 (Disabled)', disabled: true }
    ]
  }
])
</script>

<template>
  <Tree :treeData="treeData" checkable />
</template>
```

### React

```tsx
import { Tree } from '@expcat/tigercat-react'

function App() {
  const treeData = [
    {
      key: '1',
      label: 'Parent Node 1',
      children: [
        { key: '1-1', label: 'Child Node 1-1' },
        { key: '1-2', label: 'Child Node 1-2 (Disabled)', disabled: true }
      ]
    }
  ]

  return <Tree treeData={treeData} checkable />
}
```

## Block 节点

通过 `blockNode` 属性使节点占据整行宽度。

### Vue 3

```vue
<template>
  <Tree :treeData="treeData" blockNode />
</template>
```

### React

```tsx
<Tree treeData={treeData} blockNode />
```

## API

### Tree Props

| 属性                | 说明                                           | 类型                                         | 默认值      |
| ------------------- | ---------------------------------------------- | -------------------------------------------- | ----------- |
| treeData            | 树形数据                                       | `TreeNode[]`                                 | `[]`        |
| selectionMode       | 选择模式（提供时会覆盖 `selectable/multiple`） | `'none' \| 'single' \| 'multiple'`           | -           |
| checkable           | 是否显示复选框                                 | `boolean`                                    | `false`     |
| showIcon            | 是否显示节点图标（`TreeNode.icon`）            | `boolean`                                    | `true`      |
| showLine            | 是否显示连接线                                 | `boolean`                                    | `false`     |
| defaultExpandedKeys | 默认展开的节点                                 | `(string \| number)[]`                       | `[]`        |
| defaultSelectedKeys | 默认选中的节点                                 | `(string \| number)[]`                       | `[]`        |
| defaultCheckedKeys  | 默认勾选的节点                                 | `(string \| number)[]`                       | `[]`        |
| expandedKeys        | 展开的节点（受控）                             | `(string \| number)[]`                       | -           |
| selectedKeys        | 选中的节点（受控）                             | `(string \| number)[]`                       | -           |
| checkedKeys         | 勾选的节点（受控）                             | `(string \| number)[] \| TreeCheckedState`   | -           |
| defaultExpandAll    | 默认展开所有节点                               | `boolean`                                    | `false`     |
| checkStrictly       | 父子节点选中状态是否独立                       | `boolean`                                    | `false`     |
| checkStrategy       | 勾选策略                                       | `'all' \| 'parent' \| 'child'`               | `'all'`     |
| selectable          | 是否允许选中节点                               | `boolean`                                    | `true`      |
| multiple            | 是否允许多选                                   | `boolean`                                    | `false`     |
| loadData            | 异步加载数据函数                               | `(node: TreeNode) => Promise<TreeNode[]>`    | -           |
| filterValue         | 过滤值                                         | `string`                                     | `''`        |
| filterFn            | 自定义过滤函数                                 | `(value: string, node: TreeNode) => boolean` | -           |
| autoExpandParent    | 过滤时是否自动展开父节点                       | `boolean`                                    | `true`      |
| blockNode           | 节点是否占据整行                               | `boolean`                                    | `false`     |
| emptyText           | 空状态文本                                     | `string`                                     | `'No data'` |
| ariaLabel           | Tree 容器的无障碍标签                          | `string`                                     | `'Tree'`    |

### TreeNode

| 属性     | 说明           | 类型                 | 必填 |
| -------- | -------------- | -------------------- | ---- |
| key      | 唯一标识       | `string \| number`   | ✅   |
| label    | 节点标题       | `string`             | ✅   |
| children | 子节点         | `TreeNode[]`         | -    |
| disabled | 是否禁用       | `boolean`            | -    |
| isLeaf   | 是否为叶子节点 | `boolean`            | -    |
| icon     | 自定义图标     | `VNode \| ReactNode` | -    |

### Tree Events (Vue)

| 事件名              | 说明                | 回调参数                                                                                                                                             |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| expand              | 节点展开/收拢时触发 | `(expandedKeys: (string \| number)[], info: { expanded: boolean, node: TreeNode })`                                                                  |
| select              | 节点选中时触发      | `(selectedKeys: (string \| number)[], info: { selected: boolean, selectedNodes: TreeNode[], node: TreeNode, event: MouseEvent })`                    |
| check               | 节点勾选时触发      | `(checkedKeys: (string \| number)[], info: { checked: boolean, checkedNodes: TreeNode[], node: TreeNode, checkedNodesPositions: TreeCheckedState })` |
| node-click          | 节点点击时触发      | `(node: TreeNode, event: MouseEvent)`                                                                                                                |
| node-expand         | 节点展开时触发      | `(node: TreeNode, key: string \| number)`                                                                                                            |
| node-collapse       | 节点收拢时触发      | `(node: TreeNode, key: string \| number)`                                                                                                            |
| update:expandedKeys | 更新展开的节点      | `(keys: (string \| number)[])`                                                                                                                       |
| update:selectedKeys | 更新选中的节点      | `(keys: (string \| number)[])`                                                                                                                       |
| update:checkedKeys  | 更新勾选的节点      | `(keys: (string \| number)[])`                                                                                                                       |

### Tree Events (React)

| 事件名         | 说明                | 回调参数                                                                                                                                             |
| -------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| onExpand       | 节点展开/收拢时触发 | `(expandedKeys: (string \| number)[], info: { expanded: boolean, node: TreeNode })`                                                                  |
| onSelect       | 节点选中时触发      | `(selectedKeys: (string \| number)[], info: { selected: boolean, selectedNodes: TreeNode[], node: TreeNode, event: React.MouseEvent })`              |
| onCheck        | 节点勾选时触发      | `(checkedKeys: (string \| number)[], info: { checked: boolean, checkedNodes: TreeNode[], node: TreeNode, checkedNodesPositions: TreeCheckedState })` |
| onNodeClick    | 节点点击时触发      | `(node: TreeNode, event: React.MouseEvent)`                                                                                                          |
| onNodeExpand   | 节点展开时触发      | `(node: TreeNode, key: string \| number)`                                                                                                            |
| onNodeCollapse | 节点收拢时触发      | `(node: TreeNode, key: string \| number)`                                                                                                            |

## 样式定制

Tree 组件使用 Tailwind CSS 构建，支持通过 CSS 变量自定义主题颜色。

### 相关 CSS 变量

- `--tiger-primary`: 主题色（选中、高亮等）
- `--tiger-primary-hover`: 主题色悬停态

### 示例

```css
:root {
  --tiger-primary: #10b981;
  --tiger-primary-hover: #059669;
}
```

## 无障碍访问

Tree 组件提供基础 a11y 与键盘交互：

- 语义：容器 `role="tree"`，节点 `role="treeitem"`，并包含 `aria-level`；可展开/可选择/可勾选时分别提供 `aria-expanded / aria-selected / aria-checked`
- 可访问名称：通过 `ariaLabel` 为 Tree 提供可访问名称（默认 `Tree`）

### 键盘

- `Tab`：进入 Tree，聚焦当前可聚焦节点（roving tabindex）
- `ArrowUp/ArrowDown`：在可见节点间移动焦点（跳过 disabled）
- `Home/End`：跳到首/尾可见节点
- `ArrowRight`：展开当前节点；若已展开则移动到第一个子节点
- `ArrowLeft`：收拢当前节点；若已收拢则移动到父节点
- `Enter`：触发选择（可选时）；否则切换展开/收拢
- `Space`：勾选/取消勾选（checkable 时）；否则切换展开/收拢
- `Escape`：优先收拢当前节点；若不可收拢则收拢并聚焦父节点

## 注意事项

1. 确保每个节点的 `key` 属性唯一
2. 懒加载时，设置 `isLeaf: true` 可避免展开图标显示
3. 使用 `checkStrictly` 时，父子节点选中状态互不影响
4. 使用 `filterValue` 进行过滤时，匹配的节点会被高亮显示
5. `checkStrategy` 用于控制返回哪些节点的 key：
   - `'all'`: 返回所有选中的节点
   - `'parent'`: 仅返回父节点（当所有子节点都选中时）
   - `'child'`: 仅返回子节点（叶子节点）
