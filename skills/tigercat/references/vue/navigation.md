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
  <!-- 基本用法 -->
  <Breadcrumb>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- 箭头分隔符 -->
  <Breadcrumb separator="arrow">
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- 带图标 -->
  <Breadcrumb>
    <BreadcrumbItem href="/" :icon="homeIcon">首页</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- extra 扩展区 -->
  <Breadcrumb>
    <template #extra>
      <Button size="small">编辑</Button>
    </template>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- 外部链接 -->
  <Breadcrumb>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="https://github.com" target="_blank">GitHub</BreadcrumbItem>
    <BreadcrumbItem current>当前页面</BreadcrumbItem>
  </Breadcrumb>

  <!-- 单独设置分隔符 -->
  <Breadcrumb>
    <BreadcrumbItem href="/" separator="arrow">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products" separator="chevron">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
<script setup>
import { h } from 'vue'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-vue'

const homeIcon = h('svg', { class: 'w-4 h-4', fill: 'currentColor', viewBox: '0 0 20 20' }, [
  h('path', { d: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z' })
])
</script>
```

---

## Dropdown 下拉菜单

```vue
<template>
  <!-- 基本用法（悬浮触发） -->
  <Dropdown>
    <Button>操作</Button>
    <DropdownMenu>
      <DropdownItem @click="handleEdit">编辑</DropdownItem>
      <DropdownItem @click="handleCopy">复制</DropdownItem>
      <DropdownItem divided @click="handleDelete">删除</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <!-- 点击触发 -->
  <Dropdown trigger="click">
    <Button>点击打开</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
      <DropdownItem>菜单项 2</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <!-- 受控模式 -->
  <Dropdown v-model:visible="visible">
    <Button>受控</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <!-- 无箭头 -->
  <Dropdown :show-arrow="false">
    <Button>无箭头</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <!-- 禁用 + 部分禁用 -->
  <Dropdown disabled>
    <Button disabled>禁用</Button>
    <DropdownMenu>
      <DropdownItem>菜单项 1</DropdownItem>
    </DropdownMenu>
  </Dropdown>
  <Dropdown>
    <Button>部分禁用</Button>
    <DropdownMenu>
      <DropdownItem>编辑</DropdownItem>
      <DropdownItem disabled>删除（已禁用）</DropdownItem>
    </DropdownMenu>
  </Dropdown>

  <!-- 点击不关闭 -->
  <Dropdown :close-on-click="false" trigger="click">
    <Button>点击不关闭</Button>
    <DropdownMenu>
      <DropdownItem>多选项 1</DropdownItem>
      <DropdownItem>多选项 2</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>
<script setup>
import { ref } from 'vue'
import { Dropdown, DropdownMenu, DropdownItem, Button } from '@expcat/tigercat-vue'

const visible = ref(false)
const handleEdit = () => console.log('edit')
const handleCopy = () => console.log('copy')
const handleDelete = () => console.log('delete')
</script>
```

---

## Menu 菜单

```vue
<template>
  <!-- 基本垂直菜单 -->
  <Menu v-model:selected-keys="selectedKeys">
    <MenuItem itemKey="home">首页</MenuItem>
    <MenuItem itemKey="products">产品</MenuItem>
    <MenuItem itemKey="about" disabled>关于</MenuItem>
  </Menu>

  <!-- 水平菜单 -->
  <Menu mode="horizontal" v-model:selected-keys="selectedKeys">
    <MenuItem itemKey="home">首页</MenuItem>
    <MenuItem itemKey="products">产品</MenuItem>
  </Menu>

  <!-- 带子菜单 -->
  <Menu v-model:selected-keys="selectedKeys" v-model:open-keys="openKeys">
    <SubMenu itemKey="sub1" title="导航一" :icon="homeIcon">
      <MenuItem itemKey="1">选项 1</MenuItem>
      <MenuItem itemKey="2">选项 2</MenuItem>
    </SubMenu>
    <MenuItem itemKey="3">导航二</MenuItem>
  </Menu>

  <!-- 内联模式 + 自定义缩进 -->
  <Menu mode="inline" :inline-indent="32" v-model:selected-keys="selectedKeys" v-model:open-keys="openKeys">
    <SubMenu itemKey="sub1" title="分类一">
      <MenuItem itemKey="1">子项 1</MenuItem>
      <SubMenu itemKey="sub1-1" title="分类一-一">
        <MenuItem itemKey="1-1">深层子项</MenuItem>
      </SubMenu>
    </SubMenu>
  </Menu>

  <!-- 折叠菜单 -->
  <Menu mode="vertical" :collapsed="collapsed" v-model:selected-keys="selectedKeys">
    <MenuItem itemKey="1" :icon="homeIcon">首页</MenuItem>
    <SubMenu itemKey="sub1" title="设置" :icon="settingsIcon">
      <MenuItem itemKey="2">常规</MenuItem>
    </SubMenu>
  </Menu>

  <!-- 暗色主题 -->
  <Menu theme="dark" v-model:selected-keys="selectedKeys">
    <MenuItem itemKey="1">菜单项 1</MenuItem>
    <MenuItem itemKey="2">菜单项 2</MenuItem>
  </Menu>

  <!-- 单一展开模式（multiple=false） -->
  <Menu :multiple="false" v-model:selected-keys="selectedKeys" v-model:open-keys="openKeys">
    <SubMenu itemKey="sub1" title="导航一">
      <MenuItem itemKey="1">选项 1</MenuItem>
    </SubMenu>
    <SubMenu itemKey="sub2" title="导航二">
      <MenuItem itemKey="2">选项 2</MenuItem>
    </SubMenu>
  </Menu>

  <!-- 分组菜单 -->
  <Menu>
    <MenuItemGroup title="分组一">
      <MenuItem itemKey="1">选项 1</MenuItem>
      <MenuItem itemKey="2">选项 2</MenuItem>
    </MenuItemGroup>
    <MenuItemGroup title="分组二">
      <MenuItem itemKey="3">选项 3</MenuItem>
    </MenuItemGroup>
  </Menu>
</template>
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu, MenuItemGroup } from '@expcat/tigercat-vue'

const selectedKeys = ref(['home'])
const openKeys = ref(['sub1'])
const collapsed = ref(false)
</script>
```

---

## Tabs 标签页

```vue
<template>
  <!-- 基本用法 -->
  <Tabs v-model:activeKey="activeKey">
    <TabPane tabKey="1" label="标签 1">内容 1</TabPane>
    <TabPane tabKey="2" label="标签 2">内容 2</TabPane>
  </Tabs>

  <!-- 卡片式 -->
  <Tabs v-model:activeKey="activeKey" type="card">
    <TabPane tabKey="1" label="标签 1">内容 1</TabPane>
  </Tabs>

  <!-- 可编辑卡片（新增/删除） -->
  <Tabs v-model:activeKey="activeKey" type="editable-card" closable @edit="handleEdit">
    <TabPane v-for="tab in tabs" :key="tab.key" :tabKey="tab.key" :label="tab.label">
      {{ tab.content }}
    </TabPane>
  </Tabs>

  <!-- 位置 / 居中 / 尺寸 -->
  <Tabs v-model:activeKey="activeKey" tabPosition="left" />
  <Tabs v-model:activeKey="activeKey" centered />
  <Tabs v-model:activeKey="activeKey" size="small" />

  <!-- 销毁非激活面板 -->
  <Tabs v-model:activeKey="activeKey" destroyInactiveTabPane>
    <TabPane tabKey="1" label="标签 1">仅激活时渲染</TabPane>
  </Tabs>
</template>
```

---

## Pagination 分页

```vue
<template>
  <!-- 基本用法 -->
  <Pagination v-model:current="page" :total="100" :pageSize="10" />

  <!-- 完整功能：条数选择 + 快速跳页 -->
  <Pagination v-model:current="page" v-model:pageSize="pageSize" :total="500"
    showSizeChanger showQuickJumper @change="handleChange" @page-size-change="handleSizeChange" />

  <!-- 简洁模式 -->
  <Pagination v-model:current="page" :total="500" simple />

  <!-- 三种尺寸 -->
  <Pagination v-model:current="page" :total="100" size="small" />
  <Pagination v-model:current="page" :total="100" size="medium" />
  <Pagination v-model:current="page" :total="100" size="large" />

  <!-- 对齐方式 -->
  <Pagination v-model:current="page" :total="100" align="left" />
  <Pagination v-model:current="page" :total="100" align="right" />

  <!-- 禁用 / 单页隐藏 / 紧凑页码 -->
  <Pagination v-model:current="page" :total="100" disabled />
  <Pagination v-model:current="page" :total="5" hideOnSinglePage />
  <Pagination v-model:current="page" :total="500" showLessItems />

  <!-- 自定义总条数文本 -->
  <Pagination v-model:current="page" :total="100" :totalText="(total, range) => `${range[0]}-${range[1]} / ${total}`" />

  <!-- 国际化 -->
  <Pagination v-model:current="page" :total="500" :locale="{ pagination: customLabels }" showQuickJumper showSizeChanger />
</template>
```

---

## Steps 步骤条

```vue
<template>
  <!-- 基本用法 -->
  <Steps v-model:current="step">
    <StepsItem title="Step 1" description="Description" />
    <StepsItem title="Step 2" description="Description" />
    <StepsItem title="Step 3" description="Description" />
  </Steps>

  <!-- 纵向 / 简洁 / 小尺寸 / 可点击 -->
  <Steps :current="0" direction="vertical">...</Steps>
  <Steps :current="0" simple>...</Steps>
  <Steps :current="0" size="small">...</Steps>
  <Steps v-model:current="step" clickable>...</Steps>

  <!-- 自定义图标 -->
  <StepsItem title="Login">
    <template #icon><MyIcon /></template>
  </StepsItem>

  <!-- 禁用步骤 -->
  <StepsItem title="Disabled" disabled />

  <!-- 覆盖步骤状态 -->
  <StepsItem title="Error" status="error" />
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

  <!-- 自定义动画时长 -->
  <BackTop :duration="800" />

  <!-- 自定义滚动目标 -->
  <BackTop :target="() => $refs.scrollContainer" />

  <!-- 自定义内容 -->
  <BackTop>
    <div class="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white">
      ↑
    </div>
  </BackTop>

  <!-- 点击事件 -->
  <BackTop @click="handleClick" />
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
