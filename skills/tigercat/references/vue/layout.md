---
name: tigercat-vue-layout
description: Vue 3 layout components usage
---

# Layout Components (Vue 3)

布局组件：Card, Container, Descriptions, Divider, Grid, Layout, List, Skeleton, Space

> **Props Reference**: [shared/props/layout.md](../shared/props/layout.md)

---

## Card 卡片

```vue
<template>
  <!-- 基本用法 -->
  <Card>
    <p>基础卡片内容</p>
  </Card>

  <!-- 变体 -->
  <Card variant="bordered">粗边框</Card>
  <Card variant="shadow">带阴影</Card>
  <Card variant="elevated">浮起</Card>

  <!-- 尺寸 -->
  <Card size="sm">紧凑</Card>
  <Card size="lg">宽松</Card>

  <!-- 悬停效果 -->
  <Card hoverable variant="shadow">可交互卡片</Card>

  <!-- 封面图片 -->
  <Card cover="/img.jpg" cover-alt="描述">
    <p>带封面的卡片</p>
  </Card>

  <!-- 完整结构（header / footer / actions） -->
  <Card variant="shadow" hoverable>
    <template #header>
      <h3>标题</h3>
    </template>
    <p>主体内容</p>
    <template #footer>
      <span>底部信息</span>
    </template>
    <template #actions>
      <Button size="sm">操作</Button>
    </template>
  </Card>
</template>
```

---

## Container 容器

```vue
<template>
  <Container width="1200px" padding="24px">
    <p>Centered content</p>
  </Container>
</template>
```

---

## Divider 分割线

```vue
<template>
  <!-- 基础水平分割线 -->
  <Divider />

  <!-- 线条样式 -->
  <Divider line-style="dashed" />
  <Divider line-style="dotted" />

  <!-- 间距 -->
  <Divider spacing="none" />
  <Divider spacing="xs" />
  <Divider spacing="lg" />

  <!-- 自定义颜色与粗细 -->
  <Divider color="#2563eb" thickness="2px" />

  <!-- 垂直分割线 -->
  <div class="flex items-center h-12">
    <span>Left</span>
    <Divider orientation="vertical" class="h-6" />
    <span>Right</span>
  </div>
</template>
```

---

## Grid 栅格（Row + Col）

```vue
<template>
  <!-- 基础 24 分栏 -->
  <Row :gutter="16">
    <Col :span="8">A</Col>
    <Col :span="8">B</Col>
    <Col :span="8">C</Col>
  </Row>

  <!-- 响应式 -->
  <Row :gutter="[16, 16]">
    <Col :span="{ xs: 24, md: 12, lg: 8 }">1</Col>
    <Col :span="{ xs: 24, md: 12, lg: 8 }">2</Col>
    <Col :span="{ xs: 24, md: 12, lg: 8 }">3</Col>
  </Row>

  <!-- 对齐与分布 -->
  <Row justify="space-between" align="middle">
    <Col :span="6">A</Col>
    <Col :span="6">B</Col>
  </Row>

  <!-- 偏移与排序 -->
  <Row :gutter="16">
    <Col :span="8" :offset="4">offset=4</Col>
    <Col :span="8" :order="{ xs: 2, md: 1 }">order</Col>
  </Row>

  <!-- Flex 自适应 -->
  <Row :gutter="16">
    <Col :span="0" :flex="1">auto</Col>
    <Col :span="0" flex="0_0_200px">fixed</Col>
  </Row>
</template>
```

---

## Layout 布局

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Layout, Header, Sidebar, Content, Footer } from '@expcat/tigercat-vue'

const collapsed = ref(false)
</script>

<template>
  <!-- 基础布局 -->
  <Layout>
    <Header>Header</Header>
    <Content>Main</Content>
    <Footer>Footer</Footer>
  </Layout>

  <!-- 侧边栏布局 -->
  <Layout>
    <Header>Header</Header>
    <div class="flex flex-1">
      <Sidebar width="256px">Sidebar</Sidebar>
      <Content>Main</Content>
    </div>
    <Footer>Footer</Footer>
  </Layout>

  <!-- 可折叠侧边栏 -->
  <Layout>
    <Header>Header</Header>
    <div class="flex flex-1">
      <Sidebar width="256px" :collapsed="collapsed">Sidebar</Sidebar>
      <Content>Main</Content>
    </div>
    <Footer>Footer</Footer>
  </Layout>

  <!-- Mini 模式侧边栏（折叠后保留 64px 宽） -->
  <Layout>
    <Header>Header</Header>
    <div class="flex flex-1">
      <Sidebar width="256px" collapsed-width="64px" :collapsed="collapsed">
        <Menu mode="inline" :collapsed="collapsed" :items="menuItems" />
      </Sidebar>
      <Content>Main</Content>
    </div>
  </Layout>
