# Tigercat v0.5.0 迁移指南

本文档说明从 v0.4.x 升级到 v0.5.0 所需的变更。

## Breaking Changes

### 1. Props 重命名: `visible` → `open`

以下组件的 `visible` prop 已重命名为 `open`：

- Modal
- Drawer
- Dropdown
- Popover
- Popconfirm
- Tooltip
- Loading (Fullscreen)

同时，事件名从 `update:visible` 变更为 `update:open`。

**查找替换正则：**

Vue:

```bash
# Props
sed -i '' 's/:visible/:open/g; s/v-model:visible/v-model:open/g' src/**/*.vue src/**/*.ts
# Events
sed -i '' 's/@update:visible/@update:open/g' src/**/*.vue
```

React:

```bash
sed -i '' 's/\bvisible=/open=/g; s/\bonVisibleChange=/onOpenChange=/g' src/**/*.tsx
```

### 2. Button `type` → `htmlType`

Button 组件的 `type` prop（控制原生 `<button>` 的 type 属性）已重命名为 `htmlType`，以避免与 variant/样式类型混淆。

**查找替换：**

```bash
# 仅针对 Button 组件的 type prop
# Vue
sed -i '' 's/type="submit"/htmlType="submit"/g; s/type="reset"/htmlType="reset"/g; s/type="button"/htmlType="button"/g' src/**/*.vue src/**/*.ts
# React
sed -i '' 's/\btype="submit"/htmlType="submit"/g; s/\btype="reset"/htmlType="reset"/g; s/\btype="button"/htmlType="button"/g' src/**/*.tsx
```

> **注意**：仅需修改 `<Button>` / `<TigerButton>` 上的 `type` prop，原生 `<button>` 不受影响。

## 新增功能

### Core 层

| 功能         | 说明                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| 泛型类型     | `generics.ts` — `MaybeRef<T>`, `MaybeArray<T>`, `DeepPartial<T>`, `Prettify<T>` 等 |
| 类型安全事件 | `events.ts` — `EventHandlerMap<T>`, `ComponentEmits<T>`                            |
| 类型安全插槽 | `slots.ts` — `SlotDefinition<T>`, `ComponentSlots<T>`                              |
| Design Token | `tokens.json` → CSS/TS/Tailwind 自动生成                                           |
| 过渡预设     | `transition.ts` — 7 种标准过渡预设 + `prefersReducedMotion()`                      |
| 菜单键盘导航 | `handleMenuNavigation()`, `focusFirstMenuItem()`                                   |

### Button

| 功能        | 说明                             |
| ----------- | -------------------------------- |
| 扩展尺寸    | 新增 `xs`, `xl` 尺寸             |
| 危险按钮    | `danger` prop                    |
| 图标位置    | `iconPosition: 'start' \| 'end'` |
| ButtonGroup | 新组件，支持 size 级联           |

### Input

| 功能     | 说明                                                   |
| -------- | ------------------------------------------------------ |
| 一键清除 | `clearable` prop                                       |
| 密码切换 | `showPassword` prop                                    |
| 字数统计 | `showCount` prop                                       |
| a11y     | 独立使用时自动设置 `aria-invalid` / `aria-describedby` |

### Select

| 功能     | 说明                                           |
| -------- | ---------------------------------------------- |
| 标签截断 | `maxTagCount` prop（多选模式）                 |
| a11y     | `aria-activedescendant`，清除按钮 `aria-label` |

### Form

| 功能     | 说明                                   |
| -------- | -------------------------------------- |
| 加载状态 | `loading` prop，提交时自动禁止重复提交 |

### Modal / Drawer

| 功能       | 说明                                 |
| ---------- | ------------------------------------ |
| 自定义宽度 | `width` prop（支持 string / number） |

### DatePicker

| 功能     | 说明             |
| -------- | ---------------- |
| 快捷选项 | `shortcuts` prop |

### Card

| 功能     | 说明                                    |
| -------- | --------------------------------------- |
| 布局方向 | `direction: 'vertical' \| 'horizontal'` |

### AvatarGroup (新组件)

| 功能   | 说明                                     |
| ------ | ---------------------------------------- |
| 头像组 | `max` prop 控制最大显示数，溢出显示 "+N" |

### Alert

| 功能     | 说明                                           |
| -------- | ---------------------------------------------- |
| 自动关闭 | `duration` prop（毫秒，需 `closable` 为 true） |

### Tabs

| 功能     | 说明           |
| -------- | -------------- |
| 胶囊样式 | `type="pills"` |

### Dropdown

| 功能     | 说明                                              |
| -------- | ------------------------------------------------- |
| 键盘导航 | ↑↓/Home/End 在菜单项间导航                        |
| a11y     | `aria-controls` 指向菜单 ID，打开时自动聚焦第一项 |

## 常见问题

**Q: `visible` prop 还能用吗？**
A: 不能。v0.5.0 已完全移除 `visible` prop，请使用 `open`。

**Q: Button 的 `type` prop 是完全移除了吗？**
A: 是的。原来控制 `<button type="submit">` 的 `type` prop 已重命名为 `htmlType`。

**Q: 新增的 Design Token 如何使用？**
A: Token 通过 CSS 变量注入。详见 `skills/tigercat/references/theme.md`。
