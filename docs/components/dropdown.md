# Dropdown 下拉菜单

下拉菜单组件，支持点击和悬浮两种触发方式，可以自定义菜单内容和位置。

## 基本用法

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <Dropdown>
    <Button>下拉菜单</Button>
    <template #default>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
        <DropdownItem>菜单项 3</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <Dropdown>
      <Button>下拉菜单</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
        <DropdownItem>菜单项 3</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

## 触发方式

通过 `trigger` 属性设置触发方式，支持 `hover`（悬浮，默认）和 `click`（点击）。

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <div class="flex gap-4">
    <!-- 悬浮触发 -->
    <Dropdown trigger="hover">
      <Button>悬浮触发</Button>
      <template #default>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>

    <!-- 点击触发 -->
    <Dropdown trigger="click">
      <Button>点击触发</Button>
      <template #default>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
  </div>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <div className="flex gap-4">
      {/* 悬浮触发 */}
      <Dropdown trigger="hover">
        <Button>悬浮触发</Button>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      {/* 点击触发 */}
      <Dropdown trigger="click">
        <Button>点击触发</Button>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
```

## 弹出位置

通过 `placement` 属性设置下拉菜单弹出位置，支持 12 个方向。

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-4">
      <Dropdown placement="bottom-start">
        <Button>底部-左对齐</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>

      <Dropdown placement="bottom">
        <Button>底部-居中</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>

      <Dropdown placement="bottom-end">
        <Button>底部-右对齐</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>

    <div class="flex gap-4">
      <Dropdown placement="top-start">
        <Button>顶部-左对齐</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>

      <Dropdown placement="top">
        <Button>顶部-居中</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>

      <Dropdown placement="top-end">
        <Button>顶部-右对齐</Button>
        <template #default>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>
  </div>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Dropdown placement="bottom-start">
          <Button>底部-左对齐</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="bottom">
          <Button>底部-居中</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="bottom-end">
          <Button>底部-右对齐</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="flex gap-4">
        <Dropdown placement="top-start">
          <Button>顶部-左对齐</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="top">
          <Button>顶部-居中</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown placement="top-end">
          <Button>顶部-右对齐</Button>
          <DropdownMenu>
            <DropdownItem>菜单项 1</DropdownItem>
            <DropdownItem>菜单项 2</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
```

## 禁用菜单项

使用 `disabled` 属性禁用菜单项。

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <Dropdown>
    <Button>操作菜单</Button>
    <template #default>
      <DropdownMenu>
        <DropdownItem>编辑</DropdownItem>
        <DropdownItem disabled>删除（已禁用）</DropdownItem>
        <DropdownItem>复制</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <Dropdown>
      <Button>操作菜单</Button>
      <DropdownMenu>
        <DropdownItem>编辑</DropdownItem>
        <DropdownItem disabled>删除（已禁用）</DropdownItem>
        <DropdownItem>复制</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

## 分割线

使用 `divided` 属性在菜单项之间添加分割线。

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <Dropdown>
    <Button>操作菜单</Button>
    <template #default>
      <DropdownMenu>
        <DropdownItem>编辑</DropdownItem>
        <DropdownItem>复制</DropdownItem>
        <DropdownItem divided>删除</DropdownItem>
        <DropdownItem>下载</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <Dropdown>
      <Button>操作菜单</Button>
      <DropdownMenu>
        <DropdownItem>编辑</DropdownItem>
        <DropdownItem>复制</DropdownItem>
        <DropdownItem divided>删除</DropdownItem>
        <DropdownItem>下载</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

## 处理菜单项点击

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";

const handleCommand = (command: string) => {
  console.log("点击了：", command);
};
</script>

<template>
  <Dropdown>
    <Button>操作菜单</Button>
    <template #default>
      <DropdownMenu>
        <DropdownItem @click="handleCommand('edit')">编辑</DropdownItem>
        <DropdownItem @click="handleCommand('copy')">复制</DropdownItem>
        <DropdownItem @click="handleCommand('delete')" divided
          >删除</DropdownItem
        >
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  const handleCommand = (command: string) => {
    console.log("点击了：", command);
  };

  return (
    <Dropdown>
      <Button>操作菜单</Button>
      <DropdownMenu>
        <DropdownItem onClick={() => handleCommand("edit")}>编辑</DropdownItem>
        <DropdownItem onClick={() => handleCommand("copy")}>复制</DropdownItem>
        <DropdownItem onClick={() => handleCommand("delete")} divided>
          删除
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

## 控制显示隐藏

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";

const visible = ref(false);
</script>

<template>
  <div>
    <Dropdown v-model:visible="visible">
      <Button>受控下拉菜单</Button>
      <template #default>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
    <div class="mt-4">
      <Button @click="visible = !visible">
        {{ visible ? "关闭" : "打开" }}下拉菜单
      </Button>
    </div>
  </div>
</template>
```

### React

```tsx
import { useState } from "react";
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Dropdown visible={visible} onVisibleChange={setVisible}>
        <Button>受控下拉菜单</Button>
        <DropdownMenu>
          <DropdownItem>菜单项 1</DropdownItem>
          <DropdownItem>菜单项 2</DropdownItem>
          <DropdownItem>菜单项 3</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <div className="mt-4">
        <Button onClick={() => setVisible(!visible)}>
          {visible ? "关闭" : "打开"}下拉菜单
        </Button>
      </div>
    </div>
  );
}
```

## 禁用下拉菜单

使用 `disabled` 属性禁用整个下拉菜单。

### Vue 3

```vue
<script setup>
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/vue";
</script>

