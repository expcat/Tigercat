# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: v2.0.0 breaking upgrade and package-size reduction execution plan
verified-date: 2026-06-28
source: current repository state after v1.5.0 roadmap closure
-->

本文只记录下一阶段要实施的任务。v1.5.0 以前的扫描取证、T01-T14 执行细节与发布收口记录不再保留在路线图中；需要历史证据时从 git 历史、变更日志或对应提交中查找。

## 当前状态

截至 2026-06-28，上一轮 T01-T14 已完成，路线图进入 v2.0.0 破坏性升级规划阶段。本阶段目标是先完成包体积、按需加载、发布产物和兼容层清理的基础改造，再继续追加 v2 新功能。

当前文件是后续 Agent 的执行入口。执行任一 Rxx 任务前必须先读取对应任务的允许修改、不得修改、依赖和完成验证；任务完成后必须回写状态、日期和关键验证命令。

## 阶段进度

- 已完成阶段：阶段 0（R01 Roadmap cleanup）、阶段 1（R02 version and release metadata、R03 ESM-only build surface）与阶段 2（R04 explicit exports and public component facts、R05 tree-shaking and sideEffects），已完成于 2026-06-28。
- 当前阶段：阶段 3（R06 remove deprecated and compatibility APIs、R07 token and legacy asset cleanup），状态为 `未开始`。
- 当前可执行任务：R06。R05 已完成 React/Vue sideEffects 收敛和 Message/notification 命令式入口拆分，R06 可继续删除兼容 API。
- 阶段 4 暂未开始；必须等各自前置阶段满足依赖后再认领。

## 执行原则

- 每个任务独立执行并单独更新状态；不要把未声明的源码修复或新功能混入相邻任务。
- v2.0.0 是破坏性版本，不新增 `@deprecated` 过渡层，不保留向后兼容分支。
- 生成产物只能通过修改事实源或生成器后重生成；不得手改 `skills/tigercat/references/*`、`api-reports/*` 或发布快照来掩盖漂移。
- 涉及公共 API、package exports、版本、发布产物或 size budget 的任务必须同步更新迁移说明、变更记录、API baseline 和对应门禁。
- 完成任一 Rxx 后，必须同步更新该任务状态、所属阶段状态、完成日期和关键验证命令；未更新状态视为任务未完成。
- 后续 v2 新功能从 R10 起追加，不插入 R01-R09 中间，避免破坏已分配批次和依赖顺序。

## 状态回写要求

完成任一任务后，必须同时更新以下位置：

- `阶段进度`：更新当前已完成阶段、下一阶段、当前可执行任务和后续阶段说明。
- `阶段与依赖`：更新所属阶段的 `阶段状态`；若阶段内任务部分完成则标为 `进行中`，全部完成则标为 `已完成（日期）`。
- 对应 `Rxx` 任务条目：更新 `状态`、完成日期、关键执行摘要；必要时补充实际验证命令和剩余发布后验证。
- `路线图维护验证`：如新增或调整文档维护命令，必须同步更新本节。

## 阶段与依赖

| 阶段 | 阶段状态             | 任务    | 执行规则                                                              |
| ---- | -------------------- | ------- | --------------------------------------------------------------------- |
| 0    | 已完成（2026-06-28） | R01     | 只做路线图清理；为后续 v2 任务建立边界                                |
| 1    | 已完成（2026-06-28） | R02-R03 | 先稳定版本与 release metadata，再切换 ESM-only 发布面                 |
| 2    | 已完成（2026-06-28） | R04-R05 | 先建立显式 exports 与公开组件事实源，再调整 tree-shaking/sideEffects  |
| 3    | 未开始               | R06-R07 | 删除兼容 API、legacy token 与旧资源；按 API baseline 和目标测试拆批次 |
| 4    | 未开始               | R08-R09 | 更新按需加载使用面，并增加 size/publish artifact 门禁                 |

阶段状态规则：

- 阶段内所有任务均为 `未开始` 时，阶段状态为 `未开始`。
- 阶段内任一任务为 `进行中`，或已有部分任务完成但阶段未全完成时，阶段状态为 `进行中`。
- 阶段内所有任务均为 `已完成（日期）`，且验证命令已记录时，阶段状态为 `已完成（日期）`。
- 任务遇到无法继续的外部阻塞时，任务与阶段状态都必须标为 `阻塞`，并在对应任务的 `依赖/阻塞` 中写明阻塞原因。

## v2.0.0 任务队列

### R01 Roadmap cleanup

**状态**：已完成（2026-06-28）。

