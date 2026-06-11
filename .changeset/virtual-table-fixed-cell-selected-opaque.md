---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

修复 VirtualTable 选中行锁定列单元格背景半透明问题：sticky 单元格的选中背景改用 color-mix 不透明等效色（`virtualTableFixedCellSelectedClasses`），横向滚动时不再透出下层列内容。
