---
'@expcat/tigercat-core': minor
'@expcat/tigercat-vue': minor
'@expcat/tigercat-react': minor
---

Table 列显隐控制与 Dropdown body portal

- **Table**: 新增 `hiddenColumnKeys`（受控）/ `defaultHiddenColumnKeys`（非受控）列显隐 API；React `onHiddenColumnsChange` 回调，Vue `v-model:hidden-column-keys`；`TableColumn` 新增 `hideable`。
- **DataTableWithToolbar**: `toolbar.showColumnSettings` 开启内置列设置面板（Popover + Checkbox），支持 `columnSettings.lockedColumnKeys` 锁定列与 locale 文案。
- **Dropdown（行为变更）**: 菜单默认渲染到 `document.body`（portal/Teleport，zIndex 1000），不再被表格固定列遮挡或 overflow 容器裁剪；`portal: false` 可恢复原位渲染。
