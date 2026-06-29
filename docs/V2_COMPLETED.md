# Tigercat v2 已完成 Roadmap 详情

<!-- LLM-INDEX
type: completed-roadmap-archive
scope: v2.0.0 completed R01-R11 roadmap execution details
verified-date: 2026-06-29
source: extracted from docs/ROADMAP.md to keep active roadmap lightweight
-->

本文归档 v2.0.0 Roadmap 已完成 R01-R11 的详细执行记录、实际验证命令和状态回写要求。当前可执行任务仍以 [ROADMAP.md](ROADMAP.md) 为准；本文件只在需要追溯已完成任务细节时读取。

## 已完成任务详情

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

**状态**：已完成（2026-06-28）。

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

**执行摘要**：已删除 core 公开废弃函数 `getResultHttpLabel(status)`，保留 `isHttpResultStatus(status)` 作为唯一结果状态判断入口；React `ImageGroup` 已删除旧回调 `onPreviewVisibleChange` 并统一为 `onPreviewOpenChange(open)`；Vue `ImageGroup` 已删除旧事件 `preview-visible-change` 并统一为 `preview-open-change`；`api:validate` 已升级为直接阻止 core / React / Vue 公开源码重新引入 `@deprecated`。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/core/result-utils.spec.ts tests/react/ImageGroup.spec.tsx tests/vue/ImageGroup.spec.ts`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`（未提交工作树下按预期报告 `api-reports/public-api-baseline.json` 删除 `getResultHttpLabel` 的 intentional diff；已用 `npx -y pnpm@11.9.0 api:baseline` 写回）
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md CHANGELOG.md docs/MIGRATION.md`
- `git diff --check`

**状态更新要求**：完成后写回状态、日期、删除的兼容面摘要和关键验证命令；同步更新阶段 3 状态。

### R07 token and legacy asset cleanup

**状态**：已完成（2026-06-28）。

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

**执行摘要**：已移除 token 生成器输出的 `Compatibility variables`、pre-0.5.0 legacy CSS 变量、`global*` / `aliasTokens` TS 兼容导出与对应 `Global*` 类型别名；已删除 DatePicker / TimePicker 旧 icon path 别名 `CalendarIconPath`、`CloseIconPath`、`ChevronLeftIconPath`、`ChevronRightIconPath`、`ClockIconPath`、`TimePickerCloseIconPath`，并移除 `common-icons` 兼容 barrel；React/Vue DatePicker 与 TimePicker 已改用 canonical `*SolidIcon20PathD` 常量；`CHANGELOG.md` 与 `docs/MIGRATION.md` 已记录迁移路径，API baseline 已刷新。

**实际验证**：

- `npx -y pnpm@11.9.0 tokens:build`
- `npx -y pnpm@11.9.0 tokens:check`
- `npx -y pnpm@11.9.0 vitest run tests/core/design-tokens.spec.ts tests/core/icon-registry.spec.ts tests/core/package-exports.spec.ts`
- `npx -y pnpm@11.9.0 test:core`（第一次全量运行中 `tests/core/imperative-side-effects.spec.ts` 的 React root mount case 发生并行时序失败；单测复跑通过，第二次 `test:core` 全量 122 files / 1991 tests 通过）
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 build`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 release:check`

**状态更新要求**：完成后写回状态、日期、删除的 legacy 资源类型和关键验证命令；同步更新阶段 3 状态。

### R08 on-demand usage docs and examples

**状态**：已完成（2026-06-28）。

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

**执行摘要**：已将 React/Vue 示例应用和 Nuxt/Next SSR smoke 的公开组件 value imports 迁移到 PascalCase 组件子路径；hooks/composables、`Message` / `notification` 命令式 API、共享类型和 core 工具继续使用根入口或 core 入口。`scripts/generate-api-docs.mjs` 已更新 generated references 文案，`skills/tigercat/references/*` 已通过 `docs:api` 刷新；`docs/MIGRATION.md`、`examples/README.md`、getting-started、performance 与 building-apps references 已同步 subpath-first / lazy-first 说明。示例 Vite alias 已按 package exports 的 root、component subpath 和 target alias 拆分，确保源码示例也能按子路径构建。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/core/examples-lazy-routes.spec.ts`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 example:build`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `git diff --name-only --diff-filter=ACM | tr '\n' '\0' | xargs -0 npx -y pnpm@11.9.0 prettier --check`
- `npx -y pnpm@11.9.0 docs:api:check`（未提交工作树下按预期报告 `skills/tigercat/references` 生成物 diff；已用 `npx -y pnpm@11.9.0 docs:api` 写回，提交后需复跑确认 clean）
- `npx -y pnpm@11.9.0 prettier --check docs skills examples scripts tests`（发现既有未改文件 `skills/tigercat/SKILL.md`、`examples/nextjs/next-env.d.ts`、`tests/core/heatmap-chart-utils.spec.ts`、`tests/core/list-utils.spec.ts` 格式不符合 Prettier；本次变更文件已通过 changed-file Prettier check）

**状态更新要求**：完成后写回状态、日期、迁移后的使用面范围和关键验证命令；同步更新阶段 4 状态。

### R09 size and publish artifact gates

**状态**：已完成（2026-06-28）。

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

**执行摘要**：已扩展 `publish:check` 的 Button bundler smoke：React / Vue root Button named import 继续验证不拉入 `Message` / `notification` 命令式挂载逻辑，React / Vue Button 子路径 import 额外验证不拉入 charts、editors 或全量 locale barrel，并将 Button 子路径 bundle 上限固定为 React 6 kB、Vue 8 kB。`release:check` 已新增 `.size-limit.json` 预算结构、`quality:release` 必含 `publish:check`、发布 workflow 门禁命令和触发面约束校验；`quality:release` 已纳入 `publish:check`。`.github/workflows/publish.yml` 和 `.github/workflows/publish-on-tag.yml` 仅将发布前命令提升为 `pnpm quality:release`，未新增 workflow，也未新增 `push`、`pull_request`、`schedule` 或 `workflow_run` 触发。

**实际验证**：

- `npx -y pnpm@11.9.0 build`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 publish:check`
- `npx -y pnpm@11.9.0 release:check`
- `npx -y pnpm@11.9.0 quality:release`
- `npx -y pnpm@11.9.0 vitest run tests/core/imperative-side-effects.spec.ts tests/core/package-exports.spec.ts`
- `npx -y pnpm@11.9.0 prettier --check .github/workflows/publish.yml .github/workflows/publish-on-tag.yml .size-limit.json CHANGELOG.md docs/ROADMAP.md package.json scripts/check-release-readiness.mjs scripts/publish-check.mjs skills/tigercat/references/release.md`
- `git diff --check`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md CHANGELOG.md skills/tigercat/references/release.md .github/workflows scripts tests package.json .size-limit.json`

**发布后验证**：`npx -y pnpm@11.9.0 smoke:published` 尚需在 v2.0.0 发布到 npm 后执行。

**状态更新要求**：完成后写回状态、日期、关键 size/publish 阈值和验证命令；若 `smoke:published` 尚未发布后执行，应明确标记为发布后待跑；同步更新阶段 4 状态。

### R10 grouped validation, docs, and examples infrastructure

**状态**：已完成（2026-06-29）。

**目标**：先建立按组件组可执行的测试、文档和示例维护通道，避免后续组件批次每次都依赖长时间全量测试。

**允许修改**：root `package.json` scripts、测试分组脚本、测试质量校验脚本、与分组测试相关的 core tests、`scripts/README.md`、examples README、Skill references 中 release/performance/component-index 相关说明、必要的文档生成器事实源。

**不得修改**：组件运行时行为、公共 API、package exports、API baseline 内容、size budget、R11-R20 组件源码清理。

**依赖/阻塞**：依赖 R09；R11-R20 不得在本任务完成前启动。

**完成要求**：

- 新增 `scripts/run-component-group-tests.mjs`，基于 `scripts/lib/public-components.mjs` 的现有 Category 支持 `basic`、`form`、`feedback`、`layout`、`navigation`、`data`、`charts`、`advanced`、`composite`、`core`。
- 脚本支持 `--group <name>`、`--framework react|vue|all`、`--list`；若实现 R14/R15 分批需要，可同时支持 `--filter <keyword>` 只筛选同组内测试文件。
- 每个分组必须能收集该组 React/Vue 组件 spec、相关 core utils spec 和必要 cross-cutting specs；找不到文件时应输出清晰错误，`--list` 不运行测试。
- 新增 package scripts：`test:group`、`test:group:basic`、`test:group:form`、`test:group:feedback`、`test:group:layout`、`test:group:navigation`、`test:group:data`、`test:group:charts`、`test:group:advanced`、`test:group:composite`、`test:group:core`。
- 扩展 `scripts/validate-tests.mjs`，允许 `TEST_GROUP=<group>` 或脚本参数校验单组测试质量。
- 更新 `scripts/README.md`、Skill release/performance/component-index 相关 references 和 `examples/README.md`，说明每个组件批次应优先运行对应分组测试、对应 examples/docs 检查和 changed-file Prettier check。

**完成验证**：

- `corepack pnpm test:group -- --list --group form`
- 每个 `corepack pnpm test:group:* -- --list`
- 至少 2 个代表性分组实跑，其中必须包含 `corepack pnpm test:group:core` 和一个组件分组
- `TEST_GROUP=form corepack pnpm test:validate` 或等效脚本参数
- `corepack pnpm docs:api:check`
- `corepack pnpm api:validate`
- `git diff --check`

**执行摘要**：已新增 `scripts/lib/component-test-groups.mjs` 作为分组测试文件解析事实源，并新增 `scripts/run-component-group-tests.mjs` 作为 `test:group` runner；root `package.json` 已新增 `test:group` 与 10 个 `test:group:*` 入口。runner 基于 `scripts/lib/public-components.mjs` 的 Category 与公开组件导出收集 React/Vue exact component spec、同组 core utils spec 和显式 cross-cutting spec，支持 `--group`、`--framework`、`--list`、`--filter`；`form` 额外支持 `primitives` / `composite` filter alias。`scripts/validate-tests.mjs` 已支持 `TEST_GROUP=<group>`、`--group`、`--framework`、`--filter` 单组测试质量校验。`scripts/README.md`、`examples/README.md`、Skill release/performance/component-index references 已同步说明组件批次优先运行对应分组测试、相关 docs/examples 检查和 changed-file Prettier check。

**实际分组覆盖规则**：

- `basic`、`form`、`feedback`、`layout`、`navigation`、`data`、`charts`、`advanced`、`composite`：收集同组 React/Vue 公开组件 spec、同组 core utils spec 和 `component-test-groups.mjs` 中维护的 cross-cutting specs。
- `core`：收集 `tests/core` 下全部 `.spec.ts` / `.spec.tsx`。
- `--framework react|vue` 只限制框架组件 spec，仍保留同组 core specs；`--list` 只打印解析结果不运行 Vitest；`--filter <keyword>` 在已解析的同组文件内继续筛选。

**实际验证**：

- `corepack pnpm test:group -- --list --group form`
- `for group in basic form feedback layout navigation data charts advanced composite core; do corepack pnpm "test:group:$group" -- --list; done`
- `corepack pnpm test:group:core`（122 files / 1996 tests passed）
- `corepack pnpm test:group:basic`（79 files / 1320 tests passed）
- `TEST_GROUP=form corepack pnpm test:validate`（75 files passed；56 existing soft warnings）
- `corepack pnpm docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `corepack pnpm api:validate`
- `corepack pnpm release:check`
- `npx -y pnpm@11.9.0 prettier --check package.json scripts/README.md scripts/generate-api-docs.mjs scripts/lib/component-test-groups.mjs scripts/run-component-group-tests.mjs scripts/validate-api.mjs scripts/validate-tests.mjs examples/README.md skills/tigercat/references/component-index.md skills/tigercat/references/performance.md skills/tigercat/references/release.md docs/ROADMAP.md`
- `git diff --check`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md CHANGELOG.md skills scripts tests examples package.json`

**状态更新要求**：完成后写回状态、日期、分组脚本入口、实际分组覆盖规则和关键验证命令；同步更新阶段 5 状态，并将当前可执行任务推进到 R11。

### R11 Core API and shared contracts audit

**状态**：已完成（2026-06-29）。

**目标**：审计 core types、utils、shared contracts，形成 R12-R20 可执行的删除/合并清单，避免组件批次各自临时决定公共 API 规则。

**允许修改**：core 类型/工具审计文档或 Roadmap 清单、必要的 API 校验脚本、测试分组映射、迁移说明草案、变更记录草案。

**不得修改**：React/Vue 组件运行时清理、package exports、sideEffects、size budget、未列入清单的 public API 删除。

**依赖/阻塞**：依赖 R10。

**完成要求**：

- 明确可删除 alias、冗余类型、重复事件模型、可拆分大型类型文件和跨端受控命名规则。
- 为 R12-R20 每个组件批次补充计划移除的 props/events/methods/type aliases 和唯一替代 API。
- 若发现无法安全判定的 API，标记为阻塞项并写明需要的迁移依据。

**完成验证**：

- `corepack pnpm test:group:core`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline:check`
- `git diff --check`

**执行摘要**：已新增 `docs/V2_API_AUDIT.md` 作为 R11 审计输出，固定 v2 API 清理共享规则、R12-R20 每个组件批次的计划删除/合并项、唯一替代 API、证据路径和批次内待确认点。审计基于当前 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口、2905 个 core exports、148 个 React/Vue 公开组件）以及 `scripts/validate-api.mjs` 现有 public deprecated、overlay open、controlled parity、Skill references 护栏；R11 未删除运行时 API、未修改 package exports、sideEffects 或 size budget。为让 R10 分组测试 runner 在无 `corepack` 的 Windows 环境继续可执行，`scripts/run-component-group-tests.mjs` 已改为优先复用当前 pnpm `npm_execpath`，否则再回退 PATH 中的 `pnpm`。

**审计输出位置**：

- `docs/V2_API_AUDIT.md`

**R12-R20 清单更新范围**：

- R12 Basic + Layout：轻量组件尺寸/布局别名、Carousel 受控索引模型和 class/style 透传。
- R13 Feedback + Overlay：React `usePopup` 旧 visible 合约、overlay close/destroy/portal 命名和 R05 imperative sideEffects 边界。
- R14-R15 Form：primitive 受控模型、等同 `ComponentSize` 的别名、选择器 value/search/filter/locale 与 picker/upload heavy helper 拆分。
- R16 Navigation：active/selected/open/expanded 命名、子组件 subpath/re-export 策略和 search props。
- R17 Data + Table：Table/VirtualTable/DataTableWithToolbar 的 data、selection、virtual、filter/sort/pagination 与 `GenericTable*` 合并边界。
- R18 Charts：`chart.ts` 拆分、datum/series alias、tooltip visible/showTooltip 命名和 charts 隔离。
- R19 Advanced + Media：editor/file/image/number-keyboard value/open/currentIndex 命名和 heavy runtime 隔离。
- R20 Composite + Business：`composite.ts` 拆分、Kanban/TaskBoard alias、DataTableWithToolbar toolbar alias 和最终发布收口。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:core`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md scripts/run-component-group-tests.mjs`
- `git diff --check`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/V2_API_AUDIT.md scripts/run-component-group-tests.mjs`

**状态更新要求**：完成后写回状态、日期、审计输出位置、R12-R20 清单更新范围和关键验证命令；同步更新阶段 6 状态，并将当前可执行任务推进到 R12。

### R12 Basic + Layout lightweight components

**状态**：已完成（2026-06-29）。

**目标**：清理 Basic 与 Layout 轻量展示组件，删除历史别名 props，统一 class/style 透传和子组件导出策略，并同步测试、Skill 文档与 examples。

**允许修改**：Basic/Layout 相关 core types、React/Vue 组件、目标 tests、Skill `shared/props/basic.md`、`shared/props/layout.md`、`examples/basic.md`、`examples/layout.md`、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Feedback/Form/Navigation/Data/Charts/Advanced/Composite 组件行为、测试分组基础设施、发布 workflow。

**依赖/阻塞**：依赖 R11。

**执行摘要**：已删除等同 shared contracts 的 `SpaceDirection`、`SpaceAlign`、`CardDirection`、`StatisticSize`、`DescriptionsSize`、`ListSize` public type aliases；对应 props 改用 `BaseLayoutProps` 或 `ComponentSize`。保留 `ButtonSize`、`AvatarSize`、`TextSize` 和 `SkeletonShape`，因为它们扩展或偏离共享 size/layout 合约，或当前没有共享 shape contract。Carousel 已删除 `initialSlide`，新增 `currentIndex` / `defaultCurrentIndex`；React 新增 `onCurrentIndexChange`，Vue 新增 `update:currentIndex`，导航、dots、swipe、autoplay 和 imperative methods 均走同一索引提交路径。React/Vue Carousel tests、example demos、迁移说明、变更记录、API baseline 与 Skill references 已同步更新。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/react/Carousel.spec.tsx tests/vue/Carousel.spec.ts`
- `npx -y pnpm@11.9.0 test:group:basic`
- `npx -y pnpm@11.9.0 test:group:layout`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 size`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 API 摘要、Skill/examples 更新范围、分组测试命令和关键验证命令；阶段 7 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R13。

### R13 Feedback and overlay components

**状态**：已完成（2026-06-29）。

**目标**：统一 Feedback 与 overlay 组件的 open/portal/focus/keyboard/after-close 合约，删除 visible 语义残留和旧 portal 兼容分支。

**允许修改**：Feedback 相关 core types、React/Vue 组件、overlay 工具、目标 tests/e2e、Skill feedback props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Navigation/Data/Charts/Advanced/Composite 组件行为、无关 package exports、size budget 结构。

**依赖/阻塞**：依赖 R11；Message/notification 命令式入口保持 R05 sideEffects 隔离目标。

**执行摘要**：已删除 React `packages/react/src/hooks/usePopup.ts` 旧 source hook 及 hooks barrel re-export，旧 `visible` / `defaultVisible` / `onVisibleChange` hook 合约不再保留。React/Vue Tooltip、Popover、Popconfirm 示例切到 `open` / `defaultOpen` / `onOpenChange` / `update:open`，并在 `scripts/validate-api.mjs` 中加入窄范围 Feedback 示例和 React hook source 护栏。Drawer 将 `destroyOnCloseAfterLeave` 改为 `deferDestroyOnClose`，React `onAfterLeave` / Vue `after-leave` 改为 `onAfterClose` / `after-close`；Modal 新增 React `onAfterClose` 与 Vue `after-close`，外部 `open=false` 不再触发 close intent。Vue Modal/Drawer 删除测试逃生口 `disableTeleport` 并统一 body teleport；Popconfirm confirm/cancel 关闭后恢复触发器焦点；Message/notification imperative root 与 pure container 拆分未改动。

**实际验证**：

- `npx -y pnpm@11.9.0 vitest run tests/react/Modal.spec.tsx tests/vue/Modal.spec.ts tests/react/Drawer.spec.tsx tests/vue/Drawer.spec.ts tests/react/Popconfirm.spec.tsx tests/vue/Popconfirm.spec.ts`
- `npx -y pnpm@11.9.0 vitest run tests/react/Tooltip.spec.tsx tests/vue/Tooltip.spec.ts tests/react/Popover.spec.tsx tests/vue/Popover.spec.ts`
- `npx -y pnpm@11.9.0 vitest run tests/vue/DragEnhancements.spec.ts tests/vue/custom-text.spec.ts tests/core/a11y-interactive-regression.spec.tsx`
- `npx -y pnpm@11.9.0 test:group:feedback`
- `npx -y pnpm@11.9.0 vitest run tests/core/imperative-side-effects.spec.ts`
- `npx -y pnpm@11.9.0 e2e:smoke`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 overlay/feedback API 摘要、Skill/examples 更新范围和关键验证命令；阶段 8 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R14。
