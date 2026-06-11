---
'@expcat/tigercat-core': patch
'@expcat/tigercat-vue': patch
'@expcat/tigercat-react': patch
---

修复 Table/VirtualTable 锁定列在斑马纹激活行的背景半透明问题：sticky 单元格改用 color-mix 不透明等效色（`tableFixedCellStripedClasses`），横向滚动时不再透出下层列内容。
