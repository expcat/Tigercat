# Phase 2.9 — Advanced 组件审查 (2026-04)

> 范围：10 个组件 — CodeEditor, FileManager, ImageViewer, InfiniteScroll, Kanban, PrintLayout, RichTextEditor, TaskBoard, VirtualList, VirtualTable
> 共享 utils：`code-editor-utils.ts`、`file-manager-utils.ts`、`image-viewer-utils.ts`、`infinite-scroll-utils.ts`、`kanban-utils.ts`、`print-layout-utils.ts`、`rich-text-editor-utils.ts`、`task-board-utils.ts`、`virtual-list-utils.ts`、`virtual-table-utils.ts`

## 1. 体积现状

| 组件               | Vue dts | 备注                 |
| ------------------ | ------- | -------------------- |
| Kanban             | 5.3 KB  | 拖拽 + 列管理        |
| TaskBoard          | 5.4 KB  | 与 Kanban 重叠？     |
| FileManager        | 4.3 KB  | tree + grid          |
| VirtualTable       | 4.0 KB  | virtual + sticky col |
| ImageViewer        | 3.1 KB  | zoom + rotate + pan  |
| Resizable → Layout | —       | —                    |
| InfiniteScroll     | 2.6 KB  | sentinel observer    |
| CodeEditor         | —       | textarea wrapper?    |
| RichTextEditor     | 2.8 KB  | contenteditable      |
| PrintLayout        | 2.7 KB  | @media print         |

## 2. 代码层优化

| #   | 优化项                                                                                                                                                                                  | 优先级 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| A1  | **CodeEditor / RichTextEditor**：必须确认是**轻量自包装**（不打包 monaco / quill / prosemirror）。若内嵌重型库会显著增大体积 → 应该是 thin shell + 用户自己引入引擎；提供 `engine` prop | **P0** |
| A2  | **Kanban vs TaskBoard**：两者职责高度重叠，是否可合并为 `Kanban` 一个组件 + `TaskBoard` 作为预设？                                                                                      | **P0** |
| A3  | **VirtualList / VirtualTable**：核心实现应集中在 `virtual-*-utils.ts`，组件只负责渲染。检查是否两端有重复 measure 逻辑                                                                  | P1     |
| A4  | **VirtualList**：fixed-size / variable-size / dynamic-size 三种应通过策略模式而非分支                                                                                                   | P1     |
| A5  | **InfiniteScroll**：使用 `IntersectionObserver` 监听 sentinel，确认无 scroll 事件方案                                                                                                   | P1     |
| A6  | **FileManager**：tree + grid + breadcrumb 三视图共享 model；拖拽用 `useDrag`                                                                                                            | P1     |
| A7  | **ImageViewer**：手势识别（pinch / pan）应抽到 core util，避免自己写                                                                                                                    | P1     |
| A8  | **Kanban / TaskBoard**：拖拽用 HTML5 DnD or pointer events？建议统一 pointer + `useDrag`，HTML5 DnD 跨浏览器一致性差                                                                    | P1     |
| A9  | **PrintLayout**：仅是 CSS @page 包装，可改为 stylesheet + class util，不一定需要组件                                                                                                    | P2     |
| A10 | **RichTextEditor**：toolbar 按钮列表可配置；命令注册支持插件（ProseMirror 风格）                                                                                                        | P2     |
| A11 | **VirtualTable**：sticky 列 + sticky header 同时启用时性能瓶颈，需测试 1000 列 + 10k 行                                                                                                 | P1     |

## 3. 样式现代化清单

| 组件                           | 现代化方案                                                                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **CodeEditor**                 | gutter 玻璃；行号 tabular-nums；当前行高亮渐变；提供 `theme` prop 对接 prism/shiki                                                     |
| **RichTextEditor**             | toolbar 玻璃 sticky；按钮 hover spring；分隔符渐变                                                                                     |
| **Kanban / TaskBoard**         | 列玻璃 + `--tiger-radius-lg`；卡片圆角 `--tiger-radius-md` + 微阴影；拖拽 ghost spring 跟随 + 半透；放置区高亮渐变；WIP limit 角标渐变 |
| **FileManager**                | 双栏玻璃；面包屑 sticky；tile 视图圆角；hover 微抬升 spring                                                                            |
| **ImageViewer**                | 工具栏玻璃 floating；图片容器 dark glass 背景；缩放 spring；指示器 pill                                                                |
| **InfiniteScroll loader**      | 旋转 spring；finished 状态淡入                                                                                                         |
| **VirtualList / VirtualTable** | 滚动条玻璃化 + hover 加粗                                                                                                              |
| **PrintLayout**                | 屏幕预览态加纸张投影 (`--tiger-shadow-lg`)                                                                                             |

## 4. 演示案例改进

| 组件                                   | 缺失/可强化                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------ |
| **CodeEditorDemo**                     | 加 highlighter 集成 (prism/shiki) 示例；加 line wrapping / autocompletion 演示 |
| **RichTextEditorDemo**                 | 加 toolbar 自定义 + 命令 API 演示                                              |
| **KanbanDemo / TaskBoardDemo**         | 合并为一个完整产品 demo（Trello 风格）；加 column reorder + WIP limit          |
| **FileManagerDemo**                    | 加 tree + grid 视图切换 + 拖拽上传 + breadcrumb                                |
| **ImageViewerDemo**                    | 加多图浏览 + 手势 + thumb                                                      |
| **InfiniteScrollDemo**                 | 加双向（向上加载历史）+ 错误重试                                               |
| **VirtualListDemo / VirtualTableDemo** | 加大数据 (100k) + 动态高度 + 跳转到 index 演示                                 |
| **PrintLayoutDemo**                    | 加完整发票 / 报表打印演示                                                      |

## 5. 风险与依赖

- A1 是 **P0 重大**：必须先核实 CodeEditor / RichTextEditor 是否携带重型引擎；若是则需架构调整
- A2 (Kanban vs TaskBoard 合并) 涉及破坏性 API 变更，需 v2.0.0 里程碑
- A3-A4 性能优化对 VirtualList/Table 关键
- 样式现代化依赖 Phase 1C
- 玻璃化在大数据场景需提供禁用开关（`glass={false}`）
