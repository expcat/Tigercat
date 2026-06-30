# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 breaking component API simplification and grouped validation plan
verified-date: 2026-06-30
source: current repository state after R18 Charts completion and R20 composite/business cleanup (v2.0 release hardening deferred)
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节与发布收口记录不再保留在路线图中；R01-R18 已完成任务的详细执行记录归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，需要历史证据时从归档、git 历史、变更日志或对应提交中查找。

## 当前状态

截至 2026-06-30，上一轮 T01-T14 已完成，v2.0.0 已完成 R01-R18 基础设施、API 审计与前七个组件批次清理：包体积、按需加载、发布产物、ESM-only、显式 exports、sideEffects、首批兼容层、legacy token/icon 资源清理、按组件组验证通道、core/shared contracts 删除合并清单、Basic/Layout 轻量组件 API 清理、Feedback/overlay open/portal/focus/close lifecycle 收敛、Form primitives 受控模型与尺寸别名清理、Form composite selectors 搜索/空态/模型别名与 heavy helper 拆分、Navigation 受控回调和子组件 subpath 产物收敛、Data/table stack 数据、选择与虚拟滚动入口统一，以及 Charts/visualization 类型拆分和 tooltip 命名收敛已经落地。R20 Composite/business 组件 API 清理也已于 2026-06-30 提前完成（移除 Kanban 数据模型别名、收敛 DataTableWithToolbar 业务回调、拆分 composite 巨型类型文件），但 R20 不再作为 v2.0.0 的发布收口任务；发布前仍需完成 R19 与最终发布门禁，v2.0.0 后续仍会追加新的更新计划，本批次不准备发布版本。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0（R01 Roadmap cleanup）、阶段 1（R02 version and release metadata、R03 ESM-only build surface）、阶段 2（R04 explicit exports and public component facts、R05 tree-shaking and sideEffects）、阶段 3（R06 remove deprecated and compatibility APIs、R07 token and legacy asset cleanup）与阶段 4（R08 on-demand usage docs and examples、R09 size and publish artifact gates），已完成于 2026-06-28；阶段 5（R10 grouped validation, docs, and examples infrastructure）、阶段 6（R11 Core API and shared contracts audit）、阶段 7（R12 Basic + Layout lightweight components）、阶段 8（R13 Feedback and overlay components）、阶段 9（R14-R15 Form primitives 与 composite selectors）、阶段 10（R16 Navigation components）和阶段 11（R17 Data and table stack）已完成于 2026-06-29；阶段 12（R18 Charts and visualization stack）已完成于 2026-06-30。阶段 14（R20 Composite/business components）的组件级 API 清理已于 2026-06-30 提前完成，但其 v2.0 发布收口部分按维护决定 deferred，本批次不发布版本。
- 当前阶段：阶段 13（R19 Advanced editors and media-heavy components），状态为 `未开始`。
- 当前可执行任务：R19 Advanced editors and media-heavy components。
- 后续阶段：R19 仍需执行；R20 组件清理已提前落地，但 v2.0.0 发布收口不再绑定 R20，需在 R19 完成后单独完成最终发布门禁。v2.0.0 后续仍会追加新的更新计划，路线图不在 R20 处收口。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- 每个组件批次必须同步处理源码、测试、Skill references、examples、迁移说明、变更记录、API baseline 和对应门禁。
- 每个组件批次优先运行对应分组测试；只有发布收口、跨组改动或门禁策略调整才运行全量 `quality:release`。
- 删除 public API 必须给出唯一替代 API；没有保留价值的 API 直接删除并在迁移说明中写明。
- 完成任一 Rxx 后，必须同步更新该任务状态、所属阶段状态、完成日期和关键验证命令；未更新状态视为任务未完成。
- 完成任务的详细执行摘要、实际验证命令和状态回写要求应移至 [V2_COMPLETED.md](V2_COMPLETED.md)；`ROADMAP.md` 只保留完成状态摘要和当前/后续任务执行要求，避免读取时消耗过多 token。
- 完成 R18-R20 中任何涉及 public API、shared contract、props、events、methods、type aliases 或 helper exports 删除/合并的任务后，必须在 [V2_API_AUDIT.md](V2_API_AUDIT.md) 追加或更新对应批次记录，写明实际变更、唯一替代 API、证据、验证命令和剩余阻塞。
- R10-R20 属于 v2.0.0 发布前计划，不插入 R01-R09 中间，也不得改变既有阶段依赖。

