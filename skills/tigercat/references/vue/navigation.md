---
name: tigercat-vue-navigation
description: Vue navigation components usage
---

# Navigation Components (Vue)

导航组件：Breadcrumb, Dropdown, Menu, Pagination, Steps, Tabs, Tree, BackTop, Anchor

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

---

## BackTop 回到顶部

```vue
<template>
  <!-- 基础用法 -->
  <BackTop />

  <!-- 自定义显示高度 -->
  <BackTop :visibility-height="200" />

  <!-- 自定义滚动目标 -->
  <BackTop :target="() => $refs.scrollContainer" />

  <!-- 自定义内容 -->
  <BackTop>
    <div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white">
      ↑
    </div>
  </BackTop>
</template>
```

---

## Anchor 锚点导航

```vue
<template>
  <!-- 基础用法 -->
  <Anchor>
    <AnchorLink href="#section1" title="Section 1" />
    <AnchorLink href="#section2" title="Section 2" />
    <AnchorLink href="#section3" title="Section 3" />
  </Anchor>

  <!-- 横向导航 -->
  <Anchor direction="horizontal">
    <AnchorLink href="#intro" title="Introduction" />
    <AnchorLink href="#api" title="API" />
    <AnchorLink href="#examples" title="Examples" />
  </Anchor>

  <!-- 固定定位并显示指示器 -->
  <Anchor :affix="true" :offset-top="80" :show-ink-in-fixed="true">
    <AnchorLink href="#overview" title="Overview" />
    <AnchorLink href="#features" title="Features" />
  </Anchor>

  <!-- 自定义滚动容器 -->
  <div ref="containerRef" class="h-96 overflow-auto">
    <Anchor :get-container="() => containerRef">
      <AnchorLink href="#part1" title="Part 1" />
      <AnchorLink href="#part2" title="Part 2" />
    </Anchor>
  </div>

  <!-- 监听事件 -->
  <Anchor @click="handleClick" @change="handleChange">
    <AnchorLink href="#section1" title="Section 1" />
    <AnchorLink href="#section2" title="Section 2" />
  </Anchor>
</template>

<script setup>
import { ref } from 'vue'
import { Anchor, AnchorLink } from '@expcat/tigercat-vue'

const containerRef = ref(null)

const handleClick = (e, href) => {
  console.log('Clicked:', href)
}

const handleChange = (activeLink) => {
  console.log('Active link changed:', activeLink)
}
</script>
```
