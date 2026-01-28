---
name: tigercat-vue-layout
description: Vue 3 layout components - Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space
---

# Layout Components (Vue 3)

布局组件：Card, Container, Descriptions, Grid, Layout, List, Skeleton, Space

## Card 卡片

```vue
<script setup>
import { Card, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Card title="Card Title">
    <p>Card content</p>
  </Card>

  <Card title="With Actions" bordered shadow="hover">
    <template #extra>
      <Button size="sm">Edit</Button>
    </template>
    <p>Content with header actions</p>
  </Card>

  <Card>
    <template #header>
      <div class="flex justify-between">
        <span>Custom Header</span>
        <Button size="sm" variant="ghost">More</Button>
      </div>
    </template>
    <p>Content</p>
  </Card>
</template>
```

**Props:**

| Prop     | Type                             | Default    | Description  |
| -------- | -------------------------------- | ---------- | ------------ |
| title    | `string`                         | -          | 标题         |
| bordered | `boolean`                        | `true`     | 显示边框     |
| shadow   | `'always' \| 'hover' \| 'never'` | `'always'` | 阴影显示方式 |

**Slots:** `default`, `header`, `extra`

---

## Container 容器

```vue
<script setup>
import { Container } from '@expcat/tigercat-vue'
</script>

<template>
  <Container width="1200px" padding="24px">
    <p>Centered content with max-width</p>
  </Container>
</template>
```

**Props:**

| Prop    | Type               | Default | Description |
| ------- | ------------------ | ------- | ----------- |
| width   | `string \| number` | -       | 最大宽度    |
| padding | `string \| number` | -       | 内边距      |

---

## Grid 栅格

```vue
<script setup>
import { Grid } from '@expcat/tigercat-vue'
</script>

<template>
  <Grid :cols="3" gap="16px">
    <div>Column 1</div>
    <div>Column 2</div>
    <div>Column 3</div>
  </Grid>

  <!-- Responsive -->
  <Grid :cols="{ xs: 1, sm: 2, md: 3, lg: 4 }" gap="16px">
    <div v-for="i in 8" :key="i">Item {{ i }}</div>
  </Grid>
</template>
```

**Props:**

| Prop | Type                                    | Default | Description |
| ---- | --------------------------------------- | ------- | ----------- |
| cols | `number \| { xs?, sm?, md?, lg?, xl? }` | `1`     | 列数        |
| gap  | `string \| number`                      | `0`     | 间距        |

---

## Layout 布局

```vue
<script setup>
import { Layout } from '@expcat/tigercat-vue'
const { Header, Sider, Content, Footer } = Layout
</script>

<template>
  <Layout>
    <Header>Header</Header>
    <Layout>
      <Sider width="200px">Sidebar</Sider>
      <Content>Main Content</Content>
    </Layout>
    <Footer>Footer</Footer>
  </Layout>
</template>
```

**Layout Props:**

| Prop | Type                         | Default      | Description |
| ---- | ---------------------------- | ------------ | ----------- |
| mode | `'horizontal' \| 'vertical'` | `'vertical'` | 布局模式    |

**Sider Props:**

| Prop           | Type               | Default | Description |
| -------------- | ------------------ | ------- | ----------- |
| width          | `string \| number` | `200`   | 宽度        |
| collapsed      | `boolean`          | `false` | 折叠状态    |
| collapsedWidth | `number`           | `80`    | 折叠宽度    |

---

## Space 间距

```vue
<script setup>
import { Space, Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Space>
    <Button>Button 1</Button>
    <Button>Button 2</Button>
    <Button>Button 3</Button>
  </Space>

  <Space direction="vertical" size="lg">
    <div>Item 1</div>
    <div>Item 2</div>
  </Space>

  <Space wrap>
    <Button v-for="i in 10" :key="i">Button {{ i }}</Button>
  </Space>
</template>
```

**Props:**

| Prop      | Type                                         | Default        | Description |
| --------- | -------------------------------------------- | -------------- | ----------- |
| direction | `'horizontal' \| 'vertical'`                 | `'horizontal'` | 方向        |
| size      | `'sm' \| 'md' \| 'lg' \| number`             | `'md'`         | 间距大小    |
| wrap      | `boolean`                                    | `false`        | 自动换行    |
| align     | `'start' \| 'center' \| 'end' \| 'baseline'` | -              | 对齐方式    |

---

## List 列表

```vue
<script setup>
import { List } from '@expcat/tigercat-vue'

const items = [
  { title: 'Item 1', description: 'Description 1' },
  { title: 'Item 2', description: 'Description 2' }
]
</script>

<template>
  <List :items="items" row-key="title">
    <template #default="{ item }">
      <div>
        <h4>{{ item.title }}</h4>
        <p>{{ item.description }}</p>
      </div>
    </template>
  </List>

  <List :items="items" split>
    <template #default="{ item, index }">
      <div>{{ index + 1 }}. {{ item.title }}</div>
    </template>
  </List>
</template>
```

**Props:**

| Prop   | Type                           | Default | Description |
| ------ | ------------------------------ | ------- | ----------- |
| items  | `any[]`                        | `[]`    | 数据源      |
| rowKey | `string \| ((item) => string)` | -       | 行键        |
| split  | `boolean`                      | `false` | 显示分割线  |

**Slots:** `default` (scoped: `{ item, index }`)

---

## Descriptions 描述列表

```vue
<script setup>
import { Descriptions } from '@expcat/tigercat-vue'

const items = [
  { label: 'Name', value: 'John Doe' },
  { label: 'Email', value: 'john@example.com' },
  { label: 'Phone', value: '123-456-7890' }
]
</script>

<template>
  <Descriptions :items="items" :columns="2" />

  <Descriptions layout="vertical" :columns="3">
    <template #default>
      <Descriptions.Item label="Name">John</Descriptions.Item>
      <Descriptions.Item label="Age">25</Descriptions.Item>
    </template>
  </Descriptions>
</template>
```

**Props:**

| Prop       | Type                              | Default        | Description |
| ---------- | --------------------------------- | -------------- | ----------- |
| items      | `{ label: string, value: any }[]` | -              | 数据项      |
| columns    | `number`                          | `3`            | 列数        |
| layout     | `'horizontal' \| 'vertical'`      | `'horizontal'` | 布局        |
| labelStyle | `CSSProperties`                   | -              | 标签样式    |

---

## Skeleton 骨架屏

```vue
<script setup>
import { Skeleton } from '@expcat/tigercat-vue'
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <Skeleton :loading="loading" :rows="3" animated>
    <p>Content loaded</p>
  </Skeleton>

  <!-- Avatar skeleton -->
  <Skeleton :loading="loading" shape="circle" />

  <!-- Button skeleton -->
  <Skeleton :loading="loading" shape="button" />
</template>
```

**Props:**

| Prop     | Type                                        | Default  | Description |
| -------- | ------------------------------------------- | -------- | ----------- |
| loading  | `boolean`                                   | `true`   | 加载状态    |
| rows     | `number`                                    | `3`      | 行数        |
| shape    | `'text' \| 'circle' \| 'button' \| 'image'` | `'text'` | 形状        |
| animated | `boolean`                                   | `true`   | 动画效果    |