**目标**：将 `docs/ROADMAP.md` 清理为 v2.0.0 分批执行入口，移除 T01-T14 已完成执行记录和扫描遗留细节。

**允许修改**：`docs/ROADMAP.md`。

**不得修改**：源码、包配置、测试、生成物、changeset、`CHANGELOG.md`、`docs/MIGRATION.md`、`skills/tigercat/references/*`。

**依赖/阻塞**：无。

**完成验证**：

- `corepack pnpm prettier --check docs/ROADMAP.md`
- `git diff --check -- docs/ROADMAP.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`

**状态更新要求**：保持本任务为已完成，并记录执行日期与通过的文档验证命令；所属阶段 0 必须保持 `已完成（2026-06-28）`。

### R02 version and release metadata

**状态**：已完成（2026-06-28）。

**目标**：将 root 与 `@expcat/tigercat-core`、`@expcat/tigercat-react`、`@expcat/tigercat-vue`、`@expcat/tigercat-cli` 规划为 `2.0.0`，同步运行时 `version`、release-readiness 断言和发布文档入口。

**允许修改**：root/package manifests、四个包的 manifests、运行时 version 常量、release readiness 脚本、release 文档入口、必要 changeset 与版本同步测试。

**不得修改**：组件运行时行为、package exports 结构、CJS/ESM 构建策略、compat API 删除、generated references。

**依赖/阻塞**：依赖 R01；R03 必须等本任务的版本目标稳定后执行。

**完成验证**：

- `corepack pnpm release:check`
- `corepack pnpm types:check`
- `corepack pnpm api:validate`
- `git diff --check`

**执行摘要**：已将 root package、core/react/vue/cli package、core/react/vue 运行时 `version`、CLI `CLI_VERSION`、CLI 模板 Tigercat 依赖范围和示例首页展示版本同步到 `2.0.0`；`scripts/sync-version.mjs` 已移除旧 Roadmap 发布表格替换逻辑；`CHANGELOG.md`、`docs/MIGRATION.md` 与 release reference 已新增 v2.0.0 发布入口。

**实际验证**：

- `corepack pnpm release:check`
- `corepack pnpm types:check`
- `corepack pnpm api:validate`
- `corepack pnpm prettier --check docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md skills/tigercat/references/release.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md skills/tigercat/references/release.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、版本同步范围和关键验证命令；同步更新阶段 1 状态。

### R03 ESM-only build surface

**状态**：已完成（2026-06-28）。

**目标**：移除 CJS 产物和 `require` exports，统一为 ESM-only 发布面，减少构建与发布产物复杂度。

**允许修改**：`tsup` 配置、package `exports` 条件、`main`/`module`/`types` 指向、构建脚本、publish smoke 中与模块格式相关的断言。

**不得修改**：组件功能实现、公开组件清单、sideEffects 策略、compat API 删除、示例使用方式。

**依赖/阻塞**：依赖 R02；若发现 `publish:check` 或 smoke 仍依赖 CJS，应在本任务中改为 ESM import 验证。

**完成验证**：

- `corepack pnpm build`
- `corepack pnpm publish:check`
- `corepack pnpm release:check`
- `corepack pnpm types:check`

**执行摘要**：已将 core/react/vue `tsup` 输出切换为 ESM-only，保留 CLI 既有 ESM-only 构建；已移除 core package exports 的 `require` 条件和 `.cjs` 目标，React/Vue root 与通配 exports、sideEffects 策略和组件清单保持不变；`release:check` 和 `publish:check` 已增加 ESM-only 断言，发布 smoke 改为从临时安装目录发起 bare ESM import，并检查 tarball 与安装产物不包含 `.cjs` 文件。

**实际验证**：

- `corepack pnpm build`
- `corepack pnpm publish:check`
- `corepack pnpm release:check`
- `corepack pnpm types:check`
- `corepack pnpm vitest run tests/core/cli.spec.ts`
- `corepack pnpm prettier --check docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md skills/tigercat/references/release.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md skills/tigercat/references/release.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、被删除的 CJS 表面和关键验证命令；同步更新阶段 1 状态。

### R04 explicit exports and public component facts

**状态**：已完成（2026-06-28）。

**目标**：将 React/Vue 的 `./*` 通配 exports 改为由公开组件事实源生成的显式子路径 exports，并补齐 core 必要子路径导出。

**允许修改**：公开组件事实源、exports 生成或校验脚本、React/Vue/core package exports、API baseline、与 exports 相关的 docs/api 生成链路。

**不得修改**：组件运行时行为、sideEffects 策略、compat API 删除、示例导入迁移、size budget。

