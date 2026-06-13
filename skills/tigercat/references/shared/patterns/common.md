---
name: tigercat-shared-patterns
description: Common patterns and framework differences for Tigercat UI components
---

# Common Patterns

框架共通模式与差异速查。

术语统一见 [shared/glossary.md](../glossary.md)。文档中优先使用 `slot / children`、`emit / callback`、`attrs / native props`、`v-model / controlled` 等简写。

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
| Switch        | `checked`    | `checked`  | 开关状态   |
| Slider        | `modelValue` | `value`    | 滑块值     |
| DatePicker    | `modelValue` | `value`    | 日期值     |
| TimePicker    | `modelValue` | `value`    | 时间值     |

### 显示状态 Prop 命名

> **v0.5.0 Breaking Change**: 所有组件统一使用 `open`（Vue + React），原 `visible` 已废弃。

| 组件       | Prop   | 说明                    |
| ---------- | ------ | ----------------------- |
| Modal      | `open` | 显示状态 (v-model:open) |
| Drawer     | `open` | 显示状态 (v-model:open) |
| Popover    | `open` | 显示状态                |
| Popconfirm | `open` | 显示状态                |
| Tooltip    | `open` | 显示状态                |
| Dropdown   | `open` | 显示状态                |

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
| `@update:open`             | `onOpenChange`            | 显示状态变更         |

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
  <Modal v-model:open="show" />
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

## 父子组合组件文件约定

父子组合组件优先把父组件、子组件和共享 context 放在同一个父组件文件中导出，例如 `Steps` 与 `StepsItem`、`Breadcrumb` 与 `BreadcrumbItem`、`Tabs` 与 `TabPane`、`Anchor` 与 `AnchorLink`。旧的子组件文件只保留 re-export，用于兼容已有深路径导入。

| 层级       | 约定                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 实现文件   | `components/Steps.ts(x)` 同时导出 `Steps`、`StepsItem`、相关 props    |
| 兼容文件   | `components/StepsItem.ts(x)` 仅 re-export，不再放实现                 |
| 包入口     | `packages/*/src/index.*` 从父组件文件导出父子组件与类型               |
| 内部使用方 | 同包内部引用优先从父组件文件导入，避免 `Steps` ↔ `StepsItem` 循环依赖 |

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

根元素 `class` / `className` 和标准 attrs / native props 是公开样式钩子，框架实现应透传到组件根元素或等价原生交互元素。业务样式优先通过这些公开钩子或组件专用 class props 注入，避免依赖内部 DOM 层级。

---

## Floating Popup 共享架构

Tooltip、Popover、Popconfirm 三个组件共享同一套 **floating-popup** 基础层，避免重复实现：

| 层             | 文件                                 | 职责                                                            |
| -------------- | ------------------------------------ | --------------------------------------------------------------- |
| Core types     | `core/types/floating-popup.ts`       | `BaseFloatingPopupProps` + `FloatingTrigger`                    |
| Core utils     | `core/utils/floating-popup-utils.ts` | `createFloatingIdFactory` + `buildTriggerHandlerMap`            |
| Vue composable | `vue/utils/use-floating-popup.ts`    | `useFloatingPopup()` — 封装 visibility/floating/dismiss/trigger |
| React hook     | `react/utils/use-popup.ts`           | `usePopup()` — 对称的 React hook                                |

三个组件只需关注自身差异（内容渲染、a11y role、特有 props），共享行为由 hook 统一管理：

- 受控/非受控 open 双模式
- Floating UI 定位 (x, y, actualPlacement, floatingStyles)
- Click-outside + Escape-key 关闭
- Trigger 事件映射（click/hover/focus/manual）

浮层触发器的 `aria-expanded` 是稳定状态标识，可用于无障碍检查和轻量样式联动。`data-state` 等内部属性不作为跨组件公共 API 承诺，除非对应组件文档另行说明。
