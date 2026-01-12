# Pagination 分页

分页组件，用于在数据量较大时进行分页展示。支持多种模式、快速跳页、页码选择等特性，便于大数据量高性能分页。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
const total = ref(100);
</script>

<template>
  <Pagination v-model:current="current" :total="total" :pageSize="10" />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);
  const total = 100;

  return (
    <Pagination
      current={current}
      onChange={setCurrent}
      total={total}
      pageSize={10}
    />
  );
}
```

## 快速跳页

设置 `showQuickJumper` 可以显示快速跳页输入框。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <Pagination
    v-model:current="current"
    :total="500"
    :pageSize="10"
    showQuickJumper
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination
      current={current}
      onChange={setCurrent}
      total={500}
      pageSize={10}
      showQuickJumper
    />
  );
}
```

## 改变每页条数

设置 `showSizeChanger` 可以显示页码选择器，允许用户改变每页显示的条数。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
const pageSize = ref(10);

const handlePageSizeChange = (newCurrent, newPageSize) => {
  console.log("页码:", newCurrent, "每页条数:", newPageSize);
};
</script>

<template>
  <Pagination
    v-model:current="current"
    v-model:pageSize="pageSize"
    :total="500"
    :pageSizeOptions="[10, 20, 50, 100]"
    showSizeChanger
    @page-size-change="handlePageSizeChange"
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (newCurrent: number, newPageSize: number) => {
    console.log("页码:", newCurrent, "每页条数:", newPageSize);
    setCurrent(newCurrent);
    setPageSize(newPageSize);
  };

  return (
    <Pagination
      current={current}
      onChange={setCurrent}
      pageSize={pageSize}
      total={500}
      pageSizeOptions={[10, 20, 50, 100]}
      showSizeChanger
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
```

## 简单模式

设置 `simple` 可以使用简单模式，只显示上一页、下一页和当前页/总页数。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <Pagination v-model:current="current" :total="500" simple />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination current={current} onChange={setCurrent} total={500} simple />
  );
}
```

## 不同尺寸

设置 `size` 可以控制分页组件的大小。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <div class="space-y-4">
    <Pagination v-model:current="current" :total="100" size="small" />

    <Pagination v-model:current="current" :total="100" size="medium" />

    <Pagination v-model:current="current" :total="100" size="large" />
  </div>
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <div className="space-y-4">
      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        size="small"
      />

      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        size="medium"
      />

      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        size="large"
      />
    </div>
  );
}
```

## 自定义对齐方式

设置 `align` 可以控制分页组件的对齐方式。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <div class="space-y-4">
    <Pagination v-model:current="current" :total="100" align="left" />

    <Pagination v-model:current="current" :total="100" align="center" />

    <Pagination v-model:current="current" :total="100" align="right" />
  </div>
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <div className="space-y-4">
      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        align="left"
      />

      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        align="center"
      />

      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        align="right"
      />
    </div>
  );
}
```

## 显示总数

默认显示总条数，可以通过 `showTotal={false}` 隐藏，或使用 `totalText` 自定义显示文本。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);

const customTotalText = (total, range) => {
  return `${range[0]}-${range[1]} 共 ${total} 条`;
};
</script>

<template>
  <div class="space-y-4">
    <!-- 默认显示 -->
    <Pagination v-model:current="current" :total="100" />

    <!-- 自定义总数文本 -->
    <Pagination
      v-model:current="current"
      :total="100"
      :totalText="customTotalText"
    />

    <!-- 隐藏总数 -->
    <Pagination v-model:current="current" :total="100" :showTotal="false" />
  </div>
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  const customTotalText = (total: number, range: [number, number]) => {
    return `${range[0]}-${range[1]} 共 ${total} 条`;
  };

  return (
    <div className="space-y-4">
      {/* 默认显示 */}
      <Pagination current={current} onChange={setCurrent} total={100} />

      {/* 自定义总数文本 */}
      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        totalText={customTotalText}
      />

      {/* 隐藏总数 */}
      <Pagination
        current={current}
        onChange={setCurrent}
        total={100}
        showTotal={false}
      />
    </div>
  );
}
```

## 单页时隐藏

设置 `hideOnSinglePage` 可以在只有一页时隐藏分页组件。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <Pagination
    v-model:current="current"
    :total="5"
    :pageSize="10"
    hideOnSinglePage
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination
      current={current}
      onChange={setCurrent}
      total={5}
      pageSize={10}
      hideOnSinglePage
    />
  );
}
```

## 禁用状态

设置 `disabled` 可以禁用分页组件。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
</script>

<template>
  <Pagination v-model:current="current" :total="100" disabled />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);

  return (
    <Pagination current={current} onChange={setCurrent} total={100} disabled />
  );
}
```

## 完整示例

一个包含所有功能的完整示例。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Pagination } from "@tigercat/vue";

const current = ref(1);
const pageSize = ref(10);
const total = ref(500);

const handleChange = (page, size) => {
  console.log("当前页:", page, "每页条数:", size);
};

const handlePageSizeChange = (page, size) => {
  console.log("页码大小改变 - 当前页:", page, "每页条数:", size);
};

const customTotalText = (total, range) => {
  return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`;
};
</script>

