# Tigercat 未实现路线图

<!-- LLM-INDEX
type: active-roadmap
scope: docs/roadmap unresolved work only
verified-date: 2026-05-05
source: consolidated from old 00-06 specs and appendix docs
-->

本文档只保留旧路线图中尚未实现或仍需要复核的内容。已经在 Vue / React 两端有源码与公开导出的组件，不再在这里重复跟踪。

## 实现核对口径

核对来源：`packages/react/src/index.tsx`、`packages/vue/src/index.ts`、`packages/*/src/components/`、`packages/core/src/`、`packages/cli/src/`。

旧 `v0.6.0` 到 `v0.9.0` 规划中的新增组件，除 `PDFViewer` 外均已找到 Vue / React 实现与导出，包括 Cascader、TreeSelect、AutoComplete、Transfer、ColorPicker、Rate、VirtualList、Calendar、Statistic、Segmented、Mentions、QRCode、Result、Empty、Watermark、Tour、FloatButton、Affix、TreeMapChart、HeatmapChart、FunnelChart、GaugeChart、SunburstChart、RichTextEditor、CodeEditor、Splitter、Resizable、Kanban、VirtualTable、InfiniteScroll、FileManager、InputGroup、PrintLayout、ImageViewer 等。

同时，旧规格中的主题、Token、拖拽、CLI、locale subpath exports 等系统能力已在仓库中找到对应实现痕迹，因此不再保留历史设计稿式说明。

## 未实现组件

| 优先级 | 项目 | 范围 | 完成标准 |
| ------ | ---- | ---- | -------- |
| P3 | PDFViewer | Vue / React / Core 类型 / 文档 / 测试 | 提供 PDF 预览组件；支持文件 URL 或二进制输入、页码导航、缩放、加载/错误状态、键盘可访问性；两端导出并补齐测试与示例 |

## 待复核质量项

这些条目不是新组件规划，而是旧路线图中仍适合在发布前复核的质量门槛。若已有独立报告或 CI 覆盖，可在对应报告中关闭，不需要再扩写成版本规格。

| 优先级 | 项目 | 复核重点 | 完成标准 |
| ------ | ---- | -------- | -------- |
| P1 | 组件 API 一致性 | Vue 事件 kebab-case、React 事件 camelCase、Props 默认值与类型导出 | API 扫描或人工审查无阻塞项；差异记录到迁移指南或 skills 文档 |
| P1 | a11y AA 回归 | overlay、picker、table、form、advanced components 的键盘与 ARIA 行为 | 自动化 a11y 测试与关键手动流程通过 |
| P1 | 测试与覆盖率门槛 | 单元、集成、e2e、视觉回归是否仍符合当前发布目标 | CI 中覆盖率和关键 e2e 不回退 |
| P2 | Bundle 与 tree-shaking | advanced components、locales、charts 是否可按需裁剪 | size/bundle 检查无异常增长；locale 按需入口可用 |
| P2 | 文档完整性 | 组件 API、主题、i18n、迁移指南、示例入口 | 新增或变更组件均有 props 文档、Vue/React 示例和迁移说明 |

## 维护规则

1. 新增组件或显著功能只在这里记录尚未完成的条目。
2. 一旦 Vue / React 实现、导出、测试和文档齐全，就从本文档移除。
3. 历史版本叙述、竞品矩阵、长代码模板不再放入 `docs/roadmap`；组件 API 写入 `skills/tigercat/references/`，发布变更写入迁移指南或 changelog。