## 状态回写要求

完成任一任务后，必须同时更新以下位置：

- `阶段进度`：更新当前已完成阶段、下一阶段、当前可执行任务和后续阶段说明。
- `阶段与依赖`：更新所属阶段的 `阶段状态`；若阶段内任务部分完成则标为 `进行中`，全部完成则标为 `已完成（日期）`。
- 对应 `Rxx` 任务条目：更新 `状态`、完成日期、关键执行摘要；必要时补充实际验证命令和剩余发布后验证。
- `V2_API_AUDIT.md`：涉及 public API 或 shared contract 清理时追加对应 Rxx 完成记录；记录实际删除/合并项、替代 API、证据、验证命令和剩余阻塞。
- `路线图维护验证`：如新增或调整文档维护命令，必须同步更新本节。

## 阶段与依赖

| 阶段 | 阶段状态                                        | 任务    | 执行规则                                                                                  |
| ---- | ----------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| 0    | 已完成（2026-06-28）                            | R01     | 只做路线图清理；为后续 v2 任务建立边界                                                    |
| 1    | 已完成（2026-06-28）                            | R02-R03 | 先稳定版本与 release metadata，再切换 ESM-only 发布面                                     |
| 2    | 已完成（2026-06-28）                            | R04-R05 | 先建立显式 exports 与公开组件事实源，再调整 tree-shaking/sideEffects                      |
| 3    | 已完成（2026-06-28）                            | R06-R07 | 删除兼容 API、legacy token 与旧资源；按 API baseline 和目标测试拆批次                     |
| 4    | 已完成（2026-06-28）                            | R08-R09 | 更新按需加载使用面，并增加 size/publish artifact 门禁                                     |
| 5    | 已完成（2026-06-29）                            | R10     | 先建立按组件组可执行的测试、文档和示例维护通道                                            |
| 6    | 已完成（2026-06-29）                            | R11     | 审计 core API 与 shared contracts，形成组件批次删除/合并清单                              |
| 7    | 已完成（2026-06-29）                            | R12     | 清理 Basic + Layout 轻量展示组件                                                          |
| 8    | 已完成（2026-06-29）                            | R13     | 清理 Feedback 与 overlay 组件                                                             |
| 9    | 已完成（2026-06-29）                            | R14-R15 | 分两批清理 Form primitives 与 composite selectors                                         |
| 10   | 已完成（2026-06-29）                            | R16     | 清理 Navigation 组件                                                                      |
| 11   | 已完成（2026-06-29）                            | R17     | 清理 Data 与 table stack                                                                  |
| 12   | 已完成（2026-06-30）                            | R18     | 清理 Charts 与 visualization stack                                                        |
| 13   | 未开始                                          | R19     | 清理 Advanced editors 与 media-heavy components                                           |
| 14   | 组件清理已完成（2026-06-30）；发布收口 deferred | R20     | 清理 Composite/business components；v2.0 release hardening 不再绑定本批次，发布前单独收口 |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## v2.0.0 任务队列

### R01-R18 completed archive

R01-R18 已完成，详细执行摘要、实际验证命令和状态回写记录已归档到 [V2_COMPLETED.md](V2_COMPLETED.md)。当前执行入口只保留完成状态摘要，避免后续 Agent 读取 R19-R20 时消耗过多 token。

