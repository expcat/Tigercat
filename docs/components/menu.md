# Menu 菜单

导航菜单组件，支持横向、纵向布局，多级菜单嵌套，响应式收起/展开等功能。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])
</script>

<template>
  <Menu v-model:selectedKeys="selectedKeys">
    <MenuItem itemKey="1">菜单项 1</MenuItem>
    <MenuItem itemKey="2">菜单项 2</MenuItem>
    <MenuItem itemKey="3">菜单项 3</MenuItem>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  return (
    <Menu selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
      <MenuItem itemKey="1">菜单项 1</MenuItem>
      <MenuItem itemKey="2">菜单项 2</MenuItem>
      <MenuItem itemKey="3">菜单项 3</MenuItem>
    </Menu>
  )
}
```

## 横向菜单

设置 `mode="horizontal"` 可以使用横向菜单。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem } from '@expcat/tigercat-vue'

const selectedKeys = ref(['home'])
</script>

<template>
  <Menu mode="horizontal" v-model:selectedKeys="selectedKeys">
    <MenuItem itemKey="home">首页</MenuItem>
    <MenuItem itemKey="products">产品</MenuItem>
    <MenuItem itemKey="about">关于</MenuItem>
    <MenuItem itemKey="contact">联系我们</MenuItem>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['home'])

  return (
    <Menu mode="horizontal" selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
      <MenuItem itemKey="home">首页</MenuItem>
      <MenuItem itemKey="products">产品</MenuItem>
      <MenuItem itemKey="about">关于</MenuItem>
      <MenuItem itemKey="contact">联系我们</MenuItem>
    </Menu>
  )
}
```

## 子菜单

使用 `SubMenu` 组件创建多级菜单。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])
const openKeys = ref(['sub1'])
</script>

<template>
  <Menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys">
    <SubMenu itemKey="sub1" title="导航 1">
      <MenuItem itemKey="1">选项 1</MenuItem>
      <MenuItem itemKey="2">选项 2</MenuItem>
      <MenuItem itemKey="3">选项 3</MenuItem>
    </SubMenu>
    <SubMenu itemKey="sub2" title="导航 2">
      <MenuItem itemKey="4">选项 4</MenuItem>
      <MenuItem itemKey="5">选项 5</MenuItem>
    </SubMenu>
    <MenuItem itemKey="6">导航 3</MenuItem>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])
  const [openKeys, setOpenKeys] = useState(['sub1'])

  return (
    <Menu
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onSelect={(key) => setSelectedKeys([key])}
      onOpenChange={(key, { openKeys }) => setOpenKeys(openKeys)}>
      <SubMenu itemKey="sub1" title="导航 1">
        <MenuItem itemKey="1">选项 1</MenuItem>
        <MenuItem itemKey="2">选项 2</MenuItem>
        <MenuItem itemKey="3">选项 3</MenuItem>
      </SubMenu>
      <SubMenu itemKey="sub2" title="导航 2">
        <MenuItem itemKey="4">选项 4</MenuItem>
        <MenuItem itemKey="5">选项 5</MenuItem>
      </SubMenu>
      <MenuItem itemKey="6">导航 3</MenuItem>
    </Menu>
  )
}
```

## 内联模式

设置 `mode="inline"` 可以使用内联菜单模式。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])
const openKeys = ref(['sub1'])
</script>

<template>
  <Menu mode="inline" v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys">
    <SubMenu itemKey="sub1" title="导航 1">
      <MenuItem itemKey="1">选项 1</MenuItem>
      <MenuItem itemKey="2">选项 2</MenuItem>
    </SubMenu>
    <SubMenu itemKey="sub2" title="导航 2">
      <MenuItem itemKey="3">选项 3</MenuItem>
      <MenuItem itemKey="4">选项 4</MenuItem>
    </SubMenu>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])
  const [openKeys, setOpenKeys] = useState(['sub1'])

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onSelect={(key) => setSelectedKeys([key])}
      onOpenChange={(key, { openKeys }) => setOpenKeys(openKeys)}>
      <SubMenu itemKey="sub1" title="导航 1">
        <MenuItem itemKey="1">选项 1</MenuItem>
        <MenuItem itemKey="2">选项 2</MenuItem>
      </SubMenu>
      <SubMenu itemKey="sub2" title="导航 2">
        <MenuItem itemKey="3">选项 3</MenuItem>
        <MenuItem itemKey="4">选项 4</MenuItem>
      </SubMenu>
    </Menu>
  )
}
```

## 收起菜单

设置 `collapsed` 可以收起纵向菜单（仅在 `mode="vertical"` 时有效）。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

const collapsed = ref(false)
const selectedKeys = ref(['1'])
</script>