<template>
  <Pagination
    v-model:current="current"
    v-model:pageSize="pageSize"
    :total="total"
    :pageSizeOptions="[10, 20, 50, 100]"
    showQuickJumper
    showSizeChanger
    :totalText="customTotalText"
    size="medium"
    align="center"
    @change="handleChange"
    @page-size-change="handlePageSizeChange"
  />
</template>
```

### React

```tsx
import { useState } from "react";
import { Pagination } from "@tigercat/react";

function App() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total = 500;

  const handleChange = (page: number, size: number) => {
    console.log("当前页:", page, "每页条数:", size);
    setCurrent(page);
  };

  const handlePageSizeChange = (page: number, size: number) => {
    console.log("页码大小改变 - 当前页:", page, "每页条数:", size);
    setCurrent(page);
    setPageSize(size);
  };

  const customTotalText = (total: number, range: [number, number]) => {
    return `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`;
  };

  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      total={total}
      pageSizeOptions={[10, 20, 50, 100]}
      showQuickJumper
      showSizeChanger
      totalText={customTotalText}
      size="medium"
      align="center"
      onChange={handleChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
```

## API

### Pagination Props

| 属性             | 说明                                   | 类型                                                 | 默认值              |
| ---------------- | -------------------------------------- | ---------------------------------------------------- | ------------------- |
| current          | 当前页码（Vue: v-model:current）       | `number`                                             | `1`                 |
| defaultCurrent   | 默认当前页码（非受控模式）             | `number`                                             | `1`                 |
| total            | 总条数                                 | `number`                                             | `0`                 |
| pageSize         | 每页条数（Vue: v-model:pageSize）      | `number`                                             | `10`                |
| defaultPageSize  | 默认每页条数（非受控模式）             | `number`                                             | `10`                |
| pageSizeOptions  | 指定每页可以显示多少条                 | `number[]`                                           | `[10, 20, 50, 100]` |
| showQuickJumper  | 是否显示快速跳页输入框                 | `boolean`                                            | `false`             |
| showSizeChanger  | 是否显示每页条数选择器                 | `boolean`                                            | `false`             |
| showTotal        | 是否显示总条数                         | `boolean`                                            | `true`              |
| totalText        | 自定义总条数文本                       | `(total: number, range: [number, number]) => string` | -                   |
| simple           | 简单模式（只显示上一页、下一页和页码） | `boolean`                                            | `false`             |
| size             | 分页组件大小                           | `'small' \| 'medium' \| 'large'`                     | `'medium'`          |
| align            | 对齐方式                               | `'left' \| 'center' \| 'right'`                      | `'center'`          |
| disabled         | 是否禁用                               | `boolean`                                            | `false`             |
| hideOnSinglePage | 只有一页时是否隐藏分页                 | `boolean`                                            | `false`             |
| showLessItems    | 是否显示较少的页码按钮                 | `boolean`                                            | `false`             |
| className        | 自定义 CSS 类名                        | `string`                                             | -                   |
| style            | 自定义样式                             | `CSSProperties`                                      | -                   |

### Pagination Events (Vue)

| 事件名           | 说明                     | 回调参数                                      |
| ---------------- | ------------------------ | --------------------------------------------- |
| update:current   | 当前页改变时触发         | `(current: number) => void`                   |
| update:pageSize  | 每页条数改变时触发       | `(pageSize: number) => void`                  |
| change           | 页码或每页条数改变时触发 | `(current: number, pageSize: number) => void` |
| page-size-change | 每页条数改变时触发       | `(current: number, pageSize: number) => void` |

### Pagination Events (React)

| 属性             | 说明                 | 类型                                          |
| ---------------- | -------------------- | --------------------------------------------- |
| onChange         | 页码改变时的回调     | `(current: number, pageSize: number) => void` |
| onPageSizeChange | 每页条数改变时的回调 | `(current: number, pageSize: number) => void` |

## 主题定制

Pagination 组件使用 CSS 变量进行主题定制。你可以通过设置以下 CSS 变量来自定义组件样式：

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;

  /* 可选：中性色（边框/背景/文字） */
  --tiger-border: #d1d5db;
  --tiger-surface: #ffffff;
  --tiger-text: #374151;
  --tiger-text-muted: #6b7280;
}
```

或使用 JavaScript:

```typescript
import { setThemeColors } from "@tigercat/core";

setThemeColors({
  primary: "#10b981",
  primaryHover: "#059669",
});
```

## 可访问性

- 分页组件使用 `role="navigation"` 和 `aria-label="分页导航"` 属性，确保屏幕阅读器能够正确识别
- 当前激活的页码使用 `aria-current="page"` 标识
- 所有按钮都有适当的 `aria-label` 属性
- 快速跳转输入框和每页条数选择器都有相应的 `aria-label`
- 支持键盘导航
- 禁用状态下，所有交互元素都会被禁用

## 性能优化

- 组件针对大数据量场景进行了优化
- 页码计算采用高效算法，避免不必要的重新计算
- 使用 `showLessItems` 可以减少显示的页码按钮数量，提升渲染性能
- `hideOnSinglePage` 可以在只有一页时避免不必要的渲染
