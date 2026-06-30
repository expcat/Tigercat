---
name: tigercat-shared-patterns
description: Common patterns and framework differences for Tigercat UI components
---

# Common Patterns

框架共通模式与差异速查。术语表见 [glossary.md](../glossary.md)；组件定位先走 [component-index.md](../../component-index.md)。

## State And Events

| Vue                      | React                   | 示例                             |
| ------------------------ | ----------------------- | -------------------------------- |
| `v-model` / `modelValue` | `value` + `onChange`    | Input、Select、DatePicker        |
| `v-model:open` / `open`  | `open` + `onOpenChange` | Modal、Drawer、Popover           |
| `checked` / `modelValue` | `checked` / `value`     | Checkbox、Radio、Switch          |
| `@event-name`            | `onEventName`           | `@close` -> `onClose`            |
| `@update:*`              | `on*Change`             | `@update:open` -> `onOpenChange` |

Use `open` for display state. Do not introduce new `visible` / `onVisibleChange` APIs.

## Content And Styling

| Need            | Vue                      | React                   |
| --------------- | ------------------------ | ----------------------- |
| Default content | default slot             | `children`              |
| Named content   | named slot / scoped slot | node prop / render prop |
| Class           | `class`                  | `className`             |
| Native attrs    | undeclared attrs         | native props / `data-*` |
| Style           | `style`                  | `style`                 |

Root `class` / `className`, `style`, `data-*`, `aria-*`, `id`, and `title` are stable styling hooks and should pass through to the component root or equivalent native interaction element.

## Compound Components

Parent and child compound components live in the parent source file and are re-exported from the package entry. PascalCase package subpaths stay available through package exports.

| Layer       | Convention                                                            |
| ----------- | --------------------------------------------------------------------- |
| Source file | `components/Steps.ts(x)` exports `Steps`, `StepsItem`, and types      |
| Subpath     | `@expcat/tigercat-*/StepsItem` points to the parent output artifact   |
| Internal    | Same-package imports use the parent file to avoid circular re-exports |

Applies to `Steps` / `StepsItem`, `Breadcrumb` / `BreadcrumbItem`, `Tabs` / `TabPane`, `Anchor` / `AnchorLink`, and similar parent/child sets.

## Floating And Overlay

Tooltip, Popover, and Popconfirm share the floating-popup layer; Dropdown, Select, and combobox-style components follow the same open/trigger semantics.

| Layer          | File                                 | Role                                    |
| -------------- | ------------------------------------ | --------------------------------------- |
| Core types     | `core/types/floating-popup.ts`       | shared props and trigger types          |
| Core utils     | `core/utils/floating-popup-utils.ts` | ids and trigger handler maps            |
| Vue composable | `vue/utils/use-floating-popup.ts`    | open state, floating, dismiss, trigger  |
| React hook     | `react/utils/use-popup.ts`           | React counterpart for the same behavior |

Stable behavior:

- Controlled and uncontrolled `open` modes.
- Floating UI position state: `x`, `y`, `actualPlacement`, `floatingStyles`.
- Click-outside and Escape dismissal.
- Trigger modes: `click`, `hover`, `focus`, `manual`.
- Root trigger exposes `data-state="open" | "closed"` for CSS state styling.
- Interactive triggers also expose `aria-expanded`; generic Popover wrappers expose only `data-state`.

Custom trigger state is available through Vue `#trigger="{ open }"` slots and React render props such as Dropdown `renderTrigger={({ open }) => ...}`. Prefer these APIs over internal DOM selectors.

## SSR And Runtime

- Do not read `window`, `document`, `localStorage`, DOM size, or media queries at module top level.
- Put client-only Vue work in `onMounted`; React work in `useEffect` or client components.
- Portal, overlay, drag, copy, and upload behavior should return a stable placeholder or skip mounting outside the browser.
- Theme variables may be statically injected; runtime theme reads/writes must be client-only.
