---
'@expcat/tigercat-core': major
'@expcat/tigercat-vue': major
'@expcat/tigercat-react': major
---

任务 A 收尾：移除废弃别名并重命名 core 内部目录（A-4 / A-5）

- **Breaking**：移除废弃别名 `kanbanAddCardClasses`（core）。它自 v0.9.0 起仅作为 `taskBoardAddCardClasses` 的向后兼容别名，现已删除。请改用 `taskBoardAddCardClasses`（详见 [迁移指南](docs/MIGRATION.md)）。
- core 内部 `src/theme/` 目录重命名为 `src/theme-runtime/`，与命名预设主题目录 `src/themes/`（预设 + `ThemeManager` + modern token）区分。`THEME_CSS_VARS` / `setThemeColors` / `getThemeColor` 及各 `*Classes` 仍经主入口 `@expcat/tigercat-core` 导出，公共 API 与导出符号不变。
