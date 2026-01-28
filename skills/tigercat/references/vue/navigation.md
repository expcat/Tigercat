---
name: tigercat-vue-navigation
description: Vue 3 navigation components - Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree
---

# Navigation Components (Vue 3)

导航组件：Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree

## Breadcrumb 面包屑

```vue
<script setup>
import { Breadcrumb } from '@expcat/tigercat-vue'

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Detail' }
]
</script>

<template>
  <Breadcrumb :items="items" />
  <Breadcrumb :items="items" separator=">" />
</template>
```

**Props:**

| Prop      | Type                                 | Default | Description |
| --------- | ------------------------------------ | ------- | ----------- |
| items     | `{ label: string, href?: string }[]` | `[]`    | 层级数据    |
| separator | `string`                             | `'/'`   | 分隔符      |

---

## Dropdown 下拉菜单

```vue
<script setup>
import { Dropdown, Button } from '@expcat/tigercat-vue'

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete', danger: true },
  { type: 'divider' },
  { key: 'more', label: 'More', disabled: true }
]

const handleSelect = (key) => {
  console.log('Selected:', key)
}
</script>

<template>
  <Dropdown :items="items" @select="handleSelect">
    <Button>Actions <span>▼</span></Button>
  </Dropdown>

  <Dropdown :items="items" trigger="click">
    <Button>Click me</Button>
  </Dropdown>

  <Dropdown :items="items" placement="bottom-end">
    <Button>Bottom End</Button>
  </Dropdown>
</template>
```

**Props:**

| Prop      | Type                                         | Default          | Description |
| --------- | -------------------------------------------- | ---------------- | ----------- |
| items     | `DropdownItem[]`                             | `[]`             | 菜单项      |
| trigger   | `'hover' \| 'click'`                         | `'hover'`        | 触发方式    |
| placement | `'bottom-start' \| 'bottom' \| 'bottom-end'` | `'bottom-start'` | 弹出位置    |
| disabled  | `boolean`                                    | `false`          | 禁用        |

**Events:** `@select(key: string)`

---

## Menu 菜单

```vue
<script setup>
import { ref } from 'vue'
import { Menu } from '@expcat/tigercat-vue'

const activeKey = ref('home')
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
</script>

<template>
  <!-- Vertical menu (sidebar) -->
  <Menu v-model:active-key="activeKey" :items="items" @select="handleSelect" />

  <!-- Horizontal menu -->
  <Menu v-model:active-key="activeKey" :items="items" mode="horizontal" />

  <!-- Collapsed menu -->
  <Menu v-model:active-key="activeKey" :items="items" collapsed />
</template>
```

**Props:**

| Prop      | Type                         | Default      | Description          |
| --------- | ---------------------------- | ------------ | -------------------- |
| activeKey | `string`                     | -            | 当前选中项 (v-model) |
| items     | `MenuItem[]`                 | `[]`         | 菜单数据             |
| mode      | `'vertical' \| 'horizontal'` | `'vertical'` | 模式                 |
| collapsed | `boolean`                    | `false`      | 折叠状态             |

**Events:** `@select(key: string)`, `@update:active-key`

---

## Tabs 标签页

```vue
<script setup>
import { ref } from 'vue'
import { Tabs } from '@expcat/tigercat-vue'

const activeTab = ref('tab1')
const items = [
  { key: 'tab1', label: 'Tab 1' },
  { key: 'tab2', label: 'Tab 2' },
  { key: 'tab3', label: 'Tab 3', disabled: true }
]
</script>

<template>
  <Tabs v-model="activeTab" :items="items">
    <template #tab1>
      <p>Content of Tab 1</p>
    </template>
    <template #tab2>
      <p>Content of Tab 2</p>
    </template>
  </Tabs>

  <!-- Card style -->
  <Tabs v-model="activeTab" :items="items" type="card" />

  <!-- Closable -->
  <Tabs v-model="activeTab" :items="items" closable @close="handleClose" />
</template>
```

**Props:**

