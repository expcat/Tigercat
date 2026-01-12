# Popover

气泡卡片组件，用于显示复杂的自定义内容。与 Tooltip 类似，但支持更丰富的内容渲染。

## 基本用法

### Vue 3

```vue
<template>
  <div>
    <Popover content="这是一个气泡卡片的内容">
      <Button>触发气泡卡片</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div>
      <Popover content="这是一个气泡卡片的内容">
        <Button>触发气泡卡片</Button>
      </Popover>
    </div>
  );
}
```

## 带标题的气泡卡片

可以通过 `title` 属性设置标题。

### Vue 3

```vue
<template>
  <div>
    <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
      <Button>带标题的气泡卡片</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div>
      <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
        <Button>带标题的气泡卡片</Button>
      </Popover>
    </div>
  );
}
```

## 自定义内容

可以通过插槽（Vue）或 props（React）自定义内容。

### Vue 3

```vue
<template>
  <div>
    <Popover>
      <template #title>
        <span style="color: #2563eb;">自定义标题</span>
      </template>
      <template #content>
        <div>
          <p>这是自定义的内容</p>
          <ul>
            <li>列表项 1</li>
            <li>列表项 2</li>
            <li>列表项 3</li>
          </ul>
        </div>
      </template>
      <Button>自定义内容</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div>
      <Popover
        titleContent={<span style={{ color: "#2563eb" }}>自定义标题</span>}
        contentContent={
          <div>
            <p>这是自定义的内容</p>
            <ul>
              <li>列表项 1</li>
              <li>列表项 2</li>
              <li>列表项 3</li>
            </ul>
          </div>
        }
      >
        <Button>自定义内容</Button>
      </Popover>
    </div>
  );
}
```

## 不同位置

通过 `placement` 属性设置弹出位置。

### Vue 3

```vue
<template>
  <div class="space-x-2">
    <Popover title="提示" content="上方弹出" placement="top">
      <Button>上方</Button>
    </Popover>

    <Popover title="提示" content="下方弹出" placement="bottom">
      <Button>下方</Button>
    </Popover>

    <Popover title="提示" content="左侧弹出" placement="left">
      <Button>左侧</Button>
    </Popover>

    <Popover title="提示" content="右侧弹出" placement="right">
      <Button>右侧</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div className="space-x-2">
      <Popover title="提示" content="上方弹出" placement="top">
        <Button>上方</Button>
      </Popover>

      <Popover title="提示" content="下方弹出" placement="bottom">
        <Button>下方</Button>
      </Popover>

      <Popover title="提示" content="左侧弹出" placement="left">
        <Button>左侧</Button>
      </Popover>

      <Popover title="提示" content="右侧弹出" placement="right">
        <Button>右侧</Button>
      </Popover>
    </div>
  );
}
```

## 触发方式

支持多种触发方式：`click`（点击）、`hover`（悬停）、`focus`（聚焦）、`manual`（手动）。

### Vue 3

```vue
<template>
  <div class="space-x-2">
    <Popover title="点击触发" content="点击按钮触发" trigger="click">
      <Button>点击触发</Button>
    </Popover>

    <Popover title="悬停触发" content="悬停触发气泡卡片" trigger="hover">
      <Button>悬停触发</Button>
    </Popover>

    <Popover title="聚焦触发" content="聚焦触发气泡卡片" trigger="focus">
      <Button>聚焦触发</Button>
    </Popover>

    <Popover
      v-model:visible="manualVisible"
      title="手动触发"
      content="手动控制显示隐藏"
      trigger="manual"
    >
      <Button @click="manualVisible = !manualVisible">手动触发</Button>
    </Popover>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Popover, Button } from "@tigercat/vue";

const manualVisible = ref(false);
</script>
```

### React

```tsx
import React, { useState } from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  const [manualVisible, setManualVisible] = useState(false);

  return (
    <div className="space-x-2">
      <Popover title="点击触发" content="点击按钮触发" trigger="click">
        <Button>点击触发</Button>
      </Popover>

      <Popover title="悬停触发" content="悬停触发气泡卡片" trigger="hover">
        <Button>悬停触发</Button>
      </Popover>

      <Popover title="聚焦触发" content="聚焦触发气泡卡片" trigger="focus">
        <Button>聚焦触发</Button>
      </Popover>

      <Popover
        visible={manualVisible}
        onVisibleChange={setManualVisible}
        title="手动触发"
        content="手动控制显示隐藏"
        trigger="manual"
      >
        <Button onClick={() => setManualVisible(!manualVisible)}>
          手动触发
        </Button>
      </Popover>
    </div>
  );
}
```

## 受控模式

可以通过 `visible` 和 `v-model:visible`（Vue）或 `visible` 和 `onVisibleChange`（React）控制气泡卡片的显示状态。

### Vue 3

```vue
<template>
  <div>
    <Popover
      v-model:visible="visible"
      title="受控气泡卡片"
      content="通过外部状态控制显示"
    >
      <Button>受控气泡卡片</Button>
    </Popover>

    <Button @click="visible = !visible" class="ml-2">
      {{ visible ? "隐藏" : "显示" }}
    </Button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Popover, Button } from "@tigercat/vue";

const visible = ref(false);
</script>
```

### React

```tsx
import React, { useState } from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Popover
        visible={visible}
        onVisibleChange={setVisible}
        title="受控气泡卡片"
        content="通过外部状态控制显示"
      >
        <Button>受控气泡卡片</Button>
      </Popover>

      <Button onClick={() => setVisible(!visible)} className="ml-2">
        {visible ? "隐藏" : "显示"}
      </Button>
    </div>
  );
}
```