</template>
```

### Admin 后台布局（组合示例）

使用 `Layout` + `Sidebar` + `Menu` 组合搭建典型后台管理页面。不需要额外的 AdminLayout 组件。

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Layout, Header, Sidebar, Content, Footer, Menu, Button } from '@expcat/tigercat-vue'
import type { MenuItem } from '@expcat/tigercat-core'

const collapsed = ref(false)

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: '仪表盘', icon: '📊' },
  {
    key: 'users',
    label: '用户管理',
    icon: '👥',
    children: [
      { key: 'user-list', label: '用户列表' },
      { key: 'user-roles', label: '角色权限' }
    ]
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: '⚙️',
    children: [
      { key: 'general', label: '通用设置' },
      {
        key: 'advanced',
        label: '高级设置',
        children: [
          { key: 'cache', label: '缓存管理' },
          { key: 'logs', label: '日志查看' }
        ]
      }
    ]
  }
]

const activeKey = ref('dashboard')
</script>

<template>
  <Layout class="h-screen">
    <!-- 顶部导航 -->
    <Header class="flex items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <Button size="sm" variant="ghost" @click="collapsed = !collapsed"> ☰ </Button>
        <span class="text-lg font-bold">Admin</span>
      </div>
      <div>用户头像</div>
    </Header>

    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏（支持 mini 模式折叠） -->
      <Sidebar width="256px" collapsed-width="64px" :collapsed="collapsed" class="overflow-y-auto">
        <Menu
          mode="inline"
          :collapsed="collapsed"
          :items="menuItems"
          :selected-keys="[activeKey]"
          @select="(key) => (activeKey = key)" />
      </Sidebar>

      <!-- 主内容区 -->
      <Content class="overflow-y-auto p-6">
        <router-view />
      </Content>
    </div>

    <Footer class="text-center text-sm text-gray-500"> © 2025 My App </Footer>
  </Layout>
</template>
```

**要点：**

- `Sidebar` 的 `collapsed-width="64px"` 实现 mini 模式，折叠后仍显示图标
- `Menu` 的 `:collapsed="collapsed"` 同步折叠状态，inline 模式自动切换为 popup
- 支持 3+ 层嵌套子菜单（如 设置 → 高级设置 → 缓存管理）

---

## Space 间距

```vue
<template>
  <Space><Button>A</Button><Button>B</Button></Space>
  <Space direction="vertical" size="lg"
    ><div>1</div>
    <div>2</div></Space
  >
  <Space :size="24"
    ><div>Custom 24px gap</div>
    <div>Item</div></Space
  >
  <Space align="center"
    ><div class="h-10">Short</div>
    <div class="h-16">Tall</div></Space
  >
  <Space wrap
    ><Button v-for="i in 10" :key="i">{{ i }}</Button></Space
  >
</template>
```

---

## List 列表

```vue
<script setup>
import { List } from '@expcat/tigercat-vue'

const data = [
  { key: 1, title: '列表项 1', description: '描述信息' },
  { key: 2, title: '列表项 2', description: '描述信息' }
]
</script>

<template>
  <!-- 基本用法 -->
  <List :dataSource="data" />

  <!-- 自定义渲染 + 头尾 + hoverable -->
  <List
    :dataSource="data"
    size="sm"
    bordered="bordered"
    hoverable
    @item-click="(item, i) => console.log(item, i)">
    <template #header>标题</template>
    <template #renderItem="{ item }">
      <span>{{ item.title }}</span>
    </template>
    <template #footer>底部</template>
  </List>

  <!-- 网格布局 -->
  <List :dataSource="data" :grid="{ column: 3, gutter: 16 }" bordered="none">
    <template #renderItem="{ item }">
      <Card>{{ item.title }}</Card>
    </template>
  </List>
</template>
```

---

## Descriptions 描述列表

```vue
<template>
  <Descriptions :items="[{ label: 'Name', value: 'John' }]" :columns="2" />
</template>
```

---

## Skeleton 骨架屏

```vue
<template>
  <!-- 基本用法 -->
  <Skeleton />

  <!-- 变体 -->
  <Skeleton variant="avatar" shape="circle" />
  <Skeleton variant="image" />
  <Skeleton variant="button" />
  <Skeleton variant="custom" width="300px" height="150px" />

  <!-- 动画 -->
  <Skeleton animation="wave" />
  <Skeleton animation="none" />

  <!-- 多行文本 -->
  <Skeleton variant="text" :rows="3" />

  <!-- 段落模式（行宽自动变化） -->
  <Skeleton variant="text" :rows="4" paragraph />

  <!-- 自定义尺寸 -->
  <Skeleton width="200px" height="50px" />

  <!-- 组合使用 -->
  <div class="flex items-start gap-4">
    <Skeleton variant="avatar" />
    <div class="flex-1">
      <Skeleton variant="text" width="150px" class="mb-2" />
      <Skeleton variant="text" :rows="2" paragraph />
    </div>
  </div>
</template>
```
