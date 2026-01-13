# Tabs 标签页

标签页组件，用于内容的分类与切换。支持多种样式、位置和可关闭标签。

## 基本用法

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
</script>

<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPane tabKey="1" label="标签页 1"> 标签页 1 的内容 </TabPane>
    <TabPane tabKey="2" label="标签页 2"> 标签页 2 的内容 </TabPane>
    <TabPane tabKey="3" label="标签页 3"> 标签页 3 的内容 </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <TabPane tabKey="1" label="标签页 1">
        标签页 1 的内容
      </TabPane>
      <TabPane tabKey="2" label="标签页 2">
        标签页 2 的内容
      </TabPane>
      <TabPane tabKey="3" label="标签页 3">
        标签页 3 的内容
      </TabPane>
    </Tabs>
  );
}
```

## 卡片式标签页

设置 `type="card"` 可以使用卡片式标签页。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
</script>

<template>
  <Tabs v-model:activeKey="activeKey" type="card">
    <TabPane tabKey="1" label="选项卡 1"> 选项卡 1 的内容 </TabPane>
    <TabPane tabKey="2" label="选项卡 2"> 选项卡 2 的内容 </TabPane>
    <TabPane tabKey="3" label="选项卡 3"> 选项卡 3 的内容 </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey} type="card">
      <TabPane tabKey="1" label="选项卡 1">
        选项卡 1 的内容
      </TabPane>
      <TabPane tabKey="2" label="选项卡 2">
        选项卡 2 的内容
      </TabPane>
      <TabPane tabKey="3" label="选项卡 3">
        选项卡 3 的内容
      </TabPane>
    </Tabs>
  );
}
```

## 可编辑卡片

设置 `type="editable-card"` 可以使用可编辑的卡片式标签页，配合 `closable` 可以关闭标签。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
const tabs = ref([
  { key: "1", label: "标签 1", content: "标签 1 的内容" },
  { key: "2", label: "标签 2", content: "标签 2 的内容" },
  { key: "3", label: "标签 3", content: "标签 3 的内容" },
]);

const handleEdit = ({
  targetKey,
  action,
}: {
  targetKey?: string | number,
  action: "add" | "remove",
}) => {
  if (action === "add") {
    const newKey = `${tabs.value.length + 1}`;
    tabs.value.push({
      key: newKey,
      label: `新标签 ${newKey}`,
      content: `新标签 ${newKey} 的内容`,
    });
    activeKey.value = newKey;
    return;
  }

  if (action === "remove" && targetKey != null) {
    const targetKeyString = String(targetKey);
    const currentIndex = tabs.value.findIndex(
      (tab) => tab.key === targetKeyString
    );
    const newTabs = tabs.value.filter((tab) => tab.key !== targetKeyString);
    tabs.value = newTabs;

    // 如果删除的是当前激活的标签，激活下一个标签
    if (activeKey.value === targetKeyString && newTabs.length > 0) {
      const next =
        newTabs[currentIndex] ?? newTabs[currentIndex - 1] ?? newTabs[0];
      activeKey.value = next.key;
    }
  }
};
</script>

<template>
  <Tabs
    v-model:activeKey="activeKey"
    type="editable-card"
    closable
    @edit="handleEdit"
  >
    <TabPane
      v-for="tab in tabs"
      :key="tab.key"
      :tabKey="tab.key"
      :label="tab.label"
    >
      {{ tab.content }}
    </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");
  const [tabs, setTabs] = useState([
    { key: "1", label: "标签 1", content: "标签 1 的内容" },
    { key: "2", label: "标签 2", content: "标签 2 的内容" },
    { key: "3", label: "标签 3", content: "标签 3 的内容" },
  ]);

  const handleEdit = ({
    targetKey,
    action,
  }: {
    targetKey?: string | number;
    action: "add" | "remove";
  }) => {
    if (action === "add") {
      const newKey = `${tabs.length + 1}`;
      setTabs([
        ...tabs,
        {
          key: newKey,
          label: `新标签 ${newKey}`,
          content: `新标签 ${newKey} 的内容`,
        },
      ]);
      setActiveKey(newKey);
      return;
    }

    if (action === "remove" && targetKey != null) {
      const targetKeyString = String(targetKey);
      const currentIndex = tabs.findIndex((tab) => tab.key === targetKeyString);
      const newTabs = tabs.filter((tab) => tab.key !== targetKeyString);
      setTabs(newTabs);

      // 如果删除的是当前激活的标签，激活下一个标签
      if (activeKey === targetKeyString && newTabs.length > 0) {
        const next =
          newTabs[currentIndex] ?? newTabs[currentIndex - 1] ?? newTabs[0];
        setActiveKey(next.key);
      }
    }
  };

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      type="editable-card"
      closable
      onEdit={handleEdit}
    >
      {tabs.map((tab) => (
        <TabPane key={tab.key} tabKey={tab.key} label={tab.label}>
          {tab.content}
        </TabPane>
      ))}
    </Tabs>
  );
}
```

## 标签位置

设置 `tabPosition` 可以控制标签页的位置。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
const position = ref("top");
</script>

<template>
  <Tabs v-model:activeKey="activeKey" :tabPosition="position">
    <TabPane tabKey="1" label="标签页 1"> 标签页 1 的内容 </TabPane>
    <TabPane tabKey="2" label="标签页 2"> 标签页 2 的内容 </TabPane>
    <TabPane tabKey="3" label="标签页 3"> 标签页 3 的内容 </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");
  const [position, setPosition] = useState<"top" | "bottom" | "left" | "right">(
    "top"
  );

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey} tabPosition={position}>
      <TabPane tabKey="1" label="标签页 1">
        标签页 1 的内容
      </TabPane>
      <TabPane tabKey="2" label="标签页 2">
        标签页 2 的内容
      </TabPane>
      <TabPane tabKey="3" label="标签页 3">
        标签页 3 的内容
      </TabPane>
    </Tabs>
  );
}
```