<template>
  <div>
    <button @click="collapsed = !collapsed">
      {{ collapsed ? '展开' : '收起' }}
    </button>
    <Menu mode="vertical" :collapsed="collapsed" v-model:selectedKeys="selectedKeys">
      <MenuItem itemKey="1">菜单项 1</MenuItem>
      <MenuItem itemKey="2">菜单项 2</MenuItem>
      <SubMenu itemKey="sub1" title="子菜单">
        <MenuItem itemKey="3">选项 3</MenuItem>
        <MenuItem itemKey="4">选项 4</MenuItem>
      </SubMenu>
    </Menu>
  </div>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-react'

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</button>
      <Menu
        mode="vertical"
        collapsed={collapsed}
        selectedKeys={selectedKeys}
        onSelect={(key) => setSelectedKeys([key])}>
        <MenuItem itemKey="1">菜单项 1</MenuItem>
        <MenuItem itemKey="2">菜单项 2</MenuItem>
        <SubMenu itemKey="sub1" title="子菜单">
          <MenuItem itemKey="3">选项 3</MenuItem>
          <MenuItem itemKey="4">选项 4</MenuItem>
        </SubMenu>
      </Menu>
    </div>
  )
}
```

## 暗色主题

设置 `theme="dark"` 可以使用暗色主题。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])
</script>

<template>
  <Menu theme="dark" v-model:selectedKeys="selectedKeys">
    <MenuItem itemKey="1">菜单项 1</MenuItem>
    <MenuItem itemKey="2">菜单项 2</MenuItem>
    <SubMenu itemKey="sub1" title="子菜单">
      <MenuItem itemKey="3">选项 3</MenuItem>
      <MenuItem itemKey="4">选项 4</MenuItem>
    </SubMenu>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  return (
    <Menu theme="dark" selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
      <MenuItem itemKey="1">菜单项 1</MenuItem>
      <MenuItem itemKey="2">菜单项 2</MenuItem>
      <SubMenu itemKey="sub1" title="子菜单">
        <MenuItem itemKey="3">选项 3</MenuItem>
        <MenuItem itemKey="4">选项 4</MenuItem>
      </SubMenu>
    </Menu>
  )
}
```

## 菜单项分组

使用 `MenuItemGroup` 组件可以对菜单项进行分组。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, MenuItemGroup } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])
</script>

<template>
  <Menu v-model:selectedKeys="selectedKeys">
    <MenuItemGroup title="分组 1">
      <MenuItem itemKey="1">选项 1</MenuItem>
      <MenuItem itemKey="2">选项 2</MenuItem>
    </MenuItemGroup>
    <MenuItemGroup title="分组 2">
      <MenuItem itemKey="3">选项 3</MenuItem>
      <MenuItem itemKey="4">选项 4</MenuItem>
    </MenuItemGroup>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, MenuItemGroup } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  return (
    <Menu selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
      <MenuItemGroup title="分组 1">
        <MenuItem itemKey="1">选项 1</MenuItem>
        <MenuItem itemKey="2">选项 2</MenuItem>
      </MenuItemGroup>
      <MenuItemGroup title="分组 2">
        <MenuItem itemKey="3">选项 3</MenuItem>
        <MenuItem itemKey="4">选项 4</MenuItem>
      </MenuItemGroup>
    </Menu>
  )
}
```

## 带图标的菜单

可以为菜单项和子菜单添加图标。

### Vue 3

```vue
<script setup>
import { ref } from 'vue'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-vue'

const selectedKeys = ref(['1'])

const homeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
const settingsIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.196-15.196l-4.243 4.243m-5.906 5.906l-4.243 4.243M23 12h-6m-6 0H1m15.196 5.196l-4.243-4.243m-5.906-5.906l-4.243-4.243"></path></svg>'
</script>

<template>
  <Menu v-model:selectedKeys="selectedKeys">
    <MenuItem itemKey="1" :icon="homeIcon">首页</MenuItem>
    <SubMenu itemKey="sub1" title="设置" :icon="settingsIcon">
      <MenuItem itemKey="2">常规设置</MenuItem>
      <MenuItem itemKey="3">高级设置</MenuItem>
    </SubMenu>
  </Menu>
</template>
```

### React

```tsx
import { useState } from 'react'
import { Menu, MenuItem, SubMenu } from '@expcat/tigercat-react'

function App() {
  const [selectedKeys, setSelectedKeys] = useState(['1'])

  const homeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  const settingsIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.196-15.196l-4.243 4.243m-5.906 5.906l-4.243 4.243M23 12h-6m-6 0H1m15.196 5.196l-4.243-4.243m-5.906-5.906l-4.243-4.243"></path></svg>'

  return (
    <Menu selectedKeys={selectedKeys} onSelect={(key) => setSelectedKeys([key])}>
      <MenuItem itemKey="1" icon={homeIcon}>
        首页
      </MenuItem>
      <SubMenu itemKey="sub1" title="设置" icon={settingsIcon}>
        <MenuItem itemKey="2">常规设置</MenuItem>
        <MenuItem itemKey="3">高级设置</MenuItem>
      </SubMenu>
    </Menu>
  )
}
```

## API

### Menu Props

| 参数                | 说明                                | 类型                                     | 默认值       |
| ------------------- | ----------------------------------- | ---------------------------------------- | ------------ |
| mode                | 菜单模式                            | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'` |
| theme               | 主题颜色                            | `'light' \| 'dark'`                      | `'light'`    |
| selectedKeys        | 当前选中的菜单项 key 数组（受控）   | `(string \| number)[]`                   | -            |
| defaultSelectedKeys | 初始选中的菜单项 key 数组           | `(string \| number)[]`                   | `[]`         |
| openKeys            | 当前展开的 SubMenu key 数组（受控） | `(string \| number)[]`                   | -            |
| defaultOpenKeys     | 初始展开的 SubMenu key 数组         | `(string \| number)[]`                   | `[]`         |
| collapsed           | 是否收起菜单（仅 vertical 模式）    | `boolean`                                | `false`      |
| multiple            | 是否允许多个子菜单展开              | `boolean`                                | `true`       |
| inlineIndent        | inline 模式的菜单缩进宽度（px）     | `number`                                 | `24`         |
| className           | 自定义类名                          | `string`                                 | -            |
| style               | 自定义样式                          | `object`                                 | -            |

