---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

- All overlay/disclosure triggers now expose a stable `data-state="open" | "closed"` attribute on their root as a documented styling hook. Previously only `Dropdown` had it; it is now consistent across `Select`, `Popconfirm`, `Popover`, `Menu` submenus, and the combobox triggers (`Cascader` / `TreeSelect` / `AutoComplete` / `Spotlight`, via `getPickerComboboxAria`). Interactive triggers also keep `aria-expanded` in sync; `Popover`'s trigger is a non-interactive wrapper and exposes only `data-state` (adding `aria-expanded` there would be invalid ARIA).
- Added a `getDisclosureStateAttr(open)` core helper that returns `{ 'data-state': 'open' | 'closed' }`.
- `Dropdown`, `Popover`, and `Popconfirm` can now render a custom trigger from open state without attribute-selector hacks: Vue exposes a `#trigger="{ open }"` scoped slot; React `Popover`/`Popconfirm` accept function children `({ open }) => ReactNode`, and `Dropdown` adds a `renderTrigger={({ open }) => …}` prop (`trigger` already configures the open event). Existing default-slot / children usage is unchanged.
- Documented as stable public API: trigger `aria-expanded` + `data-state`, the `trigger` slot / render-prop, and root-element `class`/`className` + unknown-attribute passthrough.
