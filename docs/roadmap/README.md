# Tigercat 未实现路线图

<!-- LLM-INDEX
type: active-roadmap
scope: docs/roadmap unresolved work only
verified-date: 2026-05-05
source: consolidated from old 00-06 specs, appendix docs, and docs/reports/2026-04
-->

本文档只保留旧路线图与 `docs/reports/2026-04` 中尚未实现、仍需后续设计或仍需复核的内容。已经完成、已有 Vue / React 源码与公开导出的组件，或只属于阶段执行记录的报告，不再在这里重复跟踪。

## 执行状态

- 上一步完成：P1 TaskBoard 拖拽技术债 — Core 新增 `createTaskBoardDragController` 统一 HTML5 DnD + touch + keyboard 三套拖拽逻辑为共享 headless controller；Vue/React TaskBoard 消除 ~250 行/框架的重复 handler 代码，改为委托 controller；新增 22 条 controller 单元测试，构建与全部 151 条相关测试通过。
- 推荐下一步：P1 VirtualTable 压测 — sticky header + sticky column 同时启用时测试 1000 列 / 10k 行性能。

## 未实现组件

| 优先级 | 项目      | 范围                                  | 完成标准                                                                                                            |
| ------ | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P3     | PDFViewer | Vue / React / Core 类型 / 文档 / 测试 | 提供 PDF 预览组件；支持文件 URL 或二进制输入、页码导航、缩放、加载/错误状态、键盘可访问性；两端导出并补齐测试与示例 |

## 后续更新事项

### 工具链 / i18n / CLI

| 优先级   | 项目                            | 范围                                      | 完成标准                                                                                                          |
| -------- | ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1       | Node engines bump               | workspace / CI / release workflow         | 评估根包、packages、examples、CI、发布 workflow 的 Node 20+ 影响，并明确升级窗口                                  |
| P1       | workspace catalog / overrides   | pnpm workspace / 核心工具链依赖           | 在 `pnpm-workspace.yaml` 增加 catalog 或 overrides，统一 Vue、React、TypeScript、Tailwind、tsup 等版本来源        |
| P1       | 根入口 locale tree-shaking 方案 | Core i18n barrel / locale presets         | 当前根入口仍会经 `utils/i18n` re-export 全部 locale；需决定保留兼容 barrel，或引入更轻的 locale-only 默认导出策略 |
| P1       | CLI 模板版本策略                | CLI React / Vue 模板                      | 模板依赖范围改为 catalog、overrides 或与根 lockfile 对齐的版本策略，避免长期漂移                                  |
| P1       | CLI Windows bin 验证            | CLI bin / package manager shims           | README 或测试覆盖 pnpm、npm、bun 在 Windows 下的 `.cmd` shim 与路径分隔符行为                                     |
| P2       | ConfigProvider 异步 locale      | React ConfigProvider / Vue ConfigProvider | Vue / React 支持 `locale={() => import(...)}` 或等价 loader，并处理 loading、error、fallback                      |
| Deferred | commander 14                    | CLI                                       | 根 `engines.node` 提升到 Node 20+ 后再升级 commander，并跑模板生成回归                                            |

### Basic / Form

| 优先级 | 项目                       | 范围                          | 完成标准                                                                  |
| ------ | -------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| P2     | Empty 默认插画体积         | Empty                         | 评估 CSS-only、可替换外部插画或按需插画策略                               |
| P2     | Divider 文件合并评估       | Divider / Space / layout util | 评估是否与 Space 或 layout util 合并，保持子路径兼容                      |
| P2     | Radio / Checkbox icon 体积 | Radio / Checkbox              | 评估 CSS mask 替代 inline SVG 的收益和兼容性                              |
| P2     | Form 命令式 API            | Form                          | 设计 `useFormController` / `useTigerForm`，明确与现有 Form API 的兼容关系 |

### Layout / Navigation / Data