**依赖/阻塞**：依赖 R03；R05、R08、R09 均依赖本任务提供稳定入口清单。

**完成验证**：

- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm release:check`

**执行摘要**：已将 `scripts/lib/public-components.mjs` 扩展为公开组件事实源，生成 React/Vue 148 个 PascalCase 显式 component 子路径并移除 `./*` 通配 exports；新增 `scripts/sync-package-exports.mjs`、`exports:sync` 与 `exports:check`，release readiness 会校验 React/Vue 显式子路径、core 必要子路径和事实源漂移；API docs 与 public API baseline 已记录 component package subpath facts。

**实际验证**：

- `node ./scripts/sync-package-exports.mjs`
- `node ./scripts/generate-api-docs.mjs`
- `node ./scripts/generate-api-baseline.mjs`
- `npx -y pnpm@11.9.0 vitest run tests/core/package-exports.spec.ts`
- `node ./scripts/sync-package-exports.mjs --check`
- `node ./scripts/validate-api.mjs`
- `node ./scripts/check-public-types.mjs`
- `node ./scripts/check-release-readiness.mjs`
- `npx -y pnpm@11.9.0 build`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md package.json packages/react/package.json packages/vue/package.json scripts/check-release-readiness.mjs scripts/generate-api-baseline.mjs scripts/generate-api-docs.mjs scripts/lib/public-components.mjs scripts/sync-package-exports.mjs scripts/validate-api.mjs tests/core/package-exports.spec.ts api-reports/public-api-baseline.json skills/tigercat/references/component-index.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、显式 exports 事实源位置和关键验证命令；同步更新阶段 2 状态。

### R05 tree-shaking and sideEffects

**状态**：已完成（2026-06-28）。

**目标**：让普通组件和 shared chunks 可被 tree-shaking，拆分或最小化 `Message`/`notification` 命令式 API 的副作用声明。

**允许修改**：React/Vue sideEffects 配置、命令式 API 入口、相关组件导出、tree-shaking 回归测试、imperative API 回归测试。

**不得修改**：公开组件清单、版本号、compat API 删除、token 产物、示例大规模导入迁移。

**依赖/阻塞**：依赖 R04；不得再用全量 `dist/components/*` 或全量 `chunk-*` sideEffects 兜底。

**完成验证**：

- `corepack pnpm vitest run tests/core/imperative-side-effects.spec.ts`
- `corepack pnpm build`
- `corepack pnpm size`
- `corepack pnpm publish:check`
- `corepack pnpm api:validate`

**执行摘要**：React/Vue package `sideEffects` 已收敛为 `false`，不再用 `dist/chunk-*` 或 `dist/components/*` 全量副作用兜底；React/Vue `MessageContainer` 与 `NotificationContainer` 已拆为独立纯容器入口，命令式 `Message` / `notification` 单例挂载逻辑保留在对应 imperative 入口；root `Message` / `notification` facade 保持同步返回 close handle，并通过动态导入延迟加载命令式挂载模块；`release:check` 会阻止宽泛 sideEffects 回退，`publish:check` 会对安装后的 React/Vue root Button named import 和 Button 子路径 import 做 bundler smoke，确认普通 Button bundle 不包含 Message/notification 命令式挂载标记。Next.js SSR 示例构建脚本改为 `next build --webpack`，避开本机 Next 16/Turbopack 原生绑定不可用时的发布检查失败。

**实际验证**：

- `node ./scripts/sync-package-exports.mjs`
- `node ./scripts/generate-api-docs.mjs`
- `node ./scripts/generate-api-baseline.mjs`
- `npx -y pnpm@11.9.0 vitest run tests/core/imperative-side-effects.spec.ts`
- `npx -y pnpm@11.9.0 build`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 publish:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 release:check`
- `npx -y pnpm@11.9.0 exports:check`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 docs:api:check`（未提交工作树下按预期报告 `skills/tigercat/references` 生成物 diff；已用 `npx -y pnpm@11.9.0 docs:api` 写回）
- `npx -y pnpm@11.9.0 api:baseline:check`（未提交工作树下按预期报告 `api-reports/public-api-baseline.json` 生成物 diff；已用 `npx -y pnpm@11.9.0 api:baseline` 写回）
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md package.json packages/react/package.json packages/vue/package.json packages/react/src/components/Message.tsx packages/react/src/components/MessageContainer.tsx packages/react/src/components/Notification.tsx packages/react/src/components/NotificationContainer.tsx packages/vue/src/components/Message.ts packages/vue/src/components/MessageContainer.ts packages/vue/src/components/Notification.ts packages/vue/src/components/NotificationContainer.ts scripts/check-release-readiness.mjs scripts/lib/public-components.mjs scripts/publish-check.mjs tests/core/imperative-side-effects.spec.ts api-reports/public-api-baseline.json skills/tigercat/references/component-index.md skills/tigercat/references/shared/props/feedback.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、副作用 allowlist 策略和关键验证命令；同步更新阶段 2 状态。

### R06 remove deprecated and compatibility APIs

**状态**：未开始。

**目标**：删除当前公开 `@deprecated`、兼容别名、旧事件/prop 和兼容 barrel，并让校验脚本阻止新增 public deprecated API。

**允许修改**：core/React/Vue 公共类型与实现、API 校验脚本、迁移指南、变更记录、API baseline、目标测试。

**不得修改**：ESM-only 构建策略、exports 生成事实源、sideEffects 策略、legacy token/CSS 变量、无关组件行为。

**依赖/阻塞**：依赖 R04；涉及同一导出或入口时必须与 R05 串行。

**完成验证**：

- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- 受影响组件目标 spec

**状态更新要求**：完成后写回状态、日期、删除的兼容面摘要和关键验证命令；同步更新阶段 3 状态。

### R07 token and legacy asset cleanup

**状态**：未开始。

**目标**：删除 legacy token CSS 变量、兼容 icon/path 名称和不再需要的旧资源导出，降低发布产物和运行时维护面。

**允许修改**：token 源与生成器、生成后的 token 产物、icon/path 工具、core 资源 exports、相关测试、迁移指南与变更记录。

**不得修改**：组件行为、ESM-only 构建策略、React/Vue sideEffects、公开组件事实源、示例导入迁移。

**依赖/阻塞**：依赖 R06；若删除资源影响 package exports，必须复跑 R04/R09 相关校验。

**完成验证**：

- `corepack pnpm tokens:build`
- `corepack pnpm tokens:check`
- `corepack pnpm test:core`
- `corepack pnpm api:validate`
- `corepack pnpm size`

**状态更新要求**：完成后写回状态、日期、删除的 legacy 资源类型和关键验证命令；同步更新阶段 3 状态。

### R08 on-demand usage docs and examples

**状态**：未开始。

**目标**：将示例、skills references 与性能文档更新为组件子路径和 lazy import 优先，保留根入口 named exports 作为便利入口说明。

**允许修改**：examples、docs、skills references、API docs 生成事实源、性能文档、示例路由 lazy import 用法。

**不得修改**：包版本、package exports、sideEffects、组件运行时、API baseline 以外的源码行为。

**依赖/阻塞**：依赖 R04；可与 R09 部分并行，但 generated references 必须通过生成器刷新。

**完成验证**：

- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm example:build`
- `corepack pnpm example:ssr:check`
- `corepack pnpm prettier --check docs skills examples`

**状态更新要求**：完成后写回状态、日期、迁移后的使用面范围和关键验证命令；同步更新阶段 4 状态。

### R09 size and publish artifact gates

**状态**：未开始。

**目标**：增加 size-limit、publish-check、bundler fixture 和 smoke 覆盖，验证 `Button` 子路径不会拉入命令式 API、charts、editors 或 locale 全量包。

**允许修改**：size-limit 配置、publish-check、bundler fixture、smoke 测试、CI/release gate、与发布产物校验相关的脚本和测试。

**不得修改**：组件运行时功能、compat API 删除、token 产物、示例内容迁移。

**依赖/阻塞**：依赖 R04 与 R05；应在 R08 完成或接近完成后校准最终 size budget。

**完成验证**：

- `corepack pnpm build`
- `corepack pnpm size`
- `corepack pnpm publish:check`
- `corepack pnpm quality:release`
- `corepack pnpm smoke:published`（发布后执行）

**状态更新要求**：完成后写回状态、日期、关键 size/publish 阈值和验证命令；若 `smoke:published` 尚未发布后执行，应明确标记为发布后待跑；同步更新阶段 4 状态。

### 后续 v2 功能入口

后续 v2 新功能从 R10 起追加。新增任务必须声明状态、目标、允许修改、不得修改、依赖/阻塞、完成验证和状态更新要求，并在阶段表中新增或更新对应阶段状态；不得插入 R01-R09 中间，也不得改变既有阶段依赖。

## 路线图维护验证

- 文档整理后运行 `corepack pnpm prettier --check docs/ROADMAP.md`。
- 确认路线图仍包含 `type: active-roadmap`，避免 `release:check` 失效。
- 文档类改动至少运行 `git diff --check -- docs/ROADMAP.md`。
- 合并或重写路线图后运行 `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md`，确认没有冲突标记。
