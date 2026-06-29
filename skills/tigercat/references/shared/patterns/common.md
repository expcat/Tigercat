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
| Switch        | `modelValue` | `checked`  | 开关状态   |
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

父子组合组件把父组件、子组件和共享 context 放在同一个父组件文件中导出，例如 `Steps` 与 `StepsItem`、`Breadcrumb` 与 `BreadcrumbItem`、`Tabs` 与 `TabPane`、`Anchor` 与 `AnchorLink`。包级 PascalCase 子组件 subpath 保持可用，但由 package exports 映射到父组件产物，不再保留源码层子组件 re-export 文件。

| 层级       | 约定                                                                  |
| ---------- | --------------------------------------------------------------------- |
| 实现文件   | `components/Steps.ts(x)` 同时导出 `Steps`、`StepsItem`、相关 props    |
| 子路径入口 | `@expcat/tigercat-*/StepsItem` 由 package exports 指向父组件产物      |
| 包入口     | `packages/*/src/index.*` 从父组件文件导出父子组件与类型               |
| 内部使用方 | 同包内部引用必须从父组件文件导入，避免 `Steps` ↔ `StepsItem` 循环依赖 |

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

### 浮层触发器状态属性（稳定 API）

所有浮层/展开类触发器在其**根元素**上稳定暴露 `data-state="open" | "closed"`，可直接用于
样式联动（CSS 选择器、`:has()` 等）。覆盖范围：Dropdown、Select、Popconfirm、Popover、
Menu 子菜单，以及 Cascader / TreeSelect / AutoComplete / Spotlight 等 combobox 触发器。

具有交互语义的触发器（Dropdown、Select、Popconfirm、Menu 子菜单、combobox 触发器）
**还**暴露 `aria-expanded="true" | "false"`，与 `data-state` 同步。Popover 的触发器是一个
不带交互 role 的通用包裹元素，按无障碍规范**不**附加 `aria-expanded`（真正的交互语义由
你放入的元素自身承担），仅暴露 `data-state`。

`data-state`（及上述 `aria-expanded`）是**公开稳定行为**，可放心据其编写样式（例如根据
开启状态旋转触发器内的 chevron），无需依赖未承诺的内部实现。

```css
/* 触发器打开时旋转自定义 chevron */
.my-trigger[data-state='open'] .chevron {
  transform: rotate(180deg);
}
```

### `trigger` 作用域插槽 / render-prop

Dropdown、Popover、Popconfirm 额外提供官方入口，让你在渲染**自定义触发器**时拿到开启
状态 `{ open }`，避免依赖属性选择器：

- **Vue**：`#trigger="{ open }"` 作用域插槽（菜单仍放默认插槽）。
  ```vue
  <Dropdown>
    <template #trigger="{ open }">
      <button>菜单 <Icon name="chevron-down" :class="{ 'rotate-180': open }" /></button>
    </template>
    <DropdownMenu>…</DropdownMenu>
  </Dropdown>
  ```
- **React**：Popover / Popconfirm 接受**函数 children** `({ open }) => ReactNode`；
  Dropdown 因 children 同时承载菜单，使用 `renderTrigger={({ open }) => …}`
  prop（`trigger` 已用于配置开启事件）。
  ```tsx
  <Dropdown
    renderTrigger={({ open }) => (
      <button>
        菜单 <ChevronIcon className={open ? 'rotate-180' : ''} />
      </button>
    )}>
    <DropdownMenu>…</DropdownMenu>
  </Dropdown>
  ```

不传 `trigger` 插槽 / `renderTrigger` 时，沿用原有默认插槽 / children 行为（向后兼容）。

### 根元素 class / attrs 透传（稳定 API）

所有组件将传入的 `class`（Vue）/ `className`（React）与未在组件 props 中声明的 attrs
（如 `data-*`、`aria-*`、`id`、`title`）**透传到组件根元素**。这是公开稳定行为，可作为
外部样式钩子使用。
