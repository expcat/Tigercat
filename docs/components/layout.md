# Layout 布局

基础的页面布局组件，提供经典的页面布局结构，包含 Header、Sidebar、Content 和 Footer 等子组件。

## 基本用法

Layout 组件提供了一套完整的页面布局解决方案，支持多种经典布局模式。

### Vue 3

```vue
<script setup>
import { Layout, Header, Content, Footer } from '@tigercat/vue';
</script>

<template>
  <Layout>
    <Header>Header</Header>
    <Content>Content</Content>
    <Footer>Footer</Footer>
  </Layout>
</template>
```

### React

```tsx
import { Layout, Header, Content, Footer } from '@tigercat/react';

function App() {
  return (
    <Layout>
      <Header>Header</Header>
      <Content>Content</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
}
```

## 侧边栏布局

包含侧边栏的经典布局模式。

### Vue 3

```vue
<script setup>
import { Layout, Header, Sidebar, Content, Footer } from '@tigercat/vue';
</script>

<template>
  <Layout>
    <Header>Header</Header>
    <div class="flex flex-1">
      <Sidebar>Sidebar</Sidebar>
      <Content>Content</Content>
    </div>
    <Footer>Footer</Footer>
  </Layout>
</template>
```

### React

```tsx
import { Layout, Header, Sidebar, Content, Footer } from '@tigercat/react';

function App() {
  return (
    <Layout>
      <Header>Header</Header>
      <div className="flex flex-1">
        <Sidebar>Sidebar</Sidebar>
        <Content>Content</Content>
      </div>
      <Footer>Footer</Footer>
    </Layout>
  );
}
```

## 可折叠侧边栏

侧边栏支持折叠功能，通过 `collapsed` 属性控制。

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import {
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  Button,
} from '@tigercat/vue';

const collapsed = ref(false);

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};
</script>

<template>
  <Layout>
    <Header>
      <div class="flex items-center justify-between px-6 h-full">
        <h1 class="text-xl font-bold">My App</h1>
        <Button @click="toggleSidebar">
          {{ collapsed ? '展开' : '收起' }}
        </Button>
      </div>
    </Header>
    <div class="flex flex-1">
      <Sidebar :collapsed="collapsed">
        <nav class="p-4">
          <ul class="space-y-2">
            <li>
              <a href="#" class="block p-2 hover:bg-gray-100 rounded">菜单 1</a>
            </li>
            <li>
              <a href="#" class="block p-2 hover:bg-gray-100 rounded">菜单 2</a>
            </li>
            <li>
              <a href="#" class="block p-2 hover:bg-gray-100 rounded">菜单 3</a>
            </li>
          </ul>
        </nav>
      </Sidebar>
      <Content>
        <h2 class="text-2xl font-bold mb-4">主内容区域</h2>
        <p>这是页面的主要内容。</p>
      </Content>
    </div>
    <Footer>
      <div class="text-center text-gray-600">
        © 2024 My App. All rights reserved.
      </div>
    </Footer>
  </Layout>
</template>
```

### React

```tsx
import { useState } from 'react';
import {
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  Button,
} from '@tigercat/react';

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between px-6 h-full">
          <h1 className="text-xl font-bold">My App</h1>
          <Button onClick={toggleSidebar}>{collapsed ? '展开' : '收起'}</Button>
        </div>
      </Header>
      <div className="flex flex-1">
        <Sidebar collapsed={collapsed}>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  菜单 1
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  菜单 2
                </a>
              </li>
              <li>
                <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                  菜单 3
                </a>
              </li>
            </ul>
          </nav>
        </Sidebar>
        <Content>
          <h2 className="text-2xl font-bold mb-4">主内容区域</h2>
          <p>这是页面的主要内容。</p>
        </Content>
      </div>
      <Footer>
        <div className="text-center text-gray-600">
          © 2024 My App. All rights reserved.
        </div>
      </Footer>
    </Layout>
  );
}
```

## 自定义尺寸

可以通过属性自定义 Header、Sidebar 和 Footer 的尺寸。

### Vue 3

```vue
<template>
  <Layout>
    <Header height="80px">
      <div class="flex items-center px-6 h-full">
        <h1 class="text-2xl font-bold">自定义高度 Header</h1>
      </div>
    </Header>
    <div class="flex flex-1">
      <Sidebar width="300px">
        <div class="p-4">更宽的侧边栏</div>
      </Sidebar>
      <Content>主内容</Content>
    </div>
    <Footer height="100px">
      <div class="flex items-center justify-center h-full">更高的 Footer</div>
    </Footer>
  </Layout>
