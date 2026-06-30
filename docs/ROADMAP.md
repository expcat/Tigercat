# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 follow-up planning after grouped validation and Skill reference compression
verified-date: 2026-06-30
source: current repository state after R22 Skill reference compression and routing
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节、R01-R22 已完成批次细节与发布收口记录不再保留在路线图中；详细执行摘要、实际验证命令和状态回写记录统一归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，public API 删除/合并证据归档到 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## 当前状态

截至 2026-06-30，T01-T14 与 v2.0.0 R01-R22 已完成；R20 的 v2.0 发布收口按维护决定 deferred，本批次不发布版本。当前路线图进入 R23 example demo consolidation，后续仍会追加功能计划。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0-16 已完成 R01-R22；细节见 [V2_COMPLETED.md](V2_COMPLETED.md)。
- 当前阶段：阶段 17（R23 example demo consolidation），整合示例演示并让展示代码可复制复现。
- 当前可执行任务：R23 example demo consolidation and reproducible code snippets。
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
| 17   | 未开始               | R23     | 整合示例演示并让展示代码成为可复制复现的完整代码                        |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## 已完成归档

R01-R22 已完成，主路线图不再展开逐项一行摘要；需要追溯执行细节、实际验证命令或完成状态，请读取 [V2_COMPLETED.md](V2_COMPLETED.md)；需要追溯 public API 删除/合并证据，请读取 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

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

**状态**：未开始。

**目标**：整合 React/Vue example demos：展示一个组件功能时，将不冲突的多个演示效果合并到一个示例页面中；同时让页面展示的 Script 脚本和 Code 展示内容与当前演示完全匹配，复制到文件即可完整复现效果。后续会继续规划实时运行/编辑演示代码组件，本任务只为该能力准备一致、完整、可抽取的示例源码。

**允许修改**：`examples/example/react/src/pages/**`、`examples/example/vue3/src/pages/**`、示例共享组件（如 `DemoBlock`）、示例路由/元数据、Skill examples references 的生成器、示例 README、必要 example smoke 或 snapshot。

**不得修改**：组件 public API、组件运行时行为、发布产物策略、R21 分组 runner 语义；不得把未来“实时运行代码编辑器”实现混入本任务。

**依赖/阻塞**：建议在 R21 完成后执行；如示例代码展示依赖 generated Skill examples，应与 `scripts/generate-api-docs.mjs` 同步。

**组件范围规划**：按组件组分批执行，优先选择 demos 数量多且互不冲突的组：Basic/Layout、Form、Feedback/Overlay、Navigation、Data/Table、Charts、Advanced/Media、Composite/Business。每个子批次只整合目标组，不顺手改全库。

**计划检查项**：

- 建立 demo 盘点表：每个组件当前 React/Vue 页面是否存在重复 demo、是否展示完整 code、是否能单文件复制复现。
- 为 `DemoBlock` 或等价机制定义代码来源策略：展示代码必须来自同一页面的完整片段或可验证 fixture，避免手写展示代码与实际演示漂移。
- 合并同组件不冲突的状态、尺寸、禁用、受控、空态、异步、a11y 示例；保留必须分开的 SSR/heavy runtime/交互边界示例。
- 示例 import 优先使用组件子路径，避免 root value imports 或 heavy dependency leakage 回流。
- 每完成一个组件组，运行对应 `test:group:{group}`、example build、docs/api 漂移检查和 changed-file Prettier。

**完成验证**：

- `corepack pnpm test:group:<group>`
- `corepack pnpm example:build`
- `corepack pnpm example:ssr:check`（涉及 SSR 或 browser guard 示例时）
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm api:validate`
- `corepack pnpm prettier --check <changed example files> docs/ROADMAP.md docs/V2_COMPLETED.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、已整合的组件组、代码展示来源策略、可复制复现验证方式、未纳入的后续实时运行编辑器计划和关键验证命令；同步更新阶段 17 状态。

## Public API 与文档规则

- React 与 Vue 同一组件必须收敛到同一语义；命名差异只允许来自框架惯例。
- Skill 文档更新必须覆盖对应 `shared/props/{category}.md`、`examples/{category}.md` 和必要的 `component-index.md`。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 测试优化不是简单删除测试；应合并重复断言、参数化相似场景、保留边界、a11y、SSR 和交互关键覆盖。

## 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --check docs/ROADMAP.md`；涉及完成任务归档时运行 `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`；涉及完成任务归档时同时覆盖 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`；涉及完成任务归档时同时检查 `docs/V2_API_AUDIT.md`、`docs/V2_COMPLETED.md`，确认没有冲突标记。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