| 任务                                                      | 状态                 | 摘要                                                                                             | 详情                                                                                         |
| --------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| R01 Roadmap cleanup                                       | 已完成（2026-06-28） | 清理路线图为 v2.0.0 分批执行入口。                                                               | [归档](V2_COMPLETED.md#r01-roadmap-cleanup)                                                  |
| R02 version and release metadata                          | 已完成（2026-06-28） | 同步 2.0.0 版本、运行时 version、CLI 模板和 release readiness 入口。                             | [归档](V2_COMPLETED.md#r02-version-and-release-metadata)                                     |
| R03 ESM-only build surface                                | 已完成（2026-06-28） | 将 core/react/vue 发布面切为 ESM-only，并更新 publish smoke。                                    | [归档](V2_COMPLETED.md#r03-esm-only-build-surface)                                           |
| R04 explicit exports and public component facts           | 已完成（2026-06-28） | 建立公开组件事实源和 React/Vue 显式 component subpath exports。                                  | [归档](V2_COMPLETED.md#r04-explicit-exports-and-public-component-facts)                      |
| R05 tree-shaking and sideEffects                          | 已完成（2026-06-28） | 收敛 sideEffects，隔离 Message/notification 命令式入口并加 tree-shaking gates。                  | [归档](V2_COMPLETED.md#r05-tree-shaking-and-sideeffects)                                     |
| R06 remove deprecated and compatibility APIs              | 已完成（2026-06-28） | 删除首批 deprecated/compat API，并让 api:validate 阻止新增 public deprecated API。               | [归档](V2_COMPLETED.md#r06-remove-deprecated-and-compatibility-apis)                         |
| R07 token and legacy asset cleanup                        | 已完成（2026-06-28） | 删除 legacy token CSS/TS 兼容命名、旧 icon path aliases 和 common-icons barrel。                 | [归档](V2_COMPLETED.md#r07-token-and-legacy-asset-cleanup)                                   |
| R08 on-demand usage docs and examples                     | 已完成（2026-06-28） | 将 examples、SSR smoke 和 references 迁移到 subpath-first / lazy-first 用法。                    | [归档](V2_COMPLETED.md#r08-on-demand-usage-docs-and-examples)                                |
| R09 size and publish artifact gates                       | 已完成（2026-06-28） | 增加 size/publish artifact gates，验证发布 tarball、exports 和 bundle 隔离。                     | [归档](V2_COMPLETED.md#r09-size-and-publish-artifact-gates)                                  |
| R10 grouped validation, docs, and examples infrastructure | 已完成（2026-06-29） | 建立按组件组运行测试、文档和示例维护的基础设施。                                                 | [归档](V2_COMPLETED.md#r10-grouped-validation-docs-and-examples-infrastructure)              |
| R11 Core API and shared contracts audit                   | 已完成（2026-06-29） | 输出 v2 shared contracts 审计和 R12-R20 API 删除/合并清单。                                      | [归档](V2_COMPLETED.md#r11-core-api-and-shared-contracts-audit)，[API 审计](V2_API_AUDIT.md) |
| R12 Basic + Layout lightweight components                 | 已完成（2026-06-29） | 清理 Basic/Layout 轻量组件，删除尺寸/布局别名，Carousel 切换受控 currentIndex 模型。             | [归档](V2_COMPLETED.md#r12-basic--layout-lightweight-components)                             |
| R13 Feedback and overlay components                       | 已完成（2026-06-29） | 统一 Feedback/overlay 的 open/after-close/portal/focus 合约，删除 visible 残留。                 | [归档](V2_COMPLETED.md#r13-feedback-and-overlay-components)                                  |
| R14 Form primitives                                       | 已完成（2026-06-29） | 统一 Form primitives 受控模型，删除等同 ComponentSize 的尺寸别名。                               | [归档](V2_COMPLETED.md#r14-form-primitives)                                                  |
| R15 Form composite selectors                              | 已完成（2026-06-29） | 收敛 composite selectors 的 search/empty/model 别名，拆分 Upload heavy helper。                  | [归档](V2_COMPLETED.md#r15-form-composite-selectors)                                         |
| R16 Navigation components                                 | 已完成（2026-06-29） | 收敛 Navigation 受控回调命名，删除子组件源码 shim 并保留 subpath 产物。                          | [归档](V2_COMPLETED.md#r16-navigation-components)                                            |
| R17 Data and table stack                                  | 已完成（2026-06-29） | 统一 Table/VirtualTable/DataTableWithToolbar 数据、选择与虚拟滚动入口，删除 Generic 泛型别名。   | [归档](V2_COMPLETED.md#r17-data-and-table-stack)                                             |
| R18 Charts and visualization stack                        | 已完成（2026-06-30） | 拆分 chart 类型文件，删除重复 datum aliases，统一独立 ChartTooltip open 命名并保留 charts 隔离。 | [归档](V2_COMPLETED.md#r18-charts-and-visualization-stack)                                   |

### R19 Advanced editors and media-heavy components

**状态**：未开始。

**目标**：清理 Advanced editors 与 media-heavy components，隔离 heavy runtime，统一 file/image/editor value 与 event 命名，删除旧浏览器兼容分支中的 public API。

**允许修改**：Advanced 相关 core types、React/Vue 组件、editor/media helpers、目标 tests、SSR/browser guard tests、Skill advanced props/examples、example 使用、迁移说明、变更记录、API baseline、必要 bundle smoke。

**不得修改**：Charts/Data/Composite business 组件行为、发布 workflow、无关 package exports。

**依赖/阻塞**：依赖 R11；涉及 image preview/open 命名时必须保持 R06 已统一的 open API。

**组件范围**：CodeEditor、MarkdownEditor、RichTextEditor、FileManager、ImageViewer、ImageAnnotation、ImageCropper、PrintLayout、VirtualList、InfiniteScroll、Signature、NumberKeyboard。

**完成验证**：

- `corepack pnpm test:group:advanced`
- `corepack pnpm vitest run tests/core/browser-only-guards.spec.ts`
- `corepack pnpm example:ssr:check`
- `corepack pnpm publish:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Advanced/media API 摘要、SSR/browser guard 验证范围、Skill/examples 更新范围和关键验证命令；同步更新阶段 13 状态。

### R20 Composite/business components and v2.0 release hardening

**状态**：组件级 API 清理已完成（2026-06-30）；v2.0 发布收口 deferred、本批次不发布版本。

**执行摘要（2026-06-30）**：移除 `KanbanCard` / `KanbanColumn` / `KanbanCardMoveEvent` / `KanbanColumnMoveEvent` 公共别名（统一复用 `TaskBoard*`，保留 `KanbanProps` / `KanbanSwimlane`）；删除 DataTableWithToolbar 顶层 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction`，业务回调收敛到 React `toolbar.*` 配置与 Vue 组件事件；将 `composite.ts` 巨型类型文件按组件拆分为 `chat` / `activity-feed` / `comment-thread` / `notification-center` / `table-toolbar` / `form-wizard` / `task-board` 并改 `composite.ts` 为薄 barrel；新增 `api:validate` R20 guard。详细记录见 [V2_API_AUDIT.md](V2_API_AUDIT.md) 与 [V2_COMPLETED.md](V2_COMPLETED.md)。R20 不再承担 v2.0.0 发布收口：`quality:release` 全量发布门禁、`api:baseline` release 收口与发布后 `smoke:published` 留待 R19 完成后的最终发布批次执行。

**目标**：清理 Composite/business components，移除 legacy prop passthrough，统一业务对象字段和基础组件新 API 使用。注意：v2.0.0 发布收口已从 R20 解绑，留待 R19 完成后单独执行。

**允许修改**：Composite 相关 core types、React/Vue 组件、目标 tests、Skill composite props/examples、example 使用、迁移说明、变更记录、API baseline、size budget、release/publish 文档和必要发布门禁。

**不得修改**：R10-R19 已完成 API 的兼容回退、已完成分组测试入口的语义、未说明的新增功能。

**依赖/阻塞**：依赖 R12-R19 全部完成；发布后 `smoke:published` 只能在 v2.0.0 发布到 npm 后执行。

**组件范围**：ActivityFeed、ChatWindow、CommentThread、FormWizard、NotificationCenter、TaskBoard、Kanban、DataTableWithToolbar，以及最终发布收口。

**完成验证**：

- `corepack pnpm test:group:composite`
- `corepack pnpm example:build`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm quality:release`
- `corepack pnpm smoke:published`（发布后执行）
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的 Composite/business API 摘要、最终 MIGRATION/CHANGELOG/Skill/examples/API baseline/size budget 更新范围和关键验证命令；若发布后 smoke 尚未执行，明确标为发布后待跑；同步更新阶段 14 状态，并将 v2.0.0 路线图标为完成或发布后待验证。

## Public API 与文档规则

- 每个 R18-R20 批次必须列出计划移除的 props/events/methods/type aliases 和唯一替代 API。
- React 与 Vue 同一组件必须收敛到同一语义；命名差异只允许来自框架惯例。
- Skill 文档更新必须覆盖对应 `shared/props/{category}.md`、`examples/{category}.md` 和必要的 `component-index.md`。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 测试优化不是简单删除测试；应合并重复断言、参数化相似场景、保留边界、a11y、SSR 和交互关键覆盖。

## 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --check docs/ROADMAP.md`；R11 审计或完成任务归档改动运行 `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`；涉及 R11 审计或完成任务归档时同时覆盖 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`；涉及 R11 审计或完成任务归档时同时检查 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`，确认没有冲突标记。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
