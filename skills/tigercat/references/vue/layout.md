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
</template>
```

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
<template>
  <List :items="items" row-key="id" split>
    <template #default="{ item }">
      <div>{{ item.title }}</div>
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
  <Skeleton :loading="loading" :rows="3" animated>
    <p>Loaded content</p>
  </Skeleton>
</template>
```
