# List 列表

通用列表组件，用于展示一系列相似的数据项。支持分页、加载状态、空状态、网格布局等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List } from '@tigercat/vue';

const dataSource = ref([
  { key: 1, title: 'Item 1', description: 'Description for item 1' },
  { key: 2, title: 'Item 2', description: 'Description for item 2' },
  { key: 3, title: 'Item 3', description: 'Description for item 3' },
]);
</script>

<template>
  <List :dataSource="dataSource" />
</template>
```

### React

```tsx
import { List } from '@tigercat/react';

function App() {
  const dataSource = [
    { key: 1, title: 'Item 1', description: 'Description for item 1' },
    { key: 2, title: 'Item 2', description: 'Description for item 2' },
    { key: 3, title: 'Item 3', description: 'Description for item 3' },
  ];

  return <List dataSource={dataSource} />;
}
```

## 尺寸 (Sizes)

List 组件支持 3 种不同的尺寸：

- `sm` - 小尺寸
- `md` - 中等尺寸（默认）
- `lg` - 大尺寸

### Vue 3

```vue
<template>
  <List :dataSource="dataSource" size="sm" />
  <List :dataSource="dataSource" size="md" />
  <List :dataSource="dataSource" size="lg" />
</template>
```

### React

```tsx
<List dataSource={dataSource} size="sm" />
<List dataSource={dataSource} size="md" />
<List dataSource={dataSource} size="lg" />
```

## 边框样式 (Border Styles)

List 组件支持 3 种边框样式：

- `none` - 无边框
- `divided` - 分割线（默认）
- `bordered` - 完整边框

### Vue 3

```vue
<template>
  <List :dataSource="dataSource" bordered="none" />
  <List :dataSource="dataSource" bordered="divided" />
  <List :dataSource="dataSource" bordered="bordered" />
</template>
```

### React

```tsx
<List dataSource={dataSource} bordered="none" />
<List dataSource={dataSource} bordered="divided" />
<List dataSource={dataSource} bordered="bordered" />
```

## 带头像的列表

通过在数据项中添加 `avatar` 属性来显示头像。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List } from '@tigercat/vue';

const dataSource = ref([
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: 'John Doe',
    description: 'Software Engineer',
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: 'Jane Smith',
    description: 'Product Manager',
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: 'Bob Johnson',
    description: 'Designer',
  },
]);
</script>

<template>
  <List :dataSource="dataSource" />
</template>
```

### React

```tsx
import { List } from '@tigercat/react';

function App() {
  const dataSource = [
    {
      key: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      title: 'John Doe',
      description: 'Software Engineer',
    },
    {
      key: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      title: 'Jane Smith',
      description: 'Product Manager',
    },
    {
      key: 3,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      title: 'Bob Johnson',
      description: 'Designer',
    },
  ];

  return <List dataSource={dataSource} />;
}
```

## 带额外内容的列表

通过 `extra` 属性在列表项右侧添加额外内容。

### Vue 3

```vue
<script setup>
import { ref, h } from 'vue';
import { List, Button } from '@tigercat/vue';

const dataSource = ref([
  {
    key: 1,
    title: 'Task 1',
    description: 'Complete the project documentation',
    extra: h(Button, { size: 'sm' }, () => 'View'),
  },
  {
    key: 2,
    title: 'Task 2',
    description: 'Review pull requests',
    extra: h(Button, { size: 'sm' }, () => 'View'),
  },
]);
</script>

<template>
  <List :dataSource="dataSource" />
</template>
```

### React

```tsx
import { List, Button } from '@tigercat/react';

function App() {
  const dataSource = [
    {
      key: 1,
      title: 'Task 1',
      description: 'Complete the project documentation',
      extra: <Button size="sm">View</Button>,
    },
    {
      key: 2,
      title: 'Task 2',
      description: 'Review pull requests',
      extra: <Button size="sm">View</Button>,
    },
  ];

  return <List dataSource={dataSource} />;
}
```

## 自定义列表项渲染

使用 `renderItem` 插槽（Vue）或属性（React）自定义列表项的渲染方式。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List, Button } from '@tigercat/vue';

const dataSource = ref([
  { key: 1, name: 'Product A', price: '$99', stock: 15 },
  { key: 2, name: 'Product B', price: '$149', stock: 8 },
  { key: 3, name: 'Product C', price: '$199', stock: 22 },
]);
</script>

