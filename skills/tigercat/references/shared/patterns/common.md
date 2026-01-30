---
name: tigercat-shared-patterns
description: Common patterns and framework differences for Tigercat UI components
---

# Common Patterns

框架共通模式与差异速查。

---

## 框架差异速查表

### 值绑定 Prop 命名

| 组件          | Vue Prop     | React Prop | 说明       |
| ------------- | ------------ | ---------- | ---------- |
| Input         | `modelValue` | `value`    | 输入值     |
| Textarea      | `modelValue` | `value`    | 文本域值   |
| Select        | `modelValue` | `value`    | 选中值     |
| Checkbox      | `modelValue` | `checked`  | 选中状态   |
| CheckboxGroup | `modelValue` | `value`    | 选中值数组 |
| Radio         | `modelValue` | `checked`  | 选中状态   |
| RadioGroup    | `modelValue` | `value`    | 选中值     |
| Switch        | `modelValue` | `checked`  | 开关状态   |
| Slider        | `modelValue` | `value`    | 滑块值     |
| DatePicker    | `modelValue` | `value`    | 日期值     |
| TimePicker    | `modelValue` | `value`    | 时间值     |

### 显示状态 Prop 命名

| 组件       | Vue Prop  | React Prop | 说明     |
| ---------- | --------- | ---------- | -------- |
| Modal      | `visible` | `open`     | 显示状态 |
| Drawer     | `visible` | `open`     | 显示状态 |
| Popover    | `visible` | `open`     | 显示状态 |
| Popconfirm | `visible` | `open`     | 显示状态 |
| Dropdown   | `visible` | `open`     | 显示状态 |

### 样式类 Prop

| Vue     | React       | Description |
| ------- | ----------- | ----------- |
| `class` | `className` | 自定义类名  |
| `style` | `style`     | 内联样式    |

### 事件命名规则

| Vue                        | React                     | 示例                 |
| -------------------------- | ------------------------- | -------------------- |
| `@event-name` (kebab-case) | `onEventName` (camelCase) | `@close` → `onClose` |
| `@update:modelValue`       | `onChange`                | 值变更事件           |
| `@update:visible`          | `onOpenChange`            | 显示状态变更         |

---

## 双向绑定模式

### Vue: v-model

```vue
<script setup>
import { ref } from 'vue'
const value = ref('')
</script>

<template>
  <!-- 简写 -->
  <Input v-model="value" />

  <!-- 完整写法 -->
  <Input :modelValue="value" @update:modelValue="value = $event" />

  <!-- 命名 v-model (Modal/Drawer) -->
  <Modal v-model:visible="show" />
</template>
```

### React: 受控组件

```tsx
import { useState } from 'react'

function App() {
  const [value, setValue] = useState('')

  return (
    <>
      {/* 受控模式 */}
      <Input value={value} onChange={setValue} />

      {/* 非受控模式（仅支持部分组件） */}
      <Input defaultValue="initial" />
    </>
  )
}
```

---

## Slots vs Props

### Vue: 使用 Slots

```vue
<template>
  <Button>
    <template #loading-icon>
      <MySpinner />
    </template>
    Loading...
  </Button>

  <Modal>
    <template #footer="{ ok, cancel }">
      <Button @click="cancel">Cancel</Button>
      <Button variant="primary" @click="ok">OK</Button>
    </template>
    Content
  </Modal>
</template>
```

### React: 使用 Props

```tsx
function App() {
  return (
    <>
      <Button loadingIcon={<MySpinner />}>Loading...</Button>

      <Modal
        footer={
          <>
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="primary" onClick={onOk}>
              OK
            </Button>
          </>
        }>
        Content
      </Modal>
    </>
  )
}
```

---

## 尺寸系统

大多数组件支持统一的尺寸 prop：

| Size     | 说明       | 适用组件                                |
| -------- | ---------- | --------------------------------------- |
| `'xs'`   | 超小       | Text                                    |
| `'sm'`   | 小         | Button, Input, Select, Tag, Avatar, ... |
| `'md'`   | 中（默认） | 大多数组件                              |
| `'lg'`   | 大         | Button, Input, Select, Avatar, ...      |
| `'xl'`   | 超大       | Text                                    |
| `number` | 自定义像素 | Avatar, Icon                            |

---

## 通用 Props

以下 props 在大多数组件中可用：

| Prop                  | Type            | Description          |
| --------------------- | --------------- | -------------------- |
| `disabled`            | `boolean`       | 禁用状态             |
| `loading`             | `boolean`       | 加载状态（部分组件） |
| `class` / `className` | `string`        | 自定义类名           |
| `style`               | `CSSProperties` | 内联样式             |