## 居中标签

设置 `centered` 可以使标签居中显示。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
</script>

<template>
  <Tabs v-model:activeKey="activeKey" centered>
    <TabPane tabKey="1" label="标签页 1"> 标签页 1 的内容 </TabPane>
    <TabPane tabKey="2" label="标签页 2"> 标签页 2 的内容 </TabPane>
    <TabPane tabKey="3" label="标签页 3"> 标签页 3 的内容 </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey} centered>
      <TabPane tabKey="1" label="标签页 1">
        标签页 1 的内容
      </TabPane>
      <TabPane tabKey="2" label="标签页 2">
        标签页 2 的内容
      </TabPane>
      <TabPane tabKey="3" label="标签页 3">
        标签页 3 的内容
      </TabPane>
    </Tabs>
  );
}
```

## 不同尺寸

设置 `size` 可以控制标签的大小。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
</script>

<template>
  <div class="space-y-4">
    <Tabs v-model:activeKey="activeKey" size="small">
      <TabPane tabKey="1" label="小尺寸 1">内容</TabPane>
      <TabPane tabKey="2" label="小尺寸 2">内容</TabPane>
      <TabPane tabKey="3" label="小尺寸 3">内容</TabPane>
    </Tabs>

    <Tabs v-model:activeKey="activeKey" size="medium">
      <TabPane tabKey="1" label="中等尺寸 1">内容</TabPane>
      <TabPane tabKey="2" label="中等尺寸 2">内容</TabPane>
      <TabPane tabKey="3" label="中等尺寸 3">内容</TabPane>
    </Tabs>

    <Tabs v-model:activeKey="activeKey" size="large">
      <TabPane tabKey="1" label="大尺寸 1">内容</TabPane>
      <TabPane tabKey="2" label="大尺寸 2">内容</TabPane>
      <TabPane tabKey="3" label="大尺寸 3">内容</TabPane>
    </Tabs>
  </div>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <div className="space-y-4">
      <Tabs activeKey={activeKey} onChange={setActiveKey} size="small">
        <TabPane tabKey="1" label="小尺寸 1">
          内容
        </TabPane>
        <TabPane tabKey="2" label="小尺寸 2">
          内容
        </TabPane>
        <TabPane tabKey="3" label="小尺寸 3">
          内容
        </TabPane>
      </Tabs>

      <Tabs activeKey={activeKey} onChange={setActiveKey} size="medium">
        <TabPane tabKey="1" label="中等尺寸 1">
          内容
        </TabPane>
        <TabPane tabKey="2" label="中等尺寸 2">
          内容
        </TabPane>
        <TabPane tabKey="3" label="中等尺寸 3">
          内容
        </TabPane>
      </Tabs>

      <Tabs activeKey={activeKey} onChange={setActiveKey} size="large">
        <TabPane tabKey="1" label="大尺寸 1">
          内容
        </TabPane>
        <TabPane tabKey="2" label="大尺寸 2">
          内容
        </TabPane>
        <TabPane tabKey="3" label="大尺寸 3">
          内容
        </TabPane>
      </Tabs>
    </div>
  );
}
```

## 禁用标签

设置 `disabled` 可以禁用单个标签。

### Vue 3

```vue
<script setup>
import { ref } from "vue";
import { Tabs, TabPane } from "@tigercat/vue";

const activeKey = ref("1");
</script>

<template>
  <Tabs v-model:activeKey="activeKey">
    <TabPane tabKey="1" label="标签页 1"> 标签页 1 的内容 </TabPane>
    <TabPane tabKey="2" label="禁用标签" disabled>
      标签页 2 的内容（不可访问）
    </TabPane>
    <TabPane tabKey="3" label="标签页 3"> 标签页 3 的内容 </TabPane>
  </Tabs>
</template>
```

### React