| Prop       | Type                                                   | Default  | Description            |
| ---------- | ------------------------------------------------------ | -------- | ---------------------- |
| modelValue | `string`                                               | -        | 当前激活 key (v-model) |
| items      | `{ key: string, label: string, disabled?: boolean }[]` | `[]`     | 标签项                 |
| type       | `'line' \| 'card'`                                     | `'line'` | 样式类型               |
| closable   | `boolean`                                              | `false`  | 可关闭                 |

**Events:** `@update:modelValue`, `@change`, `@close(key: string)`

---

## Pagination 分页

```vue
<script setup>
import { ref } from 'vue'
import { Pagination } from '@expcat/tigercat-vue'
import { ZH_CN_PAGINATION_LABELS } from '@expcat/tigercat-core'

const page = ref(1)
const pageSize = ref(10)
</script>

<template>
  <Pagination v-model:page="page" :total="100" />

  <Pagination
    v-model:page="page"
    v-model:page-size="pageSize"
    :total="200"
    :page-sizes="[10, 20, 50, 100]"
    show-size-changer
    show-quick-jumper />

  <!-- i18n -->
  <Pagination v-model:page="page" :total="100" :locale="{ pagination: ZH_CN_PAGINATION_LABELS }" />
</template>
```

**Props:**

| Prop            | Type                               | Default          | Description                  |
| --------------- | ---------------------------------- | ---------------- | ---------------------------- |
| page            | `number`                           | `1`              | 当前页 (v-model:page)        |
| pageSize        | `number`                           | `10`             | 每页条数 (v-model:page-size) |
| total           | `number`                           | `0`              | 总条数                       |
| pageSizes       | `number[]`                         | `[10,20,50,100]` | 每页条数选项                 |
| showSizeChanger | `boolean`                          | `false`          | 显示条数选择                 |
| showQuickJumper | `boolean`                          | `false`          | 显示快速跳转                 |
| locale          | `{ pagination: PaginationLocale }` | -                | 国际化                       |

**Events:** `@update:page`, `@update:page-size`, `@change`

---

## Steps 步骤条

```vue
<script setup>
import { ref } from 'vue'
import { Steps } from '@expcat/tigercat-vue'

const current = ref(1)
const items = [
  { title: 'Step 1', description: 'Description' },
  { title: 'Step 2', description: 'Description' },
  { title: 'Step 3', description: 'Description' }
]
</script>

<template>
  <Steps :current="current" :items="items" />

  <!-- Vertical -->
  <Steps :current="current" :items="items" direction="vertical" />

  <!-- With status -->
  <Steps :current="current" :items="items" status="error" />
</template>
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

```vue
<script setup>
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue'

const expandedKeys = ref(['1'])
const checkedKeys = ref([])
const selectedKeys = ref([])

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
</script>

<template>
  <!-- Basic -->
  <Tree :data="data" v-model:expanded-keys="expandedKeys" />

  <!-- Checkable -->
  <Tree :data="data" checkable v-model:checked-keys="checkedKeys" />

  <!-- Selectable -->
  <Tree :data="data" selectable v-model:selected-keys="selectedKeys" @select="handleSelect" />

  <!-- Default expand all -->
  <Tree :data="data" default-expand-all />
</template>
```

**Props:**

| Prop             | Type         | Default | Description          |
| ---------------- | ------------ | ------- | -------------------- |
| data             | `TreeNode[]` | `[]`    | 树形数据             |
| expandedKeys     | `string[]`   | `[]`    | 展开的节点 (v-model) |
| checkedKeys      | `string[]`   | `[]`    | 选中的节点 (v-model) |
| selectedKeys     | `string[]`   | `[]`    | 选择的节点 (v-model) |
| checkable        | `boolean`    | `false` | 显示复选框           |
| selectable       | `boolean`    | `false` | 可选择               |
| defaultExpandAll | `boolean`    | `false` | 默认展开所有         |

**Events:** `@expand(keys, { node, expanded })`, `@check(keys, { node, checked })`, `@select(keys, { node, selected })`