<template>
  <List :dataSource="dataSource">
    <template #renderItem="{ item }">
      <div class="flex items-center justify-between w-full">
        <div>
          <h3 class="font-medium">{{ item.name }}</h3>
          <p class="text-sm text-gray-500">Stock: {{ item.stock }}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold text-blue-600">{{ item.price }}</p>
          <Button size="sm" variant="primary">Buy</Button>
        </div>
      </div>
    </template>
  </List>
</template>
```

### React

```tsx
import { List, Button } from '@tigercat/react';

function App() {
  const dataSource = [
    { key: 1, name: 'Product A', price: '$99', stock: 15 },
    { key: 2, name: 'Product B', price: '$149', stock: 8 },
    { key: 3, name: 'Product C', price: '$199', stock: 22 },
  ];

  return (
    <List
      dataSource={dataSource}
      renderItem={(item) => (
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500">Stock: {item.stock}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{item.price}</p>
            <Button size="sm" variant="primary">
              Buy
            </Button>
          </div>
        </div>
      )}
    />
  );
}
```

## 列表头部和底部

通过 `header` 和 `footer` 插槽（Vue）或属性（React）添加列表的头部和底部内容。

### Vue 3

```vue
<template>
  <List :dataSource="dataSource">
    <template #header>
      <h2 class="text-xl font-bold">User List</h2>
    </template>
    <template #footer>
      <p class="text-sm text-gray-500">Total: {{ dataSource.length }} users</p>
    </template>
  </List>
</template>
```

### React

```tsx
<List
  dataSource={dataSource}
  header={<h2 className="text-xl font-bold">User List</h2>}
  footer={
    <p className="text-sm text-gray-500">Total: {dataSource.length} users</p>
  }
/>
```

## 分页列表

通过 `pagination` 属性启用分页功能。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List } from '@tigercat/vue';

const dataSource = ref([
  // ... 大量数据项
]);

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: dataSource.value.length,
  pageSizeOptions: [10, 20, 50],
  showSizeChanger: true,
  showTotal: true,
});

function handlePageChange({ current, pageSize }) {
  console.log('Page changed:', current, pageSize);
}
</script>

<template>
  <List
    :dataSource="dataSource"
    :pagination="pagination"
    @page-change="handlePageChange" />
</template>
```

### React

```tsx
import { useState } from 'react';
import { List } from '@tigercat/react';

function App() {
  const dataSource = [
    // ... 大量数据项
  ];

  const pagination = {
    current: 1,
    pageSize: 10,
    total: dataSource.length,
    pageSizeOptions: [10, 20, 50],
    showSizeChanger: true,
    showTotal: true,
  };

  const handlePageChange = ({ current, pageSize }) => {
    console.log('Page changed:', current, pageSize);
  };

  return (
    <List
      dataSource={dataSource}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
}
```

## 网格布局

使用 `grid` 属性将列表项以网格形式展示，支持响应式布局。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List, Card } from '@tigercat/vue';

const dataSource = ref([
  { key: 1, title: 'Card 1', content: 'Content 1' },
  { key: 2, title: 'Card 2', content: 'Content 2' },
  { key: 3, title: 'Card 3', content: 'Content 3' },
  { key: 4, title: 'Card 4', content: 'Content 4' },
  { key: 5, title: 'Card 5', content: 'Content 5' },
  { key: 6, title: 'Card 6', content: 'Content 6' },
]);

const grid = {
  gutter: 16,
  column: 3,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
};
</script>

<template>
  <List :dataSource="dataSource" :grid="grid" bordered="none">
    <template #renderItem="{ item }">
      <Card>
        <template #header>
          <h3>{{ item.title }}</h3>
        </template>
        <p>{{ item.content }}</p>
      </Card>
    </template>
  </List>
</template>
```

### React

```tsx
import { List, Card } from '@tigercat/react';

function App() {
  const dataSource = [
    { key: 1, title: 'Card 1', content: 'Content 1' },
    { key: 2, title: 'Card 2', content: 'Content 2' },
    { key: 3, title: 'Card 3', content: 'Content 3' },
    { key: 4, title: 'Card 4', content: 'Content 4' },
    { key: 5, title: 'Card 5', content: 'Content 5' },
    { key: 6, title: 'Card 6', content: 'Content 6' },
  ];

  const grid = {
    gutter: 16,
    column: 3,
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  };

  return (
    <List
      dataSource={dataSource}
      grid={grid}
      bordered="none"
      renderItem={(item) => (
        <Card header={<h3>{item.title}</h3>}>
          <p>{item.content}</p>
        </Card>
      )}
    />
  );
}
```

## 加载状态

通过 `loading` 属性显示加载状态。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List } from '@tigercat/vue';

const loading = ref(true);
const dataSource = ref([]);

// 模拟数据加载
setTimeout(() => {
  dataSource.value = [
    { key: 1, title: 'Item 1' },
    { key: 2, title: 'Item 2' },
  ];
  loading.value = false;
}, 2000);
</script>

<template>
  <List :dataSource="dataSource" :loading="loading" />
</template>
```

