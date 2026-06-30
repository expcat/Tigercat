# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 follow-up planning after R25 navigation and feedback demo merge
verified-date: 2026-07-01
source: current repository state after R25 Navigation/Feedback example demo consolidation
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节、R01-R25 已完成批次细节与发布收口记录不再保留在路线图中；详细执行摘要、实际验证命令和状态回写记录统一归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，public API 删除/合并证据归档到 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## 当前状态

截至 2026-07-01，T01-T14 与 v2.0.0 R01-R25 已完成；R20 不作为 v2.0 发布收口批次，后续发布收口按维护决定单独追加。R25 已完成 Navigation/Feedback 示例展示合并，保留弹层、通知、异步确认和焦点流程的独立 DemoBlock；后续继续推进 Charts/Advanced 展示合并。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0-19 已完成 R01-R25；细节见 [V2_COMPLETED.md](V2_COMPLETED.md)。
- 当前阶段：阶段 20。
- 当前可执行任务：R26。
- 后续阶段：v2.0.0 仍会追加新的维护与功能计划，路线图不在 R23 处收口。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- Skill 文档与 examples 的压缩属于一等维护目标；减少 LLM 默认读取 token，但必须保留可通过链接定位到准确细节的路径。
- 每个组件或文档批次优先运行对应分组测试、changed-file Prettier、相关 docs/examples 检查；只有发布收口、跨组改动或门禁策略调整才运行全量 `quality:release`。
- 删除 public API 必须给出唯一替代 API；没有保留价值的 API 直接删除并在迁移说明中写明。
- 完成任一 Rxx 后，必须同步更新该任务状态、所属阶段状态、完成日期和关键验证命令；未更新状态视为任务未完成。
- 完成任务的详细执行摘要、实际验证命令和状态回写要求应移至 [V2_COMPLETED.md](V2_COMPLETED.md)；`ROADMAP.md` 只保留完成状态摘要和当前/后续任务执行要求，避免读取时消耗过多 token。
- 涉及 public API、shared contract、props、events、methods、type aliases 或 helper exports 删除/合并的任务，必须在 [V2_API_AUDIT.md](V2_API_AUDIT.md) 追加或更新对应批次记录。

## 状态回写要求

完成任一任务后，必须同时更新以下位置：

- `阶段进度`：更新当前已完成阶段、下一阶段、当前可执行任务和后续阶段说明。
- `阶段与依赖`：更新所属阶段的 `阶段状态`；若阶段内任务部分完成则标为 `进行中`，全部完成则标为 `已完成（日期）`。
- 对应 `Rxx` 任务条目：更新 `状态`、完成日期和关键执行摘要；详细执行记录移入 [V2_COMPLETED.md](V2_COMPLETED.md)。
- `V2_COMPLETED.md`：归档本任务的实际修改范围、验证命令、剩余阻塞和状态回写结果。
- `V2_API_AUDIT.md`：仅在涉及 public API 或 shared contract 清理时更新。
- `路线图维护验证`：如新增或调整文档维护命令，必须同步更新本节。

## 阶段与依赖

| 阶段 | 阶段状态             | 任务    | 执行规则                                                                |
| ---- | -------------------- | ------- | ----------------------------------------------------------------------- |
| 0-14 | 已完成（2026-06-30） | R01-R20 | 已完成组件级 API 清理，细节归档到 `V2_COMPLETED.md` / `V2_API_AUDIT.md` |
| 15   | 已完成（2026-06-30） | R21     | 已审计并收紧分组验证入口，确保后续维护不会误跑全量或漏跑目标组          |
| 16   | 已完成（2026-06-30） | R22     | 已压缩 Skill 读取路径，删除普通路由中的维护者 backlog                   |
| 17   | 已完成（2026-06-30） | R23     | 已让 Basic/Layout 示例展示代码跟随同页源码，避免手写 code/script 漂移   |
| 18   | 已完成（2026-06-30） | R24     | 已为全量 Example 建立 raw-source 护栏并合并 Button/Input 高重复展示     |
| 19   | 已完成（2026-07-01） | R25     | 已合并 Navigation/Feedback 展示，弹层与通知类保留互不干扰的独立流程     |
| 20   | 未开始               | R26     | Charts/Advanced 展示合并，复杂编辑器与虚拟化页面优先使用 fixture source |
| 21   | 未开始               | R27     | Composite/Hooks 展示合并与剩余 cleanup                                  |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## 已完成归档

R01-R25 已完成，主路线图不再展开逐项一行摘要；需要追溯执行细节、实际验证命令或完成状态，请读取 [V2_COMPLETED.md](V2_COMPLETED.md)；需要追溯 public API 删除/合并证据，请读取 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## v2.0 后续任务队列

### R21 Grouped validation audit and script tightening

**状态**：已完成（2026-06-30）。

**完成摘要**：已审计全部 10 个测试 group，确认 `--list`、`--framework`、`--filter` 和 `TEST_GROUP` 缩窄语义可用；新增 `tests/core/component-test-groups.spec.ts` 固定 group 列表、路径排序/去重、framework narrowing、filter alias、未知参数和空结果失败行为；`scripts/README.md` 与 `tests/TEST_QUALITY_GUIDELINES.md` 已记录后续 Rxx 验证模板。详细执行记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r21-grouped-validation-audit-and-script-tightening)。

### R22 Skill reference compression and routing

**状态**：已完成（2026-06-30）。