## 自定义宽度

可以通过 `width` 属性自定义气泡卡片的宽度。

### Vue 3

```vue
<template>
  <div class="space-x-2">
    <Popover
      title="自定义宽度"
      content="这是一个宽度为 300px 的气泡卡片"
      width="300"
    >
      <Button>宽度 300px</Button>
    </Popover>

    <Popover
      title="自定义宽度"
      content="这是一个宽度为 400px 的气泡卡片"
      width="400"
    >
      <Button>宽度 400px</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div className="space-x-2">
      <Popover
        title="自定义宽度"
        content="这是一个宽度为 300px 的气泡卡片"
        width="300"
      >
        <Button>宽度 300px</Button>
      </Popover>

      <Popover
        title="自定义宽度"
        content="这是一个宽度为 400px 的气泡卡片"
        width="400"
      >
        <Button>宽度 400px</Button>
      </Popover>
    </div>
  );
}
```

## 禁用状态

### Vue 3

```vue
<template>
  <div>
    <Popover title="禁用状态" content="这个气泡卡片已被禁用" disabled>
      <Button disabled>禁用的气泡卡片</Button>
    </Popover>
  </div>
</template>

<script setup>
import { Popover, Button } from "@tigercat/vue";
</script>
```

### React

```tsx
import React from "react";
import { Popover, Button } from "@tigercat/react";

function App() {
  return (
    <div>
      <Popover title="禁用状态" content="这个气泡卡片已被禁用" disabled>
        <Button disabled>禁用的气泡卡片</Button>
      </Popover>
    </div>
  );
}
```

## API

### Props

| 参数           | 说明                         | 类型                                                                                                                                                                 | 默认值      |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| visible        | 气泡卡片是否可见（受控模式） | `boolean`                                                                                                                                                            | `undefined` |
| defaultVisible | 默认是否可见（非受控模式）   | `boolean`                                                                                                                                                            | `false`     |
| title          | 气泡卡片标题                 | `string`                                                                                                                                                             | `undefined` |
| content        | 气泡卡片内容                 | `string`                                                                                                                                                             | `undefined` |
| trigger        | 触发方式                     | `'click' \| 'hover' \| 'focus' \| 'manual'`                                                                                                                          | `'click'`   |
| placement      | 弹出位置                     | `'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end'` | `'top'`     |
| disabled       | 是否禁用                     | `boolean`                                                                                                                                                            | `false`     |
| width          | 气泡卡片宽度                 | `string \| number`                                                                                                                                                   | `undefined` |
| className      | 自定义类名                   | `string`                                                                                                                                                             | `undefined` |
| style          | 自定义样式                   | `object`                                                                                                                                                             | `undefined` |

### Events (Vue)

| 事件名         | 说明               | 回调参数             |
| -------------- | ------------------ | -------------------- |
| update:visible | 可见状态改变时触发 | `(visible: boolean)` |
| visible-change | 可见状态改变时触发 | `(visible: boolean)` |

### Events (React)

| 事件名          | 说明               | 回调参数                     |
| --------------- | ------------------ | ---------------------------- |
| onVisibleChange | 可见状态改变时触发 | `(visible: boolean) => void` |

### Slots (Vue)

| 插槽名  | 说明               |
| ------- | ------------------ |
| default | 触发气泡卡片的元素 |
| title   | 自定义标题内容     |
| content | 自定义气泡卡片内容 |

### Props (React Additional)

| 参数           | 说明               | 类型        | 默认值      |
| -------------- | ------------------ | ----------- | ----------- |
| children       | 触发气泡卡片的元素 | `ReactNode` | `undefined` |
| titleContent   | 自定义标题内容     | `ReactNode` | `undefined` |
| contentContent | 自定义气泡卡片内容 | `ReactNode` | `undefined` |

## 样式定制

Popover 组件使用 Tailwind CSS 类名，支持通过 `className` 属性自定义样式。

### 主题变量

Popover 的默认颜色相关样式使用 CSS 变量（带 fallback），可通过自定义主题覆盖：

- `--tiger-surface`：内容背景色（默认 `#ffffff`）
- `--tiger-border`：边框色（默认 `#e5e7eb`）
- `--tiger-text`：标题文本色（默认 `#111827`）
- `--tiger-text-muted`：内容文本色（默认 `#374151`）

## 使用场景

- 展示详细信息或帮助文档
- 显示复杂的用户信息卡片
- 表单字段的详细说明
- 展示图片、列表等富内容
- 任何需要弹出显示额外内容的场景

## 与 Tooltip 和 Popconfirm 的区别

- **Tooltip**：用于显示简单的文本提示，内容简洁
- **Popover**：用于显示复杂的自定义内容，支持标题、富文本、HTML 等
- **Popconfirm**：专门用于确认操作，包含确认和取消按钮

## 无障碍性

- 弹层内容使用 `role="dialog"`（非模态：`aria-modal="false"`），并在有标题/内容时自动关联 `aria-labelledby/aria-describedby`
- 触发器提供 `aria-haspopup="dialog"`（并在禁用时标记 `aria-disabled`）
- 支持键盘导航（`focus` 触发模式）
- `click` 触发时支持 click-outside 关闭；非 `manual` 模式下支持 `Escape` 关闭

## 注意事项

1. 确保触发元素是可交互的（按钮、链接等）
2. 在 `manual` 模式下，需要手动控制 `visible` 状态
3. 气泡卡片内容不宜过长，建议控制在合理范围内
4. 注意气泡卡片的弹出位置，避免被遮挡或超出视口