### React

```tsx
import { useState, useEffect } from 'react';
import { List } from '@tigercat/react';

function App() {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setDataSource([
        { key: 1, title: 'Item 1' },
        { key: 2, title: 'Item 2' },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  return <List dataSource={dataSource} loading={loading} />;
}
```

## 空状态

当列表没有数据时，可以自定义空状态文本。

### Vue 3

```vue
<template>
  <List :dataSource="[]" emptyText="暂无数据，请稍后再试" />
</template>
```

### React

```tsx
<List dataSource={[]} emptyText="暂无数据，请稍后再试" />
```

## 可点击列表项

通过 `hoverable` 属性启用悬停效果，并使用 `item-click` 事件（Vue）或 `onItemClick` 属性（React）处理点击。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { List } from '@tigercat/vue';

const dataSource = ref([
  { key: 1, title: 'Item 1' },
  { key: 2, title: 'Item 2' },
  { key: 3, title: 'Item 3' },
]);

function handleItemClick(item, index) {
  console.log('Clicked item:', item, 'at index:', index);
}
</script>

<template>
  <List :dataSource="dataSource" hoverable @item-click="handleItemClick" />
</template>
```

### React

```tsx
import { List } from '@tigercat/react';

function App() {
  const dataSource = [
    { key: 1, title: 'Item 1' },
    { key: 2, title: 'Item 2' },
    { key: 3, title: 'Item 3' },
  ];

  const handleItemClick = (item, index) => {
    console.log('Clicked item:', item, 'at index:', index);
  };

  return (
    <List dataSource={dataSource} hoverable onItemClick={handleItemClick} />
  );
}
```

## 垂直布局

通过 `itemLayout` 属性设置列表项的布局方式。

### Vue 3

```vue
<template>
  <List :dataSource="dataSource" itemLayout="vertical" />