| 优先级 | 项目                          | 范围            | 完成标准                                                            |
| ------ | ----------------------------- | --------------- | ------------------------------------------------------------------- |
| P2     | Descriptions 大列表性能       | Descriptions    | 对 100+ items columns / rows 合并算法做复杂度测试或 benchmark       |
| P2     | Container 组件必要性          | Container       | 评估是否改为 class util；若保留组件，说明体积与 API 理由            |
| P2     | FloatButton group memo        | FloatButton     | 子按钮列表缓存，避免不必要重建                                      |
| P2     | Steps vertical pseudo-element | Steps           | vertical 连接线改用 CSS pseudo-element 或确认保留 inline div 的理由 |
| P2     | Timeline pseudo-element       | Timeline        | 节点/连接线减少额外 DOM，改用 CSS pseudo-element 或说明保留原因     |

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
| P1     | VirtualTable 压测            | VirtualTable                                                             | sticky header + sticky column 同时启用时测试 1000 列 / 10k 行性能                         |
| P1     | Advanced 交互测试补强        | FileManager / ImageViewer / InfiniteScroll / VirtualList / VirtualTable  | 增加边界与性能回归                                                                        |
| P2     | Chart benchmark 补齐         | GaugeChart / chart interaction                                           | benchmark 覆盖 Gauge 计算与 interaction 热路径                                           |
| P2     | Composite 配方化             | DataTableWithToolbar / CropUpload / FormWizard                           | 评估是否转 cookbook 配方；若保留组件，说明体积边界                                        |
| P2     | PrintLayout stylesheet 化    | PrintLayout                                                              | 评估改为 stylesheet + class util，若保留组件需说明收益                                    |
| P2     | RichText toolbar 插件化      | RichTextEditor                                                           | toolbar 命令注册支持插件配置，并保持默认轻量 engine                                       |

## 待复核质量项

这些条目不是新组件规划，而是旧路线图中仍适合在发布前复核的质量门槛。若已有独立报告或 CI 覆盖，可在对应报告中关闭，不需要再扩写成版本规格。

| 优先级 | 项目                   | 复核重点                                                                                                           | 完成标准                                                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| P1     | 组件 API 一致性        | Vue 事件 kebab-case、React 事件 camelCase、Props 默认值与类型导出                                                  | API 扫描或人工审查无阻塞项；差异记录到迁移指南或 skills 文档                                                |
| P1     | a11y AA 回归           | overlay、picker、table、form、advanced components 的键盘与 ARIA 行为                                               | 自动化 a11y 测试与关键手动流程通过                                                                          |
| P1     | 测试与覆盖率门槛       | 单元、集成、e2e、视觉回归是否仍符合当前发布目标                                                                    | 不低于 2026-05-04 基线：statements 80.51%、branches 74.17%、functions 81.20%、lines 82.59%；关键 e2e 不回退 |
| P1     | 低覆盖热点补强         | TaskBoard、Watermark、CropUpload、FloatButton、Empty、Result、FunnelChart、GaugeChart、SunburstChart、TreeMapChart | 优先补边界、交互、渲染分支与性能回归，逐步关闭覆盖率热点                                                    |
| P2     | Bundle 与 tree-shaking | advanced components、locales、charts 是否可按需裁剪                                                                | size/bundle 检查无异常增长；locale 按需入口可用                                                             |
| P2     | 文档完整性             | 组件 API、主题、i18n、迁移指南、示例入口                                                                           | 新增或变更组件均有 props 文档、Vue/React 示例和迁移说明                                                     |

## 维护规则

1. 新增组件或显著功能只在这里记录尚未完成的条目。
2. 一旦 Vue / React 实现、导出、测试和文档齐全，就从本文档移除。
3. 阶段报告中的后续 Todo 合并到本文档后，报告文件不再作为活跃规划来源保留。
4. 历史版本叙述、竞品矩阵、长代码模板不再放入 `docs/roadmap`；组件 API 写入 `skills/tigercat/references/`，发布变更写入迁移指南或 changelog。
