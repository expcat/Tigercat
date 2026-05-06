# Tigercat 未实现路线图

<!-- LLM-INDEX
type: active-roadmap
scope: docs/roadmap unresolved work only
verified-date: 2026-05-05
source: consolidated from old 00-06 specs, appendix docs, and docs/reports/2026-04
-->

本文档只保留旧路线图与 `docs/reports/2026-04` 中尚未实现、仍需后续设计或仍需复核的内容。已经完成、已有 Vue / React 源码与公开导出的组件，或只属于阶段执行记录的报告，不再在这里重复跟踪。

## 执行状态

- 上一步完成：P2 RichText toolbar 插件化 — 已实现。ToolbarButton 新增 `action?: (element: HTMLElement) => void` 自定义回调，新增 ToolbarSeparator 分隔符类型与 ToolbarItem 联合类型，icon 字段可渲染，findHotkeyMatch 返回完整 button 对象以支持自定义动作。Core/Vue/React 三层同步，128 测试全通过（含 7 条新增）。默认行为保持 100% 向后兼容。
- 推荐下一步：P1 组件 API 一致性 — Vue 事件 kebab-case、React 事件 camelCase、Props 默认值与类型导出扫描审查。

## 未实现组件

| 优先级 | 项目      | 范围                                  | 完成标准                                                                                                            |
| ------ | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P3     | PDFViewer | Vue / React / Core 类型 / 文档 / 测试 | 提供 PDF 预览组件；支持文件 URL 或二进制输入、页码导航、缩放、加载/错误状态、键盘可访问性；两端导出并补齐测试与示例 |

## 后续更新事项

### 工具链 / i18n / CLI

| 优先级   | 项目                            | 范围                                      | 完成标准                                                                                                          |
| -------- | ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1       | ~~Node engines bump~~               | ~~workspace / CI / release workflow~~         | ~~已完成：engines >=20.11.0、tsconfig ES2022、CI node-version 22、CLI doctor MIN_NODE_MAJOR=20~~ |
| P1       | ~~workspace catalog / overrides~~   | ~~pnpm workspace / 核心工具链依赖~~           | ~~已完成：13 个 catalog 条目，41 处 package.json 统一为 catalog: 引用~~ |
| P1       | ~~根入口 locale tree-shaking 方案~~ | ~~Core i18n barrel / locale presets~~         | ~~已完成：根入口移除 locale re-export，保留子路径按需引入，vitest alias 补齐~~ |
| P1       | ~~CLI 模板版本策略~~                | ~~CLI React / Vue 模板~~                      | ~~已完成：TEMPLATE_VERSIONS 常量集中管理 13 个依赖版本，与 catalog 对齐~~ |
| P1       | ~~CLI Windows bin 验证~~            | ~~CLI bin / package manager shims~~           | ~~已完成：6 条跨平台路径测试 + README Windows Support 章节，覆盖 .cmd shim 与路径行为~~ |
| P2       | ~~ConfigProvider 异步 locale~~      | ~~React ConfigProvider / Vue ConfigProvider~~ | ~~已完成：locale prop 支持 loader/Promise/静态对象，localeLoading 自动传播，16 条测试通过~~ |
| Deferred | commander 14                    | CLI                                       | 根 `engines.node` 提升到 Node 20+ 后再升级 commander，并跑模板生成回归                                            |

### Basic / Form

| 优先级 | 项目                       | 范围                          | 完成标准                                                                  |
| ------ | -------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| P2     | ~~Empty 默认插画体积~~         | ~~Empty~~                         | ~~已评估：inline SVG ~687B，CSS-only 无明显收益，保留现有方案（slot/prop 已支持自定义）~~ |
| P2     | ~~Divider 文件合并评估~~       | ~~Divider / Space / layout util~~ | ~~已评估：类型/props/DOM/语义完全正交，合并会退化 tree-shaking，保持独立~~ |
| P2     | ~~Radio / Checkbox icon 体积~~ | ~~Radio / Checkbox~~              | ~~已评估：两者均无 inline SVG（Radio 纯 CSS 圆点，Checkbox 原生 input），前提不成立~~ |
| P2     | ~~Form 命令式 API~~            | ~~Form~~                          | ~~已完成：`useFormController` hook/composable，FormController 接口，28 条测试通过~~ |

### Layout / Navigation / Data

| 优先级 | 项目                          | 范围            | 完成标准                                                            |
| ------ | ----------------------------- | --------------- | ------------------------------------------------------------------- |
| P2     | ~~Descriptions 大列表性能~~       | ~~Descriptions~~    | ~~已验证：O(n) 线性算法，1000 items ~10–30μs，benchmark 7 项全通过，无瓶颈~~ |
| P2     | ~~Container 组件必要性~~          | ~~Container~~       | ~~已评估：保留组件。getContainerClasses 已导出供 class-only 用法；组件族一致性 + as 多态 + 体积极小~~ |
| P2     | ~~FloatButton group memo~~        | ~~FloatButton~~     | ~~已评估：无需改动。children/slots 外部传入仅条件渲染，React useMemo/useCallback + Vue computed 已缓存派生值~~ |
| P2     | ~~Steps vertical pseudo-element~~ | ~~Steps~~           | ~~已评估：保留 inline div。动态状态颜色 + 6 种 size 组合 + DOM 极小 + 测试可查询，pseudo 无优势~~ |
| P2     | ~~Timeline pseudo-element~~       | ~~Timeline~~        | ~~已评估：保留 inline div。dot 支持自定义子元素/slot + 动态 color inline style + 3 种 mode 定位 + pending animate，pseudo 无法实现~~ |

### Charts / Composite / Advanced