</template>
```

### React

```tsx
<List dataSource={dataSource} itemLayout="vertical" />
```

## API

### List Props

| 属性         | 说明                        | 类型                                                                | 默认值         |
| ------------ | --------------------------- | ------------------------------------------------------------------- | -------------- |
| `dataSource` | 列表数据源                  | `ListItem[]`                                                        | `[]`           |
| `size`       | 列表尺寸                    | `'sm' \| 'md' \| 'lg'`                                              | `'md'`         |
| `bordered`   | 边框样式                    | `'none' \| 'divided' \| 'bordered'`                                 | `'divided'`    |
| `loading`    | 加载状态                    | `boolean`                                                           | `false`        |
| `emptyText`  | 空状态文本                  | `string`                                                            | `'No data'`    |
| `split`      | 是否显示分割线              | `boolean`                                                           | `true`         |
| `itemLayout` | 列表项布局                  | `'horizontal' \| 'vertical'`                                        | `'horizontal'` |
| `header`     | 列表头部内容                | `ReactNode` (React) / Slot (Vue)                                    | -              |
| `footer`     | 列表底部内容                | `ReactNode` (React) / Slot (Vue)                                    | -              |
| `pagination` | 分页配置，设为 `false` 禁用 | `ListPaginationConfig \| false`                                     | `false`        |
| `grid`       | 网格布局配置                | `GridConfig`                                                        | -              |
| `rowKey`     | 行键名或函数                | `string \| ((item: ListItem, index: number) => string \| number)`   | `'key'`        |
| `hoverable`  | 列表项是否可悬停            | `boolean`                                                           | `false`        |
| `renderItem` | 自定义列表项渲染            | `(item: ListItem, index: number) => ReactNode` (React) / Slot (Vue) | -              |
| `className`  | 额外 CSS 类                 | `string`                                                            | -              |
| `style`      | 自定义样式                  | `CSSProperties` (React) / `Record<string, string \| number>` (Vue)  | -              |

### ListItem

| 属性            | 说明            | 类型                  | 默认值 |
| --------------- | --------------- | --------------------- | ------ |
| `key`           | 列表项唯一键    | `string \| number`    | -      |
| `title`         | 列表项标题      | `string`              | -      |
| `description`   | 列表项描述      | `string`              | -      |
| `avatar`        | 列表项头像/图标 | `string \| ReactNode` | -      |
| `extra`         | 额外内容        | `ReactNode`           | -      |
| `[key: string]` | 自定义数据      | `unknown`             | -      |

### ListPaginationConfig

| 属性              | 说明                   | 类型                                                 | 默认值              |
| ----------------- | ---------------------- | ---------------------------------------------------- | ------------------- |
| `current`         | 当前页码               | `number`                                             | `1`                 |
| `pageSize`        | 每页条数               | `number`                                             | `10`                |
| `total`           | 总条数                 | `number`                                             | -                   |
| `pageSizeOptions` | 每页条数选项           | `number[]`                                           | `[10, 20, 50, 100]` |
| `showSizeChanger` | 是否显示每页条数选择器 | `boolean`                                            | `true`              |
| `showTotal`       | 是否显示总条数         | `boolean`                                            | `true`              |
| `totalText`       | 自定义总条数文本       | `(total: number, range: [number, number]) => string` | -                   |

### GridConfig

| 属性     | 说明                 | 类型     | 默认值 |
| -------- | -------------------- | -------- | ------ |
| `gutter` | 栅格间隔             | `number` | -      |
| `column` | 默认列数             | `number` | -      |
| `xs`     | `<576px` 响应式栅格  | `number` | -      |
| `sm`     | `≥576px` 响应式栅格  | `number` | -      |
| `md`     | `≥768px` 响应式栅格  | `number` | -      |
| `lg`     | `≥992px` 响应式栅格  | `number` | -      |
| `xl`     | `≥1200px` 响应式栅格 | `number` | -      |
| `xxl`    | `≥1600px` 响应式栅格 | `number` | -      |

### Events (Vue)

| 事件名        | 说明           | 回调参数                                |
| ------------- | -------------- | --------------------------------------- |
| `item-click`  | 列表项点击事件 | `(item: ListItem, index: number)`       |
| `page-change` | 分页变化事件   | `{ current: number; pageSize: number }` |

### Event Handlers (React)

| 属性           | 说明           | 类型                                                    |
| -------------- | -------------- | ------------------------------------------------------- |
| `onItemClick`  | 列表项点击事件 | `(item: ListItem, index: number) => void`               |
| `onPageChange` | 分页变化事件   | `(page: { current: number; pageSize: number }) => void` |

### 插槽 (Vue)

| 插槽名称     | 说明             | 参数                                |
| ------------ | ---------------- | ----------------------------------- |
| `header`     | 列表头部内容     | -                                   |
| `footer`     | 列表底部内容     | -                                   |
| `renderItem` | 自定义列表项渲染 | `{ item: ListItem, index: number }` |

## 主题定制

List 组件使用 Tailwind CSS 类，可以通过覆盖相应的类来自定义样式。主要支持以下 CSS 变量：

- `--tiger-surface` - 背景色（列表容器/加载遮罩）
- `--tiger-surface-muted` - 悬停背景色
- `--tiger-border` - 边框/分割线颜色
- `--tiger-text` - 主要文字颜色
- `--tiger-text-muted` - 次要文字/空态文字颜色
- `--tiger-primary` - 主题色（用于加载状态等）

## 无障碍支持

- 列表使用语义化的 HTML 结构
- 列表容器使用 `role="list"`，加载时设置 `aria-busy`
- 列表项使用 `role="listitem"`；当提供 `onItemClick`（React）或监听 `@item-click`（Vue）时，列表项可通过 Enter/Space 键触发
- 加载与空状态使用 `role="status"` + `aria-live="polite"`

## 使用场景

List 组件适用于以下场景：

- 文章列表
- 用户列表
- 产品列表
- 消息通知列表
- 评论列表
- 文件列表
- 任务列表
- 联系人列表

## 注意事项

1. 数据源 `dataSource` 必须是一个数组
2. 使用 `rowKey` 确保每个列表项有唯一标识，默认使用 `key` 字段
3. 网格布局时建议使用 `bordered="none"` 以获得更好的视觉效果
4. 分页是前端处理，如需后端处理，请监听 `page-change` 事件并自行实现
5. 自定义渲染函数 `renderItem` 在 Vue 中通过插槽实现，在 React 中通过属性传递