</template>
```

### React

```tsx
<Layout>
  <Header height="80px">
    <div className="flex items-center px-6 h-full">
      <h1 className="text-2xl font-bold">自定义高度 Header</h1>
    </div>
  </Header>
  <div className="flex flex-1">
    <Sidebar width="300px">
      <div className="p-4">更宽的侧边栏</div>
    </Sidebar>
    <Content>主内容</Content>
  </div>
  <Footer height="100px">
    <div className="flex items-center justify-center h-full">更高的 Footer</div>
  </Footer>
</Layout>
```

## 仅 Header 和 Content

最简单的布局，只包含 Header 和 Content。

### Vue 3

```vue
<template>
  <Layout>
    <Header>Header</Header>
    <Content>Content</Content>
  </Layout>
</template>
```

### React

```tsx
<Layout>
  <Header>Header</Header>
  <Content>Content</Content>
</Layout>
```

## 侧边栏在 Header 上方

另一种常见的布局模式，侧边栏与 Header 同级。

### Vue 3

```vue
<template>
  <Layout>
    <div class="flex flex-1">
      <Sidebar>
        <div class="p-4">
          <h2 class="text-lg font-bold mb-4">导航</h2>
          <nav>
            <ul class="space-y-2">
              <li>
                <a href="#" class="block p-2 hover:bg-gray-100 rounded">首页</a>
              </li>
              <li>
                <a href="#" class="block p-2 hover:bg-gray-100 rounded">关于</a>
              </li>
              <li>
                <a href="#" class="block p-2 hover:bg-gray-100 rounded">联系</a>
              </li>
            </ul>
          </nav>
        </div>
      </Sidebar>
      <div class="flex-1 flex flex-col">
        <Header>Header</Header>
        <Content>Content</Content>
        <Footer>Footer</Footer>
      </div>
    </div>
  </Layout>
</template>
```

### React

```tsx
<Layout>
  <div className="flex flex-1">
    <Sidebar>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">导航</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                首页
              </a>
            </li>
            <li>
              <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                关于
              </a>
            </li>
            <li>
              <a href="#" className="block p-2 hover:bg-gray-100 rounded">
                联系
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </Sidebar>
    <div className="flex-1 flex flex-col">
      <Header>Header</Header>
      <Content>Content</Content>
      <Footer>Footer</Footer>
    </div>
  </div>
</Layout>
```

## 自定义样式

所有组件都支持通过 `className`（React）/`class-name`（Vue）添加自定义样式，并支持透传原生属性（如 `id`、`data-*`、`aria-*`）。

### Vue 3

```vue
<template>
  <Layout class-name="bg-gray-100">
    <Header class-name="bg-blue-600 text-white">
      <div class="px-6 h-full flex items-center">
        <h1 class="text-xl font-bold">自定义样式</h1>
      </div>
    </Header>
    <Content class-name="bg-white">
      <p>自定义背景色的内容区域</p>
    </Content>
    <Footer class-name="bg-gray-800 text-white">
      <div class="text-center">自定义样式 Footer</div>
    </Footer>
  </Layout>
</template>
```

## 主题定制

Layout 系列组件的默认背景与边框使用 CSS 变量（带 fallback），可在全局主题中覆盖：

- `--tiger-surface`：Header/Sidebar/Footer 默认背景（默认 `#ffffff`）
- `--tiger-border`：Header/Sidebar/Footer 默认边框色（默认 `#e5e7eb`）
- `--tiger-layout-content-bg`：Content 默认背景（默认 `#f9fafb`）

### React

```tsx
<Layout className="bg-gray-100">
  <Header className="bg-blue-600 text-white">
    <div className="px-6 h-full flex items-center">
      <h1 className="text-xl font-bold">自定义样式</h1>
    </div>
  </Header>
  <Content className="bg-white">
    <p>自定义背景色的内容区域</p>
  </Content>
  <Footer className="bg-gray-800 text-white">
    <div className="text-center">自定义样式 Footer</div>
  </Footer>
</Layout>
```

## API

### Layout Props / 属性

| 属性      | 说明            | 类型     | 默认值 |
| --------- | --------------- | -------- | ------ |
| className | 额外的 CSS 类名 | `string` | -      |

