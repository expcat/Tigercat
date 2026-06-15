---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

修复 `Table` 在 `columnLockable`（或存在固定列）时切换锁定导致列宽抖动、sticky 偏移错位的问题。

- 当 `columnLockable` 开启或存在 `fixed` 列时，`Table` 现在渲染 `<colgroup>` + `<col>` 钉死每列宽度，使列宽与 `fixed`/锁定状态解耦——切换锁定不再改变任何列宽，sticky 偏移保持准确。
- 有声明 `width` 的列使用声明值；无声明宽度的列冻结首次实测宽度，切断「测量 → 偏移 → 重排 → 再测量」反馈环。
- core 新增并导出 `getTableColgroup`、`resolveTableColumnWidth`、`freezeTableColumnWidths` 工具函数。
