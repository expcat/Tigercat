---
name: tigercat-vue-layout
description: Vue 3 layout components usage
---

# Layout Components (Vue 3)

布局组件：Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space

> **Props Reference**: [shared/props/layout.md](../shared/props/layout.md)

---

## Card 卡片

```vue
<template>
  <Card title="Title"><p>Content</p></Card>
  <Card title="With Actions" bordered shadow="hover">
    <template #extra><Button size="sm">Edit</Button></template>
    <p>Content</p>
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

## Grid 栅格

```vue
<template>
  <Grid :cols="3" gap="16px">
    <div>Col 1</div><div>Col 2</div><div>Col 3</div>
  </Grid>
  <Grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4 }" gap="16px">
    <div v-for="i in 8" :key="i">Item {{ i }}</div>
  </Grid>
</template>
```

---

## Layout 布局

```vue
<template>
  <Layout>
    <Layout.Header>Header</Layout.Header>
    <Layout>
      <Layout.Sider width="200px">Sidebar</Layout.Sider>
      <Layout.Content>Main</Layout.Content>
    </Layout>
    <Layout.Footer>Footer</Layout.Footer>
  </Layout>
</template>
```

---

## Space 间距

```vue
<template>
  <Space><Button>A</Button><Button>B</Button></Space>
  <Space direction="vertical" size="lg"><div>1</div><div>2</div></Space>
  <Space wrap><Button v-for="i in 10" :key="i">{{ i }}</Button></Space>
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