**完成摘要**：已将 Skill 普通入口压缩为按任务路由；`skills/tigercat/ROADMAP.md` 从详细维护者 backlog 缩为维护者说明，`building-apps.md` 不再把普通建应用路径链回 Skill Roadmap；`shared/patterns/common.md` 压缩为跨框架决策速查；`api-summary.md` 由生成器移除与 component-index 重复的 Components/Exports 列；`context7.json` 修正为实际存在的 framework index 与 examples 路径。`api:validate` 已增加 Skill 入口大小、维护者 Roadmap 行数、手写 reference 行数、api-summary 体积、普通 reference 禁止 Roadmap 链接和 context7 路径存在性护栏。详细执行记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r22-skill-reference-compression-and-routing)。

**完成验证**：`npx -y pnpm@11.9.0 docs:api`、`npx -y pnpm@11.9.0 api:validate`、`npx -y pnpm@11.9.0 docs:api:check`、changed-file Prettier、冲突标记扫描和 `git diff --check`。

**状态更新要求**：已写回状态、日期、压缩规模、删除/迁出的 Skill 内容、保留的按需链接结构和关键验证命令；阶段 16 已同步为 `已完成（2026-06-30）`，当前可执行任务推进到 R23。R22 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。

### R23 Example demo consolidation and reproducible code snippets

**状态**：已完成（2026-06-30）。

**完成摘要**：已完成 Basic/Layout 子批次，覆盖 React/Vue 共 56 个页面；所有目标页面的 `DemoBlock` 代码标签改为读取同页 `?raw` 源码，局部 `script` 标签已移除，确保展示代码随实际页面同步并可复制复现当前 demo 页面。`examples/README.md` 已补充后续维护规则。详细执行记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r23-example-demo-consolidation-and-reproducible-code-snippets)。

**完成验证**：`npx -y pnpm@11.9.0 example:build` 已通过；完整门禁记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r23-example-demo-consolidation-and-reproducible-code-snippets)。

**状态更新要求**：已写回状态、日期、已整合的组件组、代码展示来源策略、可复制复现验证方式、未纳入的后续实时运行编辑器计划和关键验证命令；阶段 17 已同步为 `已完成（2026-06-30）`。R23 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。

### R24 Example source guard and first merged demo pass

**状态**：已完成（2026-06-30）。

**完成摘要**：已删除 React/Vue `DemoBlock` 的 `script` prop 与脚本 Tab；所有带 `DemoBlock` 的 React/Vue 页面均接入同页 `?raw` code source，并新增 `example:sources:check` 校验，防止手写 code/script 漂移回流。Button 与 Input 的 React/Vue 页面已先行合并可共存展示：Button 从 8 个展示块压缩为 3 个，Input 从 11 个展示块压缩为 3 个。详细执行记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r24-example-source-guard-and-first-merged-demo-pass)。

**完成验证**：`npx -y pnpm@11.9.0 example:sources:check`、React/Vue example 单独 build 已通过；完整门禁记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r24-example-source-guard-and-first-merged-demo-pass)。

### R25 Navigation and feedback demo merging

**状态**：已完成（2026-07-01）。

**完成摘要**：已合并 React/Vue Navigation 与 Feedback 示例页面中可共存的尺寸、状态、文案、触发方式和静态配置展示；`Message`、`Notification` 等通知流程保持独立，`Drawer`、`Modal`、`Popconfirm`、`Popover`、`Tooltip` 等弹层/受控/异步场景只合并互不污染的展示块。详细执行记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r25-navigation-and-feedback-demo-merging)。

**完成验证**：`npx -y pnpm@11.9.0 test:group:navigation`、`npx -y pnpm@11.9.0 test:group:feedback`、`npx -y pnpm@11.9.0 example:sources:check`、`npx -y pnpm@11.9.0 example:build` 已通过；完整门禁记录见 [V2_COMPLETED.md](V2_COMPLETED.md#r25-navigation-and-feedback-demo-merging)。

### R26 Charts and advanced demo merging

**状态**：未开始。

**目标**：合并 Charts 静态配置展示；Advanced 中编辑器、虚拟列表、文件管理等复杂页面优先抽取 page-local fixture source，避免代码 Tab 过长或不可复制。

**完成验证**：`npx -y pnpm@11.9.0 test:group:charts`、`npx -y pnpm@11.9.0 test:group:advanced`、`npx -y pnpm@11.9.0 example:sources:check`、`npx -y pnpm@11.9.0 example:build`、changed-file Prettier、`git diff --check`。

### R27 Composite and hooks demo cleanup

**状态**：未开始。

**目标**：合并 Composite 与 Hooks 页面；清理剩余只服务旧代码展示的 snippet 常量，并复核所有 Example 页面展示块数量与 raw/fixture source 策略。

**完成验证**：`npx -y pnpm@11.9.0 test:group:composite`、focused hooks/core tests、`npx -y pnpm@11.9.0 example:sources:check`、`npx -y pnpm@11.9.0 example:build`、changed-file Prettier、`git diff --check`。

## Public API 与文档规则

- React 与 Vue 同一组件必须收敛到同一语义；命名差异只允许来自框架惯例。
- Skill 文档更新必须覆盖对应 `shared/props/{category}.md`、`examples/{category}.md` 和必要的 `component-index.md`。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 测试优化不是简单删除测试；应合并重复断言、参数化相似场景、保留边界、a11y、SSR 和交互关键覆盖。

## 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --check docs/ROADMAP.md`；涉及完成任务归档时运行 `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md`。
- Example 展示或代码来源变更后运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时同时运行 `npx -y pnpm@11.9.0 example:build`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`；涉及完成任务归档时同时覆盖 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`；涉及完成任务归档时同时检查 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`，确认没有冲突标记。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