| 优先级 | 项目                         | 范围                                                                     | 完成标准                                                                                  |
| ------ | ---------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| P1     | ~~NotificationCenter 缓存~~  | ~~NotificationCenter~~                                                       | ~~已完成：分组、标签、已读未读派生数据使用 useMemo / computed，移除死代码~~ |
| P1     | ~~ActivityFeed / Timeline 复用~~ | ~~ActivityFeed / Timeline~~                                                  | ~~已完成：Core 新增 ActivityTimelineItem 类型与共享布局 class 常量，Vue/React 消除重复~~ |
| P1     | ~~Composite a11y 角色~~      | ~~DataTableWithToolbar / NotificationCenter / ActivityFeed / CommentThread~~ | ~~已完成：feed、region、toolbar 等 ARIA 角色明确，并补 12 条回归测试~~ |
| P1     | ~~VirtualList 策略化~~       | ~~VirtualList~~                                                              | ~~已完成：Core 新增 VirtualListSizeStrategy 接口与 fixed/variable/dynamic 三策略，Vue/React 统一消费~~ |
| P1     | ~~InfiniteScroll IO~~        | ~~InfiniteScroll~~                                                       | ~~已完成：Core 新增 createInfiniteScrollObserver，Vue/React 重构为 IO sentinel + scroll fallback~~ |
| P1     | ~~FileManager 共享 model~~   | ~~FileManager~~                                                          | ~~已完成：Core 新增 deriveFileManagerModel 等共享函数 + drag 集成，Vue/React 统一消费~~ |
| P1     | ~~ImageViewer 手势 util~~    | ~~ImageViewer~~                                                          | ~~已完成：Core 新增 GestureTransform + wheel/pan/pinch 工具，Vue/React 集成触控手势~~ |
| P1     | ~~TaskBoard 拖拽技术债~~     | ~~TaskBoard~~                                                            | ~~已完成：Core 新增 TaskBoardDragController 统一三套拖拽，Vue/React 消除重复 handler~~ |
| P1     | ~~VirtualTable 压测~~          | ~~VirtualTable~~                                                             | ~~已完成：sticky header + sticky column 同时启用，benchmark 覆盖 1000 列 × 10k 行，render prep ~1.8ms/帧~~ |
| P1     | ~~Advanced 交互测试补强~~        | ~~FileManager / ImageViewer / InfiniteScroll / VirtualList / VirtualTable~~  | ~~已完成：新增 48 条边界与交互测试，覆盖零项/disabled/极值/变换重置等场景，全部通过~~ |
| P2     | ~~Chart benchmark 补齐~~         | ~~GaugeChart / chart interaction~~                                           | ~~已完成：新增 21 项 benchmark 覆盖 Gauge 计算与 interaction 热路径，全部通过无瓶颈~~ |
| P2     | ~~Composite 配方化~~             | ~~DataTableWithToolbar / CropUpload / FormWizard~~                           | ~~已评估：均保留。独有逻辑复杂度高，已完整交付，tree-shaking 可裁剪，配方化收益极低~~ |
| P2     | ~~PrintLayout stylesheet 化~~    | ~~PrintLayout~~                                                              | ~~已评估：保留组件。零逻辑但体积极小 (169 行)，class util 已可用，组件提供 a11y 属性便利性~~ |
| P2     | ~~RichText toolbar 插件化~~   | ~~RichTextEditor~~                                                       | ~~已完成：ToolbarButton.action 自定义回调 + ToolbarSeparator 分隔符 + ToolbarItem 联合类型 + icon 渲染，向后兼容~~ |

## 待复核质量项

这些条目不是新组件规划，而是旧路线图中仍适合在发布前复核的质量门槛。若已有独立报告或 CI 覆盖，可在对应报告中关闭，不需要再扩写成版本规格。

| 优先级 | 项目                   | 复核重点                                                                                                           | 完成标准                                                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| P1     | 组件 API 一致性        | Vue 事件 kebab-case、React 事件 camelCase、Props 默认值与类型导出                                                  | API 扫描或人工审查无阻塞项；差异记录到迁移指南或 skills 文档                                                |
| P1     | ~~a11y AA 回归~~           | ~~overlay、picker、table、form、advanced components 的键盘与 ARIA 行为~~                                               | ~~已完成：27 条跨框架 a11y 回归测试 + 原有 34 条，合计 61 条通过~~ |
| P1     | ~~测试与覆盖率门槛~~       | ~~单元、集成、e2e、视觉回归是否仍符合当前发布目标~~                                                                    | ~~已完成（2026-05-06）：307 文件 5570 测试全通过；Stmts 83.82% / Br 77.05% / Fn 85.42% / Lines 85.86%，四项均超基线~~ |
| P1     | 低覆盖热点补强         | TaskBoard、Watermark、CropUpload、FloatButton、Empty、Result、FunnelChart、GaugeChart、SunburstChart、TreeMapChart | 优先补边界、交互、渲染分支与性能回归，逐步关闭覆盖率热点                                                    |
| P2     | Bundle 与 tree-shaking | advanced components、locales、charts 是否可按需裁剪                                                                | size/bundle 检查无异常增长；locale 按需入口可用                                                             |
| P2     | 文档完整性             | 组件 API、主题、i18n、迁移指南、示例入口                                                                           | 新增或变更组件均有 props 文档、Vue/React 示例和迁移说明                                                     |

## 维护规则

1. 新增组件或显著功能只在这里记录尚未完成的条目。
2. 一旦 Vue / React 实现、导出、测试和文档齐全，就从本文档移除。
3. 阶段报告中的后续 Todo 合并到本文档后，报告文件不再作为活跃规划来源保留。
4. 历史版本叙述、竞品矩阵、长代码模板不再放入 `docs/roadmap`；组件 API 写入 `skills/tigercat/references/`，发布变更写入迁移指南或 changelog。