#### React 专属属性

| 属性     | 说明     | 类型              |
| -------- | -------- | ----------------- |
| children | 布局内容 | `React.ReactNode` |

### Header Props / 属性

| 属性      | 说明            | 类型     | 默认值   |
| --------- | --------------- | -------- | -------- |
| className | 额外的 CSS 类名 | `string` | -        |
| height    | Header 高度     | `string` | `'64px'` |

#### React 专属属性

| 属性     | 说明        | 类型              |
| -------- | ----------- | ----------------- |
| children | Header 内容 | `React.ReactNode` |

### Sidebar Props / 属性

| 属性      | 说明            | 类型      | 默认值    |
| --------- | --------------- | --------- | --------- |
| className | 额外的 CSS 类名 | `string`  | -         |
| width     | Sidebar 宽度    | `string`  | `'256px'` |
| collapsed | 是否折叠        | `boolean` | `false`   |

#### React 专属属性

| 属性     | 说明         | 类型              |
| -------- | ------------ | ----------------- |
| children | Sidebar 内容 | `React.ReactNode` |

### Content Props / 属性

| 属性      | 说明            | 类型     | 默认值 |
| --------- | --------------- | -------- | ------ |
| className | 额外的 CSS 类名 | `string` | -      |

#### React 专属属性

| 属性     | 说明         | 类型              |
| -------- | ------------ | ----------------- |
| children | Content 内容 | `React.ReactNode` |

### Footer Props / 属性

| 属性      | 说明            | 类型     | 默认值   |
| --------- | --------------- | -------- | -------- |
| className | 额外的 CSS 类名 | `string` | -        |
| height    | Footer 高度     | `string` | `'auto'` |

#### React 专属属性

| 属性     | 说明        | 类型              |
| -------- | ----------- | ----------------- |
| children | Footer 内容 | `React.ReactNode` |

### Slots / 插槽 (Vue)

所有组件都支持默认插槽用于传递内容：

| 组件    | 插槽名  | 说明         |
| ------- | ------- | ------------ |
| Layout  | default | 布局内容     |
| Header  | default | Header 内容  |
| Sidebar | default | Sidebar 内容 |
| Content | default | Content 内容 |
| Footer  | default | Footer 内容  |

## 样式定制

Layout 组件使用 Tailwind CSS 构建，所有子组件都提供了合理的默认样式，同时支持通过 `className` 属性进行样式定制。

### 默认样式说明

- **Layout**: 使用 `flex flex-col min-h-screen` 确保布局占满整个视口高度
- **Header**: 白色背景，底部边框，默认高度 64px
- **Sidebar**: 白色背景，右边框，默认宽度 256px，支持折叠动画
- **Content**: 浅灰色背景 (`bg-gray-50`)，内边距 24px，自动填充剩余空间 (`flex-1`)
- **Footer**: 白色背景，顶部边框，内边距 16px

### 响应式布局

可以结合 Tailwind CSS 的响应式工具类实现响应式布局：

```vue
<template>
  <Layout>
    <Header>
      <div class="px-4 md:px-6 h-full flex items-center">
        <h1 class="text-lg md:text-xl font-bold">响应式 Header</h1>
      </div>
    </Header>
    <div class="flex flex-col md:flex-row flex-1">
      <Sidebar width="200px" :collapsed="isMobile" className="md:block">
        导航菜单
      </Sidebar>
      <Content className="p-4 md:p-6"> 主要内容 </Content>
    </div>
    <Footer>Footer</Footer>
  </Layout>
</template>
```

## 无障碍 (Accessibility)

Layout 组件遵循无障碍最佳实践：

- 使用语义化 HTML 标签：`<header>`, `<aside>`, `<main>`, `<footer>`
- Header 使用 `<header>` 标签，适合包含网站标题和导航
- Sidebar 使用 `<aside>` 标签，表示侧边辅助内容
- Content 使用 `<main>` 标签，表示页面主要内容
- Footer 使用 `<footer>` 标签，适合包含版权信息和链接
- 支持键盘导航，所有交互元素都可通过键盘访问
- 清晰的视觉层次和边框分隔

## TypeScript 支持

Layout 组件完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
// Core types
import type {
  LayoutProps,
  HeaderProps,
  SidebarProps,
  ContentProps,
  FooterProps,
} from '@tigercat/core';

