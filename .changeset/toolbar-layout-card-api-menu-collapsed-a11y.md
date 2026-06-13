---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

### Toolbar 布局开放

- `toolbar.filters[].itemClass` 和 `itemStyle` 可逐项定制 filter 容器样式（`itemClass` 使用替换语义，提供时整体替换默认宽度类）。
- `toolbar.className`（追加）、`toolbar.style`（内联）和 `toolbar.searchClassName`（替换搜索框尺寸类）可定制工具栏容器和搜索框。
- `toolbar.render`（React）和 `#toolbar` 作用域插槽（Vue）完全替换内置工具栏区域（含 `role="toolbar"` 容器），通过 `TableToolbarRenderContext` 提供搜索/筛选/选择/列显隐等完整 context。

### 卡片 API 公开声明

- Vue `DataTableWithToolbar` 显式声明 `renderCard` 和 `cardClassName` props（此前通过 attrs 透传），现有行为不变。
- Vue `#card` 作用域插槽纳入公开 API（插槽优先于 `renderCard` prop）。

### Menu 折叠态无障碍增强

- 折叠菜单项现在以 `sr-only` 元素保留完整标签文本，供屏幕阅读器使用。
- 无图标时的首字母回退 span 添加 `aria-hidden="true"`，避免可访问名称重复。
- 折叠态图标去除 `mr-2` margin，改用无间距的 `flex-shrink-0`，确保图标居中。
- **行为变更**：折叠菜单项的可访问名称从首字母变为完整标签文本（如从 "A" 变为 "alpha"）。