<template>
  <Dropdown disabled>
    <Button disabled>禁用的下拉菜单</Button>
    <template #default>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
        <DropdownItem>菜单项 3</DropdownItem>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>
```

### React

```tsx
import { Dropdown, DropdownMenu, DropdownItem, Button } from "@tigercat/react";

function App() {
  return (
    <Dropdown disabled>
      <Button disabled>禁用的下拉菜单</Button>
      <DropdownMenu>
        <DropdownItem>菜单项 1</DropdownItem>
        <DropdownItem>菜单项 2</DropdownItem>
        <DropdownItem>菜单项 3</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
```

## API

### Dropdown Props

| 属性           | 说明                               | 类型                                                                                                                                                                 | 默认值           |
| -------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| trigger        | 触发方式                           | `'click' \| 'hover'`                                                                                                                                                 | `'hover'`        |
| placement      | 弹出位置                           | `'bottom-start' \| 'bottom' \| 'bottom-end' \| 'top-start' \| 'top' \| 'top-end' \| 'left-start' \| 'left' \| 'left-end' \| 'right-start' \| 'right' \| 'right-end'` | `'bottom-start'` |
| disabled       | 是否禁用                           | `boolean`                                                                                                                                                            | `false`          |
| visible        | 是否显示下拉菜单（受控模式）       | `boolean`                                                                                                                                                            | -                |
| defaultVisible | 默认是否显示下拉菜单（非受控模式） | `boolean`                                                                                                                                                            | `false`          |
| closeOnClick   | 点击菜单项后是否关闭下拉菜单       | `boolean`                                                                                                                                                            | `true`           |
| className      | 自定义 CSS 类名                    | `string`                                                                                                                                                             | -                |
| style          | 自定义样式                         | `object`                                                                                                                                                             | -                |

### Dropdown Events (Vue)

| 事件名         | 说明               | 回调参数             |
| -------------- | ------------------ | -------------------- |
| update:visible | 显示状态改变时触发 | `(visible: boolean)` |
| visible-change | 显示状态改变时触发 | `(visible: boolean)` |

### Dropdown Events (React)

| 属性            | 说明                 | 类型                         |
| --------------- | -------------------- | ---------------------------- |
| onVisibleChange | 显示状态改变时的回调 | `(visible: boolean) => void` |

### DropdownMenu Props

| 属性      | 说明            | 类型     | 默认值 |
| --------- | --------------- | -------- | ------ |
| className | 自定义 CSS 类名 | `string` | -      |
| style     | 自定义样式      | `object` | -      |

### DropdownItem Props

| 属性      | 说明            | 类型      | 默认值  |
| --------- | --------------- | --------- | ------- |
| disabled  | 是否禁用        | `boolean` | `false` |
| divided   | 是否显示分割线  | `boolean` | `false` |
| className | 自定义 CSS 类名 | `string`  | -       |

### DropdownItem Events (Vue)

| 事件名 | 说明             | 回调参数              |
| ------ | ---------------- | --------------------- |
| click  | 点击菜单项时触发 | `(event: MouseEvent)` |

### DropdownItem Events (React)

| 属性    | 说明               | 类型                                |
| ------- | ------------------ | ----------------------------------- |
| onClick | 点击菜单项时的回调 | `(event: React.MouseEvent) => void` |

## 样式定制

Dropdown 组件使用 Tailwind CSS + CSS 变量编写，支持通过 `className` 属性添加自定义样式。

### 主题变量

组件默认使用以下 CSS 变量（均带 fallback）：

- `--tiger-surface`：菜单背景
- `--tiger-border`：边框/分割线
- `--tiger-text`：菜单项文字
- `--tiger-surface-muted`：hover/active 背景
- `--tiger-primary`：focus ring 颜色

### 自定义菜单样式

```vue
<Dropdown>
  <Button>自定义菜单</Button>
  <template #default>
    <DropdownMenu className="bg-blue-50 border-blue-200">
      <DropdownItem className="hover:bg-blue-100">菜单项 1</DropdownItem>
      <DropdownItem className="hover:bg-blue-100">菜单项 2</DropdownItem>
    </DropdownMenu>
  </template>
</Dropdown>
```

## 无障碍访问

Dropdown 组件遵循 WAI-ARIA 规范：

- 下拉菜单具有 `role="menu"` 属性
- 菜单项具有 `role="menuitem"` 属性
- 禁用的菜单项具有 `aria-disabled="true"` 属性
- 菜单项为可聚焦的按钮元素，支持 `Enter/Space` 触发
- 打开状态下按 `Escape` 可关闭

## 注意事项

1. 触发元素（第一个子元素）和 `DropdownMenu` 应该是 `Dropdown` 的直接子元素
2. 悬浮触发模式下，鼠标移入/移出都有延迟，以提供更好的用户体验
3. 点击触发模式下，点击页面其他区域会自动关闭下拉菜单
4. `closeOnClick` 为 `true` 时，点击任何菜单项都会关闭下拉菜单，除非菜单项是禁用状态
