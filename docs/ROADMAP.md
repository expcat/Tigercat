# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 follow-up planning for R28 example user-story component review
verified-date: 2026-07-01
source: current repository state after R27 Composite/Hooks example demo cleanup
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节、R01-R27 已完成批次细节与发布收口记录不再保留在路线图中；详细执行摘要、实际验证命令和状态回写记录统一归档到 [V2_COMPLETED.md](V2_COMPLETED.md)，public API 删除/合并证据归档到 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## 当前状态

截至 2026-07-01，T01-T14 与 v2.0.0 R01-R27 已完成；R20 不作为 v2.0 发布收口批次，后续发布收口按维护决定单独追加。

当前可执行计划为 R28：后续 Agent 必须用模拟浏览器打开 React/Vue Example，以体验者身份按组件族操作示例页面，审查示例体验、组件能力缺口、文档/示例缺口和可优化建议。E01-E09 已完成，下一可执行分组为 E10；具体用户故事和优化建议由后续 Agent 按 [EXAMPLE_AGENT_PLAN.md](EXAMPLE_AGENT_PLAN.md) 分组执行后写入。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0-21 已完成 R01-R27；细节见 [V2_COMPLETED.md](V2_COMPLETED.md)。
- 当前阶段：阶段 22，R28 Example user-story component review 进行中。
- 当前可执行任务：R28 / E10，按 [EXAMPLE_AGENT_PLAN.md](EXAMPLE_AGENT_PLAN.md) 继续执行 Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper 用户视角 Example 审查。
- 后续阶段：v2.0.0 仍会追加新的维护与功能计划，路线图不在 R28 处收口。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- Skill 文档与 examples 的压缩属于一等维护目标；减少 LLM 默认读取 token，但必须保留可通过链接定位到准确细节的路径。
- 每个组件或文档批次优先运行对应分组测试、changed-file Prettier、相关 docs/examples 检查；只有发布收口、跨组改动或门禁策略调整才运行全量 `quality:release`。
- 发布验证必须在本地手动完成，发布 Action 只负责发布动作；不要再向 `.github/workflows/publish*.yml` 添加 `quality:release`、测试、coverage、SSR 或 publish smoke 等发布前验证门禁，以减少 GitHub Actions 消耗。
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

| 阶段  | 阶段状态             | 任务    | 执行规则                                                                                        |
| ----- | -------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| 0-14  | 已完成（2026-06-30） | R01-R20 | 已完成组件级 API 清理，细节归档到 `V2_COMPLETED.md` / `V2_API_AUDIT.md`                         |
| 15-21 | 已完成（2026-07-01） | R21-R27 | 已完成分组验证、Skill 路由压缩、Example raw-source 护栏与展示合并维护                           |
| 22    | 进行中               | R28     | E01-E09 已完成；继续按 [EXAMPLE_AGENT_PLAN.md](EXAMPLE_AGENT_PLAN.md) 执行 E10-E21 用户视角审查 |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## 已完成归档

R01-R27 已完成，主路线图不再展开逐项摘要；需要追溯执行细节、实际验证命令或完成状态，请读取 [V2_COMPLETED.md](V2_COMPLETED.md)；需要追溯 public API 删除/合并证据，请读取 [V2_API_AUDIT.md](V2_API_AUDIT.md)。

## v2.0 后续任务队列

### R28 Example user-story component review

**状态**：进行中。

**目标**：从用户使用 React/Vue Example 的角度，用模拟浏览器逐页体验每组组件的真实展示和交互，记录使用不便、缺少能力、文档/示例缺口和可优化建议，并输出可由后续维护任务接手的用户故事与优先级。

**分组计划**：[EXAMPLE_AGENT_PLAN.md](EXAMPLE_AGENT_PLAN.md) 的 E01-E21 是 R28 的唯一执行队列。后续 Agent 必须按分组启动或复用 React/Vue Example dev server，并通过浏览器访问对应 hash route、点击/输入/滚动/切换视口来形成体验证据；不得用 `test:group:*` 或单元测试命令替代用户体验审查。

**分组进度**：E01-E09 已完成（2026-07-01）；下一可执行分组为 E10 Form / FormItem / Input / Textarea / InputGroup / InputNumber / Stepper。

**允许修改**：后续执行 R28 分组时，可更新 `docs/EXAMPLE_AGENT_PLAN.md` 中对应分组的用户故事、体验问题、组件能力建议、优先级和后续执行建议；如该分组明确进入修复阶段，必须另开后续 Rxx 或在本任务中扩展允许修改范围后再改源码、Example 或 generated docs source。

**不得修改**：本阶段只做用户视角审查与建议整理，不直接修改组件源码、示例实现、生成引用、API baseline、发布配置或迁移文档。

**依赖/阻塞**：每个分组以 `skills/tigercat/references/component-index.md`、对应 `skills/tigercat/references/examples/{category}.md`、React/Vue Example 页面和浏览器体验记录为事实源；如果某组组件无法定位可体验的 Example route，必须在该组记录阻塞或“缺少可体验示例”，不得用测试结果猜测用户体验。

**完成验证**：文档更新至少运行 changed-file Prettier、`git diff --check` 和冲突标记扫描；R28 分组审查的完成证据必须包含实际访问的 React/Vue route、浏览器操作路径和观察结论。如果后续分组升级为源码或 Example 修复，测试命令只作为修复验证补充，不作为本轮体验审查替代品。

## Public API 与文档规则

- React 与 Vue 同一组件必须收敛到同一语义；命名差异只允许来自框架惯例。
- Skill 文档更新必须覆盖对应 `shared/props/{category}.md`、`examples/{category}.md` 和必要的 `component-index.md`。
- Example 更新必须优先使用组件子路径 import，避免重新引入 root value imports 或 heavy dependency leakage。
- 测试优化不是简单删除测试；应合并重复断言、参数化相似场景、保留边界、a11y、SSR 和交互关键覆盖。

## 路线图维护验证

- 文档整理后运行 `npx -y pnpm@11.9.0 exec prettier --check docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/EXAMPLE_AGENT_PLAN.md`，确认没有冲突标记。
- Example 展示或代码来源变更后运行 `npx -y pnpm@11.9.0 example:sources:check`；涉及页面结构调整时同时运行 `npx -y pnpm@11.9.0 example:build`。
- 如 `corepack pnpm docs:api:check` 命中 ambient pnpm engine mismatch，可改用 `npx -y pnpm@11.9.0 docs:api:check` 复跑同一门禁。