### Menu Events (Vue)

| 事件名              | 说明                  | 回调参数                                                                |
| ------------------- | --------------------- | ----------------------------------------------------------------------- |
| update:selectedKeys | 选中菜单项时触发      | `(keys: (string \| number)[])`                                          |
| update:openKeys     | 子菜单展开/收起时触发 | `(keys: (string \| number)[])`                                          |
| select              | 点击菜单项时触发      | `(key: string \| number, info: { selectedKeys: (string \| number)[] })` |
| open-change         | 子菜单展开/收起时触发 | `(key: string \| number, info: { openKeys: (string \| number)[] })`     |

### Menu Events (React)

| 属性         | 说明                  | 类型                                                                            |
| ------------ | --------------------- | ------------------------------------------------------------------------------- |
| onSelect     | 点击菜单项时触发      | `(key: string \| number, info: { selectedKeys: (string \| number)[] }) => void` |
| onOpenChange | 子菜单展开/收起时触发 | `(key: string \| number, info: { openKeys: (string \| number)[] }) => void`     |

### MenuItem Props

| 参数      | 说明       | 类型                           | 默认值  |
| --------- | ---------- | ------------------------------ | ------- |
| itemKey   | 唯一标识   | `string \| number`             | -       |
| disabled  | 是否禁用   | `boolean`                      | `false` |
| icon      | 菜单项图标 | `string \| ReactNode \| VNode` | -       |
| className | 自定义类名 | `string`                       | -       |

### SubMenu Props

| 参数      | 说明       | 类型                           | 默认值  |
| --------- | ---------- | ------------------------------ | ------- |
| itemKey   | 唯一标识   | `string \| number`             | -       |
| title     | 子菜单标题 | `string`                       | -       |
| icon      | 子菜单图标 | `string \| ReactNode \| VNode` | -       |
| disabled  | 是否禁用   | `boolean`                      | `false` |
| className | 自定义类名 | `string`                       | -       |

### MenuItemGroup Props

| 参数      | 说明       | 类型     | 默认值 |
| --------- | ---------- | -------- | ------ |
| title     | 分组标题   | `string` | -      |
| className | 自定义类名 | `string` | -      |

## 主题定制

Menu 组件使用 CSS 变量进行主题定制。你可以通过覆盖以下 CSS 变量来自定义主题：

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
}
```

## 无障碍性

Menu 组件遵循 WAI-ARIA 规范：

- 使用 `role="menu"` 标识菜单容器
- 使用 `role="menuitem"` 标识可交互菜单项（MenuItem / SubMenu 标题）
- 使用 `aria-disabled` 标识禁用状态
- 使用 `aria-expanded` 标识子菜单展开状态

### 键盘操作

- `ArrowUp` / `ArrowDown`：在当前菜单中移动焦点（vertical / inline，及所有子菜单）
- `ArrowLeft` / `ArrowRight`：在横向顶层菜单中移动焦点（horizontal 顶层）
- `Home` / `End`：跳到当前菜单的第一个/最后一个可用项
- `Enter` / `Space`：激活当前项（MenuItem 选中；SubMenu 在 vertical/inline 下切换展开）
- `Escape`：关闭当前 SubMenu（若已展开）

Menu 使用 roving tabindex：同一时刻仅一个菜单项可通过 `Tab` 进入焦点，其余通过方向键在菜单内移动。

## 注意事项

1. **横向模式**：在横向模式下，子菜单会以下拉形式展现，通过鼠标悬停触发展开
2. **垂直/内联模式**：在垂直和内联模式下，子菜单通过点击标题展开/收起
3. **嵌套缩进**：在 `mode="inline"` 下，多级嵌套会按 `inlineIndent` 自动缩进，无需手动传递层级
4. **收起状态**：收起状态仅在 `mode="vertical"` 时生效，会隐藏菜单文本，只显示图标或首字母
5. **唯一 key**：每个菜单项和子菜单必须有唯一的 key/itemKey
6. **多选限制**：设置 `multiple={false}` 后，同时只能展开一个子菜单
