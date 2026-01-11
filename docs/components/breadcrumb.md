# Breadcrumb 面包屑

面包屑导航组件，用于显示当前页面的路径，帮助用户了解当前位置并快速导航。

## 基本用法

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="/products">产品</BreadcrumbItem>
      <BreadcrumbItem current>详情</BreadcrumbItem>
    </Breadcrumb>
  );
}
```

## 自定义分隔符

通过 `separator` 属性可以自定义分隔符，支持预设类型或自定义字符串。

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';
</script>

<template>
  <!-- 使用箭头分隔符 -->
  <Breadcrumb separator="arrow">
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- 使用尖括号分隔符 -->
  <Breadcrumb separator="chevron">
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>

  <!-- 使用自定义字符串分隔符 -->
  <Breadcrumb separator=">">
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  return (
    <>
      {/* 使用箭头分隔符 */}
      <Breadcrumb separator="arrow">
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem href="/products">产品</BreadcrumbItem>
        <BreadcrumbItem current>详情</BreadcrumbItem>
      </Breadcrumb>

      {/* 使用尖括号分隔符 */}
      <Breadcrumb separator="chevron">
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem href="/products">产品</BreadcrumbItem>
        <BreadcrumbItem current>详情</BreadcrumbItem>
      </Breadcrumb>

      {/* 使用自定义字符串分隔符 */}
      <Breadcrumb separator=">">
        <BreadcrumbItem href="/">首页</BreadcrumbItem>
        <BreadcrumbItem href="/products">产品</BreadcrumbItem>
        <BreadcrumbItem current>详情</BreadcrumbItem>
      </Breadcrumb>
    </>
  );
}
```

## 单独设置分隔符

每个面包屑项可以单独设置分隔符，覆盖全局设置。

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/" separator="arrow">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products" separator="chevron">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/" separator="arrow">
        首页
      </BreadcrumbItem>
      <BreadcrumbItem href="/products" separator="chevron">
        产品
      </BreadcrumbItem>
      <BreadcrumbItem current>详情</BreadcrumbItem>
    </Breadcrumb>
  );
}
```

## 带图标的面包屑

面包屑项可以包含图标等元素。

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem, Icon } from '@tigercat/vue';
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/">
      <Icon name="home" />
      首页
    </BreadcrumbItem>
    <BreadcrumbItem href="/products">
      <Icon name="box" />
      产品
    </BreadcrumbItem>
    <BreadcrumbItem current>
      <Icon name="info" />
      详情
    </BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/" icon="🏠">
        首页
      </BreadcrumbItem>
      <BreadcrumbItem href="/products" icon="📦">
        产品
      </BreadcrumbItem>
      <BreadcrumbItem current icon="ℹ️">
        详情
      </BreadcrumbItem>
    </Breadcrumb>
  );
}
```

## 外部链接

支持在新窗口打开链接。

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem href="https://example.com" target="_blank">
      外部链接
    </BreadcrumbItem>
    <BreadcrumbItem current>当前页面</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      <BreadcrumbItem href="https://example.com" target="_blank">
        外部链接
      </BreadcrumbItem>
      <BreadcrumbItem current>当前页面</BreadcrumbItem>
    </Breadcrumb>
  );
}
```

## 点击事件

面包屑项支持点击事件。

### Vue 3

```vue
<script setup>
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';

const handleClick = (event) => {
  console.log('Breadcrumb item clicked', event);
};
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/" @click="handleClick">首页</BreadcrumbItem>
    <BreadcrumbItem href="/products" @click="handleClick">产品</BreadcrumbItem>
    <BreadcrumbItem current>详情</BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';

function App() {
  const handleClick = (event) => {
    console.log('Breadcrumb item clicked', event);
  };

  return (
    <Breadcrumb>
      <BreadcrumbItem href="/" onClick={handleClick}>
        首页
      </BreadcrumbItem>
      <BreadcrumbItem href="/products" onClick={handleClick}>
        产品
      </BreadcrumbItem>
      <BreadcrumbItem current>详情</BreadcrumbItem>
    </Breadcrumb>
  );
}
```

## 动态路由

根据路由动态生成面包屑。

### Vue 3

```vue
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Breadcrumb, BreadcrumbItem } from '@tigercat/vue';

const route = useRoute();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((r) => r.meta && r.meta.breadcrumb);
  return matched.map((r) => ({
    path: r.path,
    name: r.meta.breadcrumb,
  }));
});
</script>