// Vue
import { Layout, Header, Sidebar, Content, Footer } from '@tigercat/vue';

// React
import {
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  type LayoutProps as ReactLayoutProps,
  type HeaderProps as ReactHeaderProps,
  type SidebarProps as ReactSidebarProps,
  type ContentProps as ReactContentProps,
  type FooterProps as ReactFooterProps,
} from '@tigercat/react';
```

## 完整示例

### 管理后台布局

#### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import {
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  Button,
} from '@tigercat/vue';

const collapsed = ref(false);
const currentPage = ref('dashboard');

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: '📊' },
  { id: 'users', label: '用户管理', icon: '👥' },
  { id: 'products', label: '产品管理', icon: '📦' },
  { id: 'orders', label: '订单管理', icon: '🛒' },
  { id: 'settings', label: '设置', icon: '⚙️' },
];

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
};

const navigateTo = (pageId) => {
  currentPage.value = pageId;
};
</script>

<template>
  <Layout>
    <Header>
      <div class="flex items-center justify-between px-6 h-full">
        <div class="flex items-center gap-4">
          <Button variant="ghost" @click="toggleSidebar">☰</Button>
          <h1 class="text-xl font-bold">管理后台</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">欢迎，管理员</span>
          <Button variant="outline" size="sm">退出</Button>
        </div>
      </div>
    </Header>

    <div class="flex flex-1">
      <Sidebar :collapsed="collapsed">
        <nav class="p-4">
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.id">
              <a
                href="#"
                @click.prevent="navigateTo(item.id)"
                :class="[
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100',
                ]">
                <span class="text-xl">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            </li>
          </ul>
        </nav>
      </Sidebar>

      <Content>
        <div class="max-w-7xl mx-auto">
          <h2 class="text-2xl font-bold mb-6">
            {{ menuItems.find((i) => i.id === currentPage)?.label }}
          </h2>
          <div class="bg-white rounded-lg shadow p-6">
            <p class="text-gray-600">
              这里是
              {{ menuItems.find((i) => i.id === currentPage)?.label }} 的内容。
            </p>
          </div>
        </div>
      </Content>
    </div>

    <Footer>
      <div class="text-center text-sm text-gray-600">
        © 2024 管理后台系统. All rights reserved.
      </div>
    </Footer>
  </Layout>
</template>
```

#### React

```tsx
import { useState } from 'react';
import {
  Layout,
  Header,
  Sidebar,
  Content,
  Footer,
  Button,
} from '@tigercat/react';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: '仪表盘', icon: '📊' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'products', label: '产品管理', icon: '📦' },
    { id: 'orders', label: '订单管理', icon: '🛒' },
    { id: 'settings', label: '设置', icon: '⚙️' },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navigateTo = (pageId: string) => {
    setCurrentPage(pageId);
  };

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleSidebar}>
              ☰
            </Button>
            <h1 className="text-xl font-bold">管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎，管理员</span>
            <Button variant="outline" size="sm">
              退出
            </Button>
          </div>
        </div>
      </Header>

      <div className="flex flex-1">
        <Sidebar collapsed={collapsed}>
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(item.id);
                    }}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}>
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Sidebar>

        <Content>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              {menuItems.find((i) => i.id === currentPage)?.label}
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">
                这里是 {menuItems.find((i) => i.id === currentPage)?.label}{' '}
                的内容。
              </p>
            </div>
          </div>
        </Content>
      </div>

      <Footer>
        <div className="text-center text-sm text-gray-600">
          © 2024 管理后台系统. All rights reserved.
        </div>
      </Footer>
    </Layout>
  );
}

export default AdminLayout;
```

## 最佳实践

1. **保持结构清晰**：使用 Layout 组件时，保持组件嵌套层次清晰，避免过度嵌套
2. **响应式设计**：结合 Tailwind CSS 的响应式工具类，为不同屏幕尺寸提供合适的布局
3. **合理使用折叠功能**：在移动端或需要更多内容空间时，使用 Sidebar 的折叠功能
4. **语义化 HTML**：Layout 组件使用了语义化的 HTML 标签，保持这种结构有利于 SEO 和可访问性
5. **自定义样式**：通过 `className` 属性添加自定义样式，而不是修改组件内部样式
6. **固定高度元素**：对于 Header 和 Footer，建议设置固定高度以保持布局稳定
7. **内容区域滚动**：当内容超出视口时，Content 区域会自动滚动，无需额外配置
