---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

DataTableWithToolbar 支持自定义工具栏过滤器

- `toolbar.filters[].render(context)` 可渲染自定义过滤控件，并通过 `setValue` / `setFilter` 发出过滤值。
- Vue 新增 `#filters-extra` 插槽，React 新增 `toolbar.filtersExtra`，用于在过滤器区域尾部注入额外控件。
- `TableToolbarFilterValue` 支持对象型值，可表达 `{ ageRange: { min, max } }` 等复合过滤条件。