```tsx
import { useState } from "react";
import { Tabs, TabPane } from "@tigercat/react";

function App() {
  const [activeKey, setActiveKey] = useState("1");

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <TabPane tabKey="1" label="标签页 1">
        标签页 1 的内容
      </TabPane>
      <TabPane tabKey="2" label="禁用标签" disabled>
        标签页 2 的内容（不可访问）
      </TabPane>
      <TabPane tabKey="3" label="标签页 3">
        标签页 3 的内容
      </TabPane>
    </Tabs>
  );
}
```

## API

### Tabs Props

| 属性                   | 说明                                         | 类型                                     | 默认值     |
| ---------------------- | -------------------------------------------- | ---------------------------------------- | ---------- |
| activeKey              | 当前激活标签的 key（Vue: v-model:activeKey） | `string \| number`                       | -          |
| defaultActiveKey       | 默认激活标签的 key（非受控模式）             | `string \| number`                       | -          |
| type                   | 标签页类型                                   | `'line' \| 'card' \| 'editable-card'`    | `'line'`   |
| tabPosition            | 标签位置                                     | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'`    |
| size                   | 标签大小                                     | `'small' \| 'medium' \| 'large'`         | `'medium'` |
| closable               | 是否可关闭（仅在 editable-card 类型下生效）  | `boolean`                                | `false`    |
| centered               | 标签是否居中显示                             | `boolean`                                | `false`    |
| destroyInactiveTabPane | 是否销毁未激活的标签面板                     | `boolean`                                | `false`    |
| className              | 自定义 CSS 类名                              | `string`                                 | -          |
| style                  | 自定义样式                                   | `CSSProperties`                          | -          |

### Tabs Events (Vue)

| 事件名           | 说明                                                              | 回调参数                                                                      |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| update:activeKey | 激活标签改变时触发                                                | `(key: string \| number) => void`                                             |
| change           | 激活标签改变时触发（仅在 key 发生变化时）                         | `(key: string \| number) => void`                                             |
| tab-click        | 标签点击时触发（即使点击的是当前激活 tab 也会触发）               | `(key: string \| number) => void`                                             |
| edit             | 标签编辑（新增/删除）时触发（`action='add'` 时 `targetKey` 为空） | `(info: { targetKey?: string \| number; action: 'add' \| 'remove' }) => void` |

### Tabs Events (React)

| 属性       | 说明                                                                | 类型                                                                          |
| ---------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| onChange   | 激活标签改变时的回调（仅在 key 发生变化时）                         | `(key: string \| number) => void`                                             |
| onTabClick | 标签点击时的回调（即使点击的是当前激活 tab 也会触发）               | `(key: string \| number) => void`                                             |
| onEdit     | 标签编辑（新增/删除）时的回调（`action='add'` 时 `targetKey` 为空） | `(info: { targetKey?: string \| number; action: 'add' \| 'remove' }) => void` |

### TabPane Props

| 属性      | 说明                                | 类型                                  | 默认值  |
| --------- | ----------------------------------- | ------------------------------------- | ------- |
| tabKey    | 标签页的 key（必填）                | `string \| number`                    | -       |
| label     | 标签页标题（必填）                  | `string`                              | -       |
| disabled  | 是否禁用                            | `boolean`                             | `false` |
| closable  | 是否可关闭（覆盖父组件的 closable） | `boolean`                             | -       |
| icon      | 标签图标                            | `ReactNode` (React) / `unknown` (Vue) | -       |
| className | 自定义 CSS 类名                     | `string`                              | -       |
| style     | 自定义样式                          | `CSSProperties`                       | -       |

## 主题定制

Tabs 组件使用 CSS 变量进行主题定制。你可以通过设置以下 CSS 变量来自定义组件样式：

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
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

- 结构语义：使用 `role="tablist"` / `role="tab"` / `role="tabpanel"` 标识标签列表、标签与面板
- 关联关系：`tab` 通过 `aria-controls` 指向对应 `tabpanel` 的 `id`；`tabpanel` 通过 `aria-labelledby` 指向对应 `tab` 的 `id`
- 选中/禁用：`aria-selected` 标识当前激活 tab；`aria-disabled` 标识禁用 tab；未激活面板用 `aria-hidden` 隐藏
- Roving tabindex：仅当前激活 tab 的 `tabIndex=0`，其余为 `-1`（便于键盘与读屏聚焦）
- 键盘交互：
  - 水平（`tabPosition=top/bottom`）：`ArrowLeft`/`ArrowRight` 在可用 tab 之间移动并激活
  - 垂直（`tabPosition=left/right`）：`ArrowUp`/`ArrowDown` 在可用 tab 之间移动并激活
  - `Home`/`End`：跳到第一个/最后一个可用 tab 并激活
  - `Enter`/`Space`：激活当前聚焦 tab
  - `Delete`/`Backspace`：在 `type="editable-card"` 且可关闭时关闭当前 tab
  - 导航会自动跳过 `disabled` 的 tab
- `editable-card` 模式下的新增按钮带 `aria-label="Add tab"`
