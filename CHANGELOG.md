# Changelog

本文档记录 Tigercat UI 组件库的所有版本变更。

## v0.9.0 — 生态完善与质量冲刺

### 新增组件

- **InputGroup** — 输入框组合容器，支持前后缀、嵌套 Input/Select/Button
- **PrintLayout** — 打印布局组件，支持纸张尺寸、页眉/页脚、分页控制
- **ImageViewer** — 全功能图片查看器，支持缩放/旋转/翻页/键盘导航

### 组件增强

- **Alert** — 新增 `banner` 模式、`action` 插槽/prop
- **Steps** — 新增 `labelPlacement`、`progressDot` 属性
- **Breadcrumb** — 新增 `maxItems` 折叠显示、自定义分隔符

### API 一致性改进

- **ImagePreview**: `visible` → `open`（向后兼容，`visible` 标记为 `@deprecated`）
- **Image**: `preview-visible-change` → `preview-open-change`（Vue，向后兼容）
- **Image**: `onPreviewVisibleChange` → `onPreviewOpenChange`（React，向后兼容）
- **Calendar**: `panelChange` → `panel-change`（Vue，**不向后兼容**）
- **Rate**: `hoverChange` → `hover-change`（Vue，**不向后兼容**）

### a11y 改进

- 新增 `createFocusTrap()` — 焦点陷阱工具，支持 Tab/Shift+Tab 循环、Escape 回调
- 新增 `announceToScreenReader()` — 屏幕阅读器公告工具（aria-live region）
- 新增 `manageLiveRegion()` — 可管理的 live region 实例
- 所有新组件通过 axe-core a11y 自动化测试

### 测试

- 测试总量: 4619 tests / 237 test files
- 新增 ButtonGroup Vue/React 测试（23 tests）
- 增强 Dropdown Vue/React 测试（+8 tests）
- 增强 Tag Vue/React 测试（+8 tests）
- 新增 a11y-utils 测试（11 new tests）

### 工具链

- **API 一致性扫描器** `scripts/validate-api.mjs` — 全量组件 API 命名检查
- **CLI 脚手架** `@expcat/tigercat-cli` v0.9.0 — 项目初始化、组件生成

### 文档

- 新增 `MIGRATION_v0.9.0.md` 迁移指南
- 更新 Skills 文档（shared/props、vue/react 代码示例）
- 更新 ROADMAP.md v0.9.0 进度

---

## v0.8.0 — 高级交互与业务组件

详见 [MIGRATION_v0.8.0.md](MIGRATION_v0.8.0.md)

## v0.5.0 — 架构筑基

详见 [MIGRATION_v0.5.0.md](MIGRATION_v0.5.0.md)
