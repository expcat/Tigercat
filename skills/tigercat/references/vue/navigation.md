---
name: tigercat-vue-navigation
description: Vue navigation components usage
---

# Navigation Components (Vue)

导航组件：Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree

> **Props Reference**: [shared/props/navigation.md](../shared/props/navigation.md)

---

## Breadcrumb 面包屑

```vue
<template>
  <Breadcrumb :items="[{ label: 'Home', path: '/' }, { label: 'Products', path: '/products' }, { label: 'Detail' }]" separator="/" />
</template>
```

---

## Dropdown 下拉菜单

```vue
<template>
  <Dropdown :items="[{ key: 'edit', label: 'Edit' }, { key: 'delete', label: 'Delete' }]" @select="onSelect">
    <Button>Actions</Button>
  </Dropdown>
</template>
```

---

## Menu 菜单

```vue
<template>
  <Menu v-model:selected-keys="selectedKeys" :items="menuItems" mode="horizontal" />
  <Menu v-model:selected-keys="selectedKeys" v-model:open-keys="openKeys" :items="menuItems" mode="vertical" collapsed />
</template>
<script setup>
const selectedKeys = ref(['home'])
const openKeys = ref(['sub1'])
const menuItems = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'sub1', label: 'Sub Menu', children: [
    { key: 'opt1', label: 'Option 1' },
    { key: 'opt2', label: 'Option 2' }
  ]}
]
</script>
```

---

## Tabs 标签页

```vue
<template>
  <Tabs v-model="activeKey" :items="[{ key: 'tab1', label: 'Tab 1' }, { key: 'tab2', label: 'Tab 2' }]">
    <template #tab1>Tab 1 content</template>
    <template #tab2>Tab 2 content</template>
  </Tabs>
  <Tabs v-model="activeKey" type="card" addable closable @add="onAdd" @close="onClose" />
</template>
```

---

## Pagination 分页

```vue
<template>
  <Pagination v-model:current="page" v-model:page-size="pageSize" :total="100" show-size-changer show-quick-jumper />
</template>
```

---

## Steps 步骤条

```vue
<template>
  <Steps v-model:current="step" :items="[{ title: 'Step 1' }, { title: 'Step 2' }, { title: 'Step 3' }]" />
  <Steps direction="vertical" :items="items" />
</template>
```

---

## Tree 树形控件

```vue
<template>
  <Tree :data="treeData" v-model:expanded-keys="expandedKeys" v-model:checked-keys="checkedKeys" checkable />
</template>
<script setup>
const expandedKeys = ref(['node1'])
const checkedKeys = ref([])
const treeData = [
  { key: 'node1', label: 'Node 1', children: [
    { key: 'node1-1', label: 'Child 1' }
  ]}
]
</script>
```
