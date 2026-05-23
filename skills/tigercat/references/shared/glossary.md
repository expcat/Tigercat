---
name: tigercat-shared-glossary
description: Shared Tigercat terminology for Vue and React component docs
---

# Tigercat Glossary

<!-- LLM-INDEX
type: terminology-reference
scope: shared Vue/React component docs
key-terms: slot/children, emit/callback, attrs/props, v-model/controlled, open, className, theme token, locale
-->

跨框架术语速查。文档和示例中优先使用本页术语，减少 Vue 与 React 写法重复解释。

---

## Framework Concepts

| Concept      | Vue Term     | React Term                 | Use In Docs                                 |
| ------------ | ------------ | -------------------------- | ------------------------------------------- |
| 组件内容     | slot         | children                   | 描述默认内容区域时写 `slot / children`      |
| 命名内容区域 | named slot   | render prop / node prop    | 描述 `title`、`footer`、`icon` 等可替换区域 |
| 事件         | emit / event | callback                   | 事件表写 `Vue Event` 与 `React Callback`    |
| 双向绑定     | `v-model`    | controlled prop + callback | 表单值、开关状态、弹层 open 状态            |
| 外部属性     | attrs        | native props               | 透传到根节点或原生元素的属性                |
| 类名         | `class`      | `className`                | 自定义类名统一说明为 `class / className`    |
| 内联样式     | `style`      | `style`                    | 两端同名，类型按框架分别处理                |
| 默认值       | prop default | default prop value         | Props 表统一写 `Default`                    |

---

## State Naming

| State        | Vue                                 | React                         | Notes                                    |
| ------------ | ----------------------------------- | ----------------------------- | ---------------------------------------- |
| 输入值       | `modelValue` + `@update:modelValue` | `value` + `onChange`          | Input、Select、DatePicker、TimePicker 等 |
| 选中状态     | `checked` / `modelValue`            | `checked` / `value`           | Checkbox、Radio、Switch 按组件语义选择   |
| 弹层显示     | `open` + `@update:open`             | `open` + `onOpenChange`       | Modal、Drawer、Popover、Dropdown 等      |
| 废弃显示别名 | `visible`                           | `visible` / `onVisibleChange` | 仅用于迁移说明，不再新增 API             |
| 非受控初始值 | `defaultValue`                      | `defaultValue`                | 仅在组件明确支持时记录                   |

---

## API Table Terms

| Term         | Meaning                                                              |
| ------------ | -------------------------------------------------------------------- |
| Prop         | 组件入参。Vue 与 React 同名时只写一次；差异较大时拆成 Vue/React 列。 |
| Event        | Vue 事件，使用 kebab-case 或 `update:*` 形式。                       |
| Callback     | React 回调，使用 `onXxx` camelCase 形式。                            |
| Slot         | Vue 插槽，默认插槽写 `default`。                                     |
| Children     | React `children` 内容。                                              |
| Render Prop  | React 中接收函数或节点来自定义局部 UI 的 prop。                      |
| Native Props | 组件透传的原生元素属性，React 侧通常通过 `Omit<...>` 避免冲突。      |

---

## Styling And Theme Terms

| Term         | Meaning                                                             |
| ------------ | ------------------------------------------------------------------- |
| Variant      | 语义样式变体，如 `primary`、`success`、`danger`。                   |
| Size         | 尺寸枚举，常见为 `sm`、`md`、`lg`，少数组件支持 `xs`、`xl` 或数字。 |
| Theme Token  | CSS 变量形式的设计 token，命名以 `--tiger-*` 开头。                 |
| Preset       | 主题预设，由 core theme helpers 或 Tailwind plugin 注入。           |
| Dark Mode    | 通过 `.dark` 或主题变量切换暗色模式。                               |
| Modern Style | 通过 `data-tiger-style="modern"` 启用的现代视觉样式。               |

---

## Interaction Terms

| Term         | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| Trigger      | 触发弹层显示的方式，如 `click`、`hover`、`focus`、`manual`。 |
| Placement    | 弹层或浮动元素的位置，如 `top`、`bottom-start`。             |
| Controlled   | 外部传入状态并监听变更回调。                                 |
| Uncontrolled | 组件内部维护状态，外部可提供初始值。                         |
| Dismiss      | 通过 Escape、点击外部、关闭按钮等方式关闭。                  |
| A11y Label   | 无障碍名称，通常来自 `aria-label` 或可见文本。               |

---

## Architecture Terms

| Term                    | Meaning                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| Core                    | `@expcat/tigercat-core`，存放类型、工具、主题和框架无关逻辑。          |
| Vue Layer               | `@expcat/tigercat-vue`，负责 Vue 渲染、slots、emits、attrs。           |
| React Layer             | `@expcat/tigercat-react`，负责 React 渲染、refs、callbacks、children。 |
| Shared Utils            | 可跨框架复用的工具函数，放在 `packages/core/src/utils/`。              |
| Compound Component      | 父子组合组件，如 `Tabs` / `TabPane`、`Steps` / `StepsItem`。           |
| Compatibility Re-export | 旧子组件文件只 re-export，保持深路径导入兼容。                         |
| SSR Guard               | 浏览器 API 访问前使用 `isBrowser()` 或等价守卫。                       |
| Locale                  | 组件文案国际化配置，统一来自 locale 系统。                             |
