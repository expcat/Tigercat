---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

修复 `Table` 在 `columnLockable`（或存在固定列）时，横向滚动过程中锁定列 `position: sticky` 失效/抖动、未被真正钉住的问题。

- 根因：表格根使用 `border-collapse`，该模式下单元格 `<th>`/`<td>` 上的 `position: sticky` 表现不稳定。`Table` 现改用 `border-separate` + `border-spacing-0`，锁定/固定列在横向滚动时稳定钉住。
- 配合改动：`border-separate` 下 `<tr>`/`<thead>` 上的边框不绘制，故行/表头/展开行/分组表头/汇总行的横向分隔线已迁移到单元格（`<td>`/`<th>`）。视觉表现与此前一致，无公开 API 变更，消费方无需改动。