<template>
  <Breadcrumb>
    <BreadcrumbItem href="/">首页</BreadcrumbItem>
    <BreadcrumbItem
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
      :href="item.path"
      :current="index === breadcrumbs.length - 1">
      {{ item.name }}
    </BreadcrumbItem>
  </Breadcrumb>
</template>
```

### React

```tsx
import { Breadcrumb, BreadcrumbItem } from '@tigercat/react';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  // Example: Parse pathname to create breadcrumbs
  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      path: '/' + array.slice(0, index + 1).join('/'),
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      current: index === array.length - 1,
    }));

  return (
    <Breadcrumb>
      <BreadcrumbItem href="/">首页</BreadcrumbItem>
      {breadcrumbs.map((item) => (
        <BreadcrumbItem key={item.path} href={item.path} current={item.current}>
          {item.name}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
```

## API

### Breadcrumb Props

| 属性      | 说明                                                                 | 类型                                             | 默认值 |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| separator | 分隔符，支持 `'/'`、`'slash'`、`'arrow'`、`'chevron'` 或自定义字符串 | `string`                                         | `'/'`  |
| className | 自定义 CSS 类名                                                      | `string`                                         | -      |
| style     | 自定义样式（Vue/React 均支持；Vue 也可直接传 `style`）               | `React.CSSProperties \| Record<string, unknown>` | -      |

### BreadcrumbItem Props

| 属性      | 说明                                                   | 类型                                             | 默认值  |
| --------- | ------------------------------------------------------ | ------------------------------------------------ | ------- |
| href      | 链接地址                                               | `string`                                         | -       |
| target    | 链接打开方式                                           | `'_blank' \| '_self' \| '_parent' \| '_top'`     | -       |
| current   | 是否为当前页（最后一项）                               | `boolean`                                        | `false` |
| separator | 自定义分隔符（覆盖全局设置）                           | `string`                                         | -       |
| icon      | 图标（Vue/React 均支持）                               | `React.ReactNode \| unknown`                     | -       |
| className | 自定义 CSS 类名                                        | `string`                                         | -       |
| style     | 自定义样式（Vue/React 均支持；Vue 也可直接传 `style`） | `React.CSSProperties \| Record<string, unknown>` | -       |

### BreadcrumbItem Events (Vue)

| 事件名 | 说明               | 回调参数              |
| ------ | ------------------ | --------------------- |
| click  | 点击面包屑项时触发 | `(event: MouseEvent)` |

### BreadcrumbItem Events (React)

| 属性    | 说明               | 类型                                |
| ------- | ------------------ | ----------------------------------- |
| onClick | 点击面包屑项时触发 | `(event: React.MouseEvent) => void` |

## 预设分隔符

| 名称           | 符号 | 说明                       |
| -------------- | ---- | -------------------------- |
| `/` 或 `slash` | `/`  | 斜线分隔符（默认）         |
| `arrow`        | `→`  | 箭头分隔符                 |
| `chevron`      | `›`  | 尖括号分隔符               |
| 自定义字符串   | 任意 | 使用自定义字符串作为分隔符 |

## 样式定制

Breadcrumb 组件使用 Tailwind CSS 类名，可以通过 `className` 属性进行定制。

在 Vue 中，`className/style` 会与原生 `class/style`（即 attrs）进行合并。

### 示例

```vue
<Breadcrumb className="text-lg font-semibold">
  <BreadcrumbItem href="/">首页</BreadcrumbItem>
  <BreadcrumbItem current>当前页</BreadcrumbItem>
</Breadcrumb>
```

## 无障碍访问

- 使用语义化的 `<nav>` 和 `<ol>` 元素
- 提供 `aria-label="Breadcrumb"` 属性
- 当前页面项使用 `aria-current="page"` 属性
- 分隔符使用 `aria-hidden="true"` 隐藏
- 支持键盘导航和屏幕阅读器

## 注意事项

1. **最后一项应标记为 current**：面包屑的最后一项应该设置 `current` 属性为 `true`，这样它将不会渲染为链接。

2. **外部链接安全性**：当使用 `target="_blank"` 时，组件会自动添加 `rel="noopener noreferrer"` 以提高安全性。

3. **分隔符选择**：

   - 使用 `/` 或 `slash` 表示层级关系（最常用）
   - 使用 `arrow` (→) 表示流程或导航方向
   - 使用 `chevron` (›) 表示层级深度
   - 可以使用任意自定义字符串

4. **响应式设计**：面包屑组件默认支持自动换行，适应不同屏幕尺寸。
