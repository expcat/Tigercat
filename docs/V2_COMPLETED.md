# Tigercat v2 已完成 Roadmap 详情

<!-- LLM-INDEX
type: completed-roadmap-archive
scope: v2.0.0 completed R01-R23 roadmap execution details
verified-date: 2026-06-30
source: extracted from docs/ROADMAP.md to keep active roadmap lightweight
-->

本文归档 v2.0.0 Roadmap 已完成 R01-R23 批次的详细执行记录、实际验证命令和状态回写要求。当前可执行任务仍以 [ROADMAP.md](ROADMAP.md) 为准；本文件只在需要追溯已完成任务细节时读取。

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
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 test:a11y`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `git diff --check`
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

**执行摘要**：已新增 `docs/V2_API_AUDIT.md` 作为 R11 审计输出，固定 v2 API 清理共享规则、R12-R20 每个组件批次的计划删除/合并项、唯一替代 API、证据路径和批次内待确认点。审计基于 R11 当时的 `api-reports/public-api-baseline.json`（156 个 `*Props` 接口、2905 个 core exports、148 个 React/Vue 公开组件）以及 `scripts/validate-api.mjs` 现有 public deprecated、overlay open、controlled parity、Skill references 护栏；R11 未删除运行时 API、未修改 package exports、sideEffects 或 size budget。为让 R10 分组测试 runner 在无 `corepack` 的 Windows 环境继续可执行，`scripts/run-component-group-tests.mjs` 已改为优先复用当前 pnpm `npm_execpath`，否则再回退 PATH 中的 `pnpm`。

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

**组件范围**：Button、Tag、Badge、Avatar、Card、Space、Skeleton、Divider、Text、Statistic、Descriptions、List、Carousel，以及同组内必要的子组件。

**完成验证**：

- `corepack pnpm test:group:basic`
- `corepack pnpm test:group:layout`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `corepack pnpm size`
- `git diff --check`

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

**组件范围**：Modal、Drawer、Tooltip、Popover、Popconfirm、Message、Notification、Loading、Tour、Progress。

**完成验证**：

- `corepack pnpm test:group:feedback`
- `corepack pnpm vitest run tests/core/imperative-side-effects.spec.ts`
- `corepack pnpm e2e:smoke` 或目标 overlay e2e
- `corepack pnpm example:ssr:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

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

### R14 Form primitives

**状态**：已完成（2026-06-29）。

**目标**：清理表单基础输入组件，统一 controlled/default/onChange 模型，删除重复 value alias，并将重复测试收缩为分组内参数化覆盖。

**允许修改**：Form primitive 相关 core types、React/Vue 组件、目标 tests、受控状态 helper 使用、Skill form props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form composite selectors、Feedback/Navigation/Data/Charts/Advanced/Composite 组件行为、测试分组基础设施。

**依赖/阻塞**：依赖 R11；R13 已完成，overlay/focus 变更未与本批次交叉。

**组件范围**：Input、Textarea、InputNumber、Checkbox、Radio、Switch、Slider、Stepper、Segmented、ColorSwatch。

**完成验证**：

- `corepack pnpm test:group:form -- --filter primitives`
- `corepack pnpm vitest run tests/react/useControlledState.spec.tsx tests/vue/useFormController.spec.ts`
- `corepack pnpm test:a11y`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：已删除等同 `ComponentSize` 的 primitive 尺寸类型别名 `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize`；对应 core props、style utilities、theme runtime、React/Vue components 和 generated references 改用 `ComponentSize`。Vue Checkbox、Radio、Switch 从 `checked` / `defaultChecked` / `update:checked` 收敛为 `modelValue` / `defaultValue` / `update:modelValue` / `change`；Vue RadioGroup 从 `value` / `update:value` 收敛为 `modelValue` / `update:modelValue`。React Checkbox、Radio、Switch 保持 `checked` / `defaultChecked` / `onChange`，Checkbox/Radio 的 `value` 保留为 group option identity。Vue Checkbox/Radio/Switch/RadioGroup examples 与 tests 已迁移，`scripts/validate-api.mjs` 已新增 R14 回流护栏。

**实际删除 / 合并**：

- `InputSize`、`TextareaSize`、`CheckboxSize`、`RadioSize`、`SwitchSize`、`SliderSize`、`SegmentedSize`、`StepperSize`、`ColorSwatchSize` → `ComponentSize`。
- Vue Checkbox / Radio / Switch 单体 `defaultChecked`、`update:checked`、`v-model:checked` → `defaultValue`、`update:modelValue`、默认 `v-model`。
- Vue RadioGroup `value` / `update:value` / `v-model:value` → `modelValue` / `update:modelValue` / 默认 `v-model`。

**实际保留**：

- `CheckboxValue` / `CheckboxGroupValue` 保留，Checkbox `value` 仍用于 group option value。
- Radio `value` 保留为 option identity；React Radio / Checkbox / Switch 的 `checked` / `defaultChecked` 保留为 React 惯用 API。
- `InputStatus` 和 `InputType` 保留，因为它们不是尺寸 shared union 的重复别名。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:form -- --filter primitives`
- `npx -y pnpm@11.9.0 vitest run tests/react/useControlledState.spec.tsx tests/vue/useFormController.spec.ts`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 docs:api`

**状态更新要求**：完成后已写回状态、日期、删除的 primitive API 摘要、参数化测试收缩范围、Skill/examples 更新范围和关键验证命令；阶段 9 已同步为 `进行中`，当前可执行任务推进到 R15。

### R15 Form composite selectors

**状态**：已完成（2026-06-29）。

**目标**：清理表单复合选择器和大体量表单组件的多分支 API，统一 search/filter/empty/loading/locale 入口，并拆分可 tree-shake 的 heavy helpers。

**允许修改**：Form composite 相关 core types、React/Vue 组件、picker/select/upload/form helper、目标 tests、Skill form props/examples、example 使用、迁移说明、变更记录、API baseline、必要的 bundle smoke。

**不得修改**：Form primitives 已完成行为、Feedback/Navigation/Data/Charts/Advanced/Composite 组件行为、发布 workflow。

**依赖/阻塞**：依赖 R14；DatePicker/TimePicker locale 与 custom text 路径保持 R08/R09 的 locale trimming 目标。

**组件范围**：Select、TreeSelect、Cascader、AutoComplete、Transfer、DatePicker、TimePicker、ColorPicker、Upload、Form、FormItem、InputGroup。

**完成验证**：

- `corepack pnpm test:group:form`
- `corepack pnpm vitest run tests/core/custom-text-labels.spec.ts tests/core/datepicker-i18n.spec.ts`
- `corepack pnpm example:ssr:check`
- `corepack pnpm size`
- `corepack pnpm publish:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：已删除等同 `ComponentSize` 的 composite 尺寸类型别名 `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize`；对应 core props、style utilities、React/Vue components 和 generated references 改用 `ComponentSize`。DatePicker/TimePicker public model surface 收敛为 `DatePickerModelValue` 与 `TimePickerModelValue`，删除重复 single/range public aliases。Select、TreeSelect、Cascader、AutoComplete、Transfer 的搜索受控量统一为 `searchValue` / `defaultSearchValue`，React 使用 `onSearchChange`，Vue 使用 `update:searchValue` / `search-change`；TreeSelect、Cascader、Transfer 搜索开关统一为 `searchable`。空态文案统一为 `emptyText` 并继续走 locale/custom text fallback。Upload queue/chunk/resume helper 已拆出基础 `upload-utils`，避免普通 Upload helper 引入队列重逻辑；examples、tests、API baseline、Skill references、迁移说明、变更记录和 `api:validate` R15 回流护栏已同步更新。

**实际删除 / 合并**：

- `SelectSize`、`TreeSelectSize`、`CascaderSize`、`AutoCompleteSize`、`DatePickerSize`、`TimePickerSize`、`TransferSize`、`ColorPickerSize`、`InputGroupSize`、`FormSize` → `ComponentSize`。
- `DatePickerSingleModelValue`、`DatePickerRangeModelValue`、`DatePickerSingleValue`、`DatePickerRangeValue` → `DatePickerModelValue`。
- `TimePickerSingleValue`、`TimePickerRangeValue` → `TimePickerModelValue`。
- React `onSearch` → `onSearchChange`；Vue `search` → `search-change` / `update:searchValue`。
- `showSearch` → `searchable`；`notFoundText` / `noOptionsText` / `noDataText` → `emptyText`。
- Upload queue/chunk/resume helper 从基础 `upload-utils` 拆入 `upload-queue-utils` 内部模块并经 utils barrel 公开。

**实际保留**：

- `SelectModelValue`、`TreeSelectValue`、`CascaderValue`、`AutoCompleteOption`、`UploadFileItem` 等具有组件领域语义的类型保留。
- DatePicker / TimePicker 的 range 运行时行为保留；仅删除重复的 public single/range aliases。
- Upload queue helper 仍从 `@expcat/tigercat-core` 根入口导出，保持 public helper 可用性。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:form -- --filter composite`
- `npx -y pnpm@11.9.0 vitest run tests/core/custom-text-labels.spec.ts tests/core/datepicker-i18n.spec.ts`
- `npx -y pnpm@11.9.0 test:group:form`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 publish:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)"`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 composite form API 摘要、heavy helper 拆分范围、Skill/examples 更新范围和关键验证命令；阶段 9 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R16。

### R16 Navigation components

**状态**：已完成（2026-06-29）。

**目标**：清理 Navigation 组件，合并子项组件导出策略，删除深路径兼容 re-export，统一 active/open/selected/expanded 命名。

**允许修改**：Navigation 相关 core types、React/Vue 组件、子组件 re-export 文件、公开组件事实源、package exports、目标 tests、Skill navigation props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Data/Charts/Advanced/Composite 组件行为、非 Navigation 子路径、size budget 结构。

**依赖/阻塞**：依赖 R11；子组件 subpath 保留为 PascalCase package path，但 exports 目标改为父组件产物。

**组件范围**：Tabs、Menu、Dropdown、Tree、Pagination、Anchor、Breadcrumb、Steps、Spotlight、FloatButton、BackTop、ScrollSpy、Affix。

**完成验证**：

- `corepack pnpm test:group:navigation`
- `corepack pnpm vitest run tests/core/examples-lazy-routes.spec.ts`
- `corepack pnpm test:a11y`
- `corepack pnpm exports:check`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm api:baseline:check`
- `corepack pnpm docs:api`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：React Tabs / ScrollSpy 的 active key 受控回调从 `onChange` 收敛为 `onActiveKeyChange`；React Menu 搜索从 `onSearch` 收敛为 `onSearchChange`；React Menu / Tree 受控 keys 使用 `onSelectedKeysChange`、`onOpenKeysChange`、`onExpandedKeysChange`、`onCheckedKeysChange`，原 `onSelect` / `onOpenChange` / `onExpand` / `onCheck` 保留为交互上下文事件。`AnchorChangeInfo.currentActiveLink` 已改为 `activeLink`。React/Vue Navigation 子组件独立 shim 文件已删除，`AnchorLink`、`BreadcrumbItem`、`DropdownItem`、`DropdownMenu`、`MenuItem`、`MenuItemGroup`、`StepsItem`、`SubMenu`、`TabPane` 的 package subpath 继续存在并指向父组件产物；examples、tests、API baseline、Skill references、迁移说明、变更记录和 `api:validate` R16 回流护栏已同步更新。

**实际删除 / 合并**：

- React Tabs / ScrollSpy `onChange` → `onActiveKeyChange`。
- React Menu `onSearch` → `onSearchChange`。
- React Menu controlled selection/open 更新 → `onSelectedKeysChange` / `onOpenKeysChange`。
- React Tree controlled expand/select/check 更新 → `onExpandedKeysChange` / `onSelectedKeysChange` / `onCheckedKeysChange`。
- `AnchorChangeInfo.currentActiveLink` → `AnchorChangeInfo.activeLink`。
- Navigation 子组件源码 shim 文件删除；子组件 package exports 目标合并到父组件产物。

**实际保留**：

- 子组件 PascalCase package subpath 保留，例如 `@expcat/tigercat-react/MenuItem`、`@expcat/tigercat-vue/TabPane`。
- Vue Navigation 继续使用 `update:*` / `v-model:*` 与 kebab-case 事件。
- React `onSelect`、`onOpenChange`、`onExpand`、`onCheck` 保留为携带交互上下文的事件，不承担受控量唯一出口。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:navigation`
- `npx -y pnpm@11.9.0 vitest run tests/core/examples-lazy-routes.spec.ts`
- `npx -y pnpm@11.9.0 test:a11y`
- `npx -y pnpm@11.9.0 exports:sync`
- `npx -y pnpm@11.9.0 exports:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)"`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 Navigation API/subpath 摘要、Skill/examples 更新范围和关键验证命令；阶段 10 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R17。

### R17 Data and table stack

**状态**：已完成（2026-06-29）。

**目标**：清理 Data 与 table stack，统一 columns/filter/sort/pagination/virtual props，删除重叠阈值和 toolbar alias，收敛固定列与虚拟滚动逻辑。

**允许修改**：Data/table 相关 core types、React/Vue 组件、table helper、目标 tests/e2e、Skill data/advanced props/examples、example 使用、迁移说明、变更记录、API baseline。

**不得修改**：Form/Navigation/Charts/Advanced editors/Composite business 组件行为、无关 exports。

**依赖/阻塞**：依赖 R11；`DataTableWithToolbar` 本轮只同步底层 Table props，toolbar 业务 alias 仍留给 R20 composite/business 收口。

**组件范围**：Table、DataTableWithToolbar、VirtualTable、Calendar、Timeline、Collapse、Countdown。

**完成验证**：

- `corepack pnpm test:group:data`
- `corepack pnpm vitest run tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts`
- `corepack pnpm e2e:smoke`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm docs:api:check`
- `git diff --check`

**执行摘要**：Table / VirtualTable / DataTableWithToolbar 的数据入口已统一为 `dataSource`；VirtualTable 删除 `data`、`rowHeight`、`height`、`selectable`、`selectedKeys`、`onSelect` 公共入口，改用 `virtualItemHeight`、`virtualHeight`、`rowSelection` 与 React `onSelectionChange` / Vue `selection-change`、`update:rowSelection`。Table 自动虚拟化与推荐态统一使用 `virtualThreshold`，删除 `autoVirtualThreshold` 与 `TABLE_AUTO_VIRTUAL_THRESHOLD` / `autoThreshold`。`GenericTableColumn`、`GenericRowSelection`、`GenericExpandable`、`GenericTableProps` 已删除，泛型用户改用 `TableColumn<T>`、`RowSelectionConfig<T>`、`ExpandableConfig<T>`、`TableProps<T>`。React/Vue VirtualTable 继续复用 shared fixed-column helpers，examples、Skill references、API baseline、迁移说明和变更记录已同步更新；`scripts/validate-api.mjs` 新增 R17 guard 防止旧 API 回流。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:data`
- `npx -y pnpm@11.9.0 vitest run tests/react/TableState.spec.tsx tests/vue/TableState.spec.ts`
- `npx -y pnpm@11.9.0 vitest run tests/react/VirtualTable.spec.tsx tests/vue/VirtualTable.spec.ts tests/core/virtual-table-utils.spec.ts tests/core/table-utils.spec.ts`
- `npx -y pnpm@11.9.0 e2e:smoke`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)"`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 Data/table API 摘要、固定列/虚拟滚动验证范围、Skill/examples 更新范围和关键验证命令；阶段 11 已同步为 `已完成（2026-06-29）`，当前可执行任务推进到 R18。

### R20 Composite/business components

**状态**：组件级 API 清理已完成（2026-06-30）；本批次不发布版本。

**执行顺序说明**：按维护决定，R20 组件级 API 清理提前于 R19 执行；R20 不再作为 v2.0.0 发布收口任务，v2.0.0 后续仍会追加新的更新计划，路线图不在 R20 处收口。

**目标**：清理 Composite/business components，移除并行数据模型别名，收敛 DataTableWithToolbar 业务回调入口，并拆分 composite 巨型类型文件。

**允许修改**：Composite 相关 core types、React/Vue 组件、目标 tests、Skill composite props/examples、example 使用、迁移说明、变更记录、API baseline、`scripts/lib/public-components.mjs` 与 `scripts/validate-api.mjs` 的 composite 分类与 guard。

**不得修改**：R10-R19 已完成 API 的兼容回退、已完成分组测试入口的语义、未说明的新增功能；本批次不发布版本。

**组件范围**：ActivityFeed、ChatWindow、CommentThread、FormWizard、NotificationCenter、TaskBoard、Kanban、DataTableWithToolbar。

**执行摘要**：移除 `KanbanCard` / `KanbanColumn` / `KanbanCardMoveEvent` / `KanbanColumnMoveEvent` 公共类型别名（统一复用 `TaskBoardCard` / `TaskBoardColumn` / `TaskBoardCardMoveEvent` / `TaskBoardColumnMoveEvent`，保留 `KanbanProps` / `KanbanSwimlane`）；删除 core 与 React `DataTableWithToolbarProps` 顶层 `onSearchChange` / `onSearch` / `onFiltersChange` / `onBulkAction`，业务回调统一从 React `toolbar.*` 配置与 Vue 组件事件 `@search-change` / `@search` / `@filters-change` / `@bulk-action` 发出（`onPageChange` / `onPageSizeChange` / `onSelectionChange` 等分页与表格回调保持组件顶层）；将 `packages/core/src/types/composite.ts` 巨型类型文件按组件拆分为 `chat.ts`、`activity-feed.ts`、`comment-thread.ts`、`notification-center.ts`、`table-toolbar.ts`、`form-wizard.ts`、`task-board.ts`，`composite.ts` 改为薄 barrel，`kanban.ts` 改为从 `task-board.ts` 导入，并在 `scripts/lib/public-components.mjs` 的 Composite 分类补齐新文件 basename。React DataTableWithToolbar 示例与测试已迁移到 `toolbar.*` 回调；`scripts/validate-api.mjs` 新增 R20 guard（`composite-api`）阻止 Kanban 别名与 DataTableWithToolbar 顶层业务回调回流；API baseline、generated Skill references、迁移说明与变更记录已同步更新。

**实际验证**：

- `corepack pnpm test:group:composite`（19 文件 / 350 用例通过）
- `npx tsc --noEmit -p packages/core/tsconfig.json`、`packages/react/tsconfig.json`、`packages/vue/tsconfig.json`、`examples/example/react/tsconfig.json`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`（core exports 2882→2878）
- `corepack pnpm docs:api`
- `git diff --check`

**发布收口说明**：`corepack pnpm quality:release` 全量发布门禁与发布后 `corepack pnpm smoke:published` 因本批次不发布而不属于 R20 验证范围；2026-06-30 复核时 `api:baseline:check` 已通过。

**状态更新要求**：已写回 R20 状态、日期、删除/拆分摘要、唯一替代 API 与关键验证命令；阶段 14 标为「已完成（2026-06-30）」，并在 [V2_API_AUDIT.md](V2_API_AUDIT.md) 追加 R20 批次记录。v2.0.0 路线图不在 R20 处收口。

### R18 Charts and visualization stack

**状态**：已完成（2026-06-30）。

**目标**：拆分巨型 chart type/API，统一 data/series/tooltip/legend/a11y 合约，并确保基础组件不会拉入 charts。

**允许修改**：Charts 相关 core types、React/Vue chart components、chart hooks/helpers、目标 tests/bench smoke、Skill charts props/examples、example 使用、迁移说明、变更记录、API baseline、publish bundle smoke。

**不得修改**：Basic/Form/Feedback/Navigation/Data/Advanced/Composite 非图表行为、无关 package exports。

**依赖/阻塞**：依赖 R11；必须保持 R09 的 Button 子路径不拉入 charts 的隔离目标。

**组件范围**：ChartCanvas、ChartAxis、ChartGrid、ChartLegend、ChartTooltip、AreaChart、BarChart、LineChart、PieChart、DonutChart、RadarChart、ScatterChart、HeatmapChart、SunburstChart、TreeMapChart、FunnelChart、GaugeChart、Gantt、OrgChart。

**执行摘要**：`packages/core/src/types/chart.ts` 已拆为 core、cartesian、radial、visualization 四个分组类型文件，原 `chart.ts` 保留为 public barrel，根入口导出路径不变。删除重复 datum aliases `AreaChartDatum` 与 `DonutChartDatum`，Area 单序列数据统一使用 `LineChartDatum`，Donut 数据统一使用 `PieChartDatum`；保留 Bar、Scatter、Pie、Radar、Line、Funnel、Heatmap、TreeMap、Sunburst 等有领域字段的数据类型。独立 `ChartTooltip` 从 `visible` 改为 `open`，高阶图表继续使用 `showTooltip` 控制内置 tooltip，并通过 `ChartBuiltInTooltipProps` 与独立 `ChartTooltipProps` 分层。React/Vue 组件、tests、examples、API baseline、Skill references、迁移说明、变更记录和 `api:validate` R18 回流护栏已同步更新；R09 Button 子路径 charts 隔离 smoke 继续由 `publish:check` 覆盖。

**实际删除 / 合并**：

- `AreaChartDatum` → `LineChartDatum`。
- `DonutChartDatum` → `PieChartDatum`。
- 高阶图表内置 tooltip props → `ChartBuiltInTooltipProps`。
- 独立 `ChartTooltip visible` → `open`。
- `chart.ts` 巨型类型文件 → `chart-core.ts` / `chart-cartesian.ts` / `chart-radial.ts` / `chart-visualization.ts` + public barrel。

**实际保留**：

- `AreaChartSeries` 保留，因为它扩展 `LineChartSeries` 的 fill 语义。
- `ChartSeriesPoint`、`ChartInteractionProps`、`ChartLegendProps`、`ChartTooltipProps` 保留为 chart shared contracts。
- `showTooltip` 保留在高阶 chart components 上，用于启停内置 tooltip；它不再作为独立 `ChartTooltip` 可见性命名。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:charts`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:baseline`
- `npx -y pnpm@11.9.0 api:baseline:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 publish:check`
- `npx -y pnpm@11.9.0 size`
- `npx -y pnpm@11.9.0 prettier --check docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md CHANGELOG.md docs/MIGRATION.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/V2_API_AUDIT.md docs/V2_COMPLETED.md docs/MIGRATION.md CHANGELOG.md`
- `git diff --check`

**状态更新要求**：完成后已写回状态、日期、删除的 chart API 摘要、bundle 隔离结果、Skill/examples 更新范围和关键验证命令；阶段 12 已同步为 `已完成（2026-06-30）`，当前可执行任务推进到 R19。

### R19 Advanced editors and media-heavy components

**状态**：已完成（2026-06-30）。

**目标**：清理 Advanced editors 与 media-heavy components，隔离 heavy runtime，统一 file/image/editor value 与 event 命名，删除旧浏览器兼容分支中的 public API。

**允许修改**：Advanced 相关 core types、React/Vue 组件、editor/media helpers、目标 tests、SSR/browser guard tests、Skill advanced props/examples、example 使用、迁移说明、变更记录、API baseline、必要 bundle smoke。

**不得修改**：Charts/Data/Composite business 组件行为、发布 workflow、无关 package exports。

**组件范围**：CodeEditor、MarkdownEditor、RichTextEditor、FileManager、ImageViewer、ImageAnnotation、ImageCropper、PrintLayout、VirtualList、InfiniteScroll、Signature、NumberKeyboard。

**执行摘要**：删除 core `NumberKeyboardProps.modelValue`，跨框架 shared contract 统一使用 `value` / `defaultValue`，Vue `NumberKeyboard` 组件本地仍保留 `modelValue` / `update:modelValue` 作为默认 `v-model`。新增 `ImageViewerBaseProps` 复用 `locale` / `images` / `open` / `currentIndex` / `maskClosable`，`ImagePreviewProps` 与 `ImageViewerProps` 继续作为两个 public surface 保留；React `ImageViewerProps` 与 Vue `VueImagePreviewProps` / `VueImageViewerProps` 从 core props 派生。RichTextEditor 内置 engine 对非浏览器环境的 `document.execCommand`、`queryCommandState` 与 `window.prompt` 做 no-op guard，避免 Node/SSR import 或命令执行路径抛错。`scripts/validate-api.mjs` 新增 R19 guard（`advanced-media-api`）阻止 core `NumberKeyboardProps.modelValue` 和 viewer `visible` / `defaultIndex` / `onIndexChange` / `update:index` 回流；API baseline、generated Skill references、迁移说明和变更记录已同步更新。

**实际删除 / 合并**：

- `NumberKeyboardProps.modelValue` → core `NumberKeyboardProps.value`；Vue 组件本地 `modelValue` 仅作为 Vue v-model surface。
- `ImagePreviewProps` / `ImageViewerProps` 重复 viewer 字段 → `ImageViewerBaseProps`。
- Viewer 旧命名回流 guard：`visible` / `defaultIndex` / `onIndexChange` / `update:index` → `open` / `currentIndex` / React `onCurrentIndexChange` / Vue `update:currentIndex`。
- RichTextEditor 内置 engine 浏览器命令 → 非浏览器 no-op guard。

**实际保留**：

- `ImagePreview` 与 `ImageViewer` 保留为两个 public component/type surface，因为两者仍代表不同运行时入口与配置范围。
- React editors 继续使用 `value` / `defaultValue` / `onChange`；Vue editors 继续使用框架惯例的 `modelValue` / `update:modelValue`。

**实际验证**：

- `corepack pnpm test:group:advanced`
- `corepack pnpm vitest run tests/core/browser-only-guards.spec.ts`
- `corepack pnpm api:validate`
- `corepack pnpm types:check`
- `corepack pnpm api:baseline`
- `corepack pnpm docs:api`
- `npx -y pnpm@11.9.0 types:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 publish:check`

**状态更新要求**：完成后已写回状态、日期、删除的 Advanced/media API 摘要、SSR/browser guard 验证范围、Skill/examples 更新范围和关键验证命令；阶段 13 已同步为 `已完成（2026-06-30）`。R10-R20 组件级 API 清理已完成，v2.0.0 发布收口仍按维护决定单独执行。

### R21 Grouped validation audit and script tightening

**状态**：已完成（2026-06-30）。

**目标**：审计当前分组测试入口是否能按组件组、框架和过滤器精准执行，补齐轻量自检与后续 Rxx 验证模板，避免后续维护误跑全量或漏跑目标组。

**允许修改**：`scripts/lib/component-test-groups.mjs`、`scripts/run-component-group-tests.mjs`、`scripts/validate-tests.mjs`、`package.json` scripts、`scripts/README.md`、`tests/TEST_QUALITY_GUIDELINES.md`、必要的分组覆盖测试。

**不得修改**：组件运行时行为、public API、Skill references 内容重写、examples 大规模示例改造、发布 workflow。

**执行摘要**：已审计全部 10 个 group 的解析结果，当前文件数量为 `basic 79`、`form 75`、`feedback 29`、`layout 25`、`navigation 39`、`data 19`、`charts 42`、`advanced 38`、`composite 19`、`core 122`。`form/react/primitives` 解析 15 个文件，`form/vue/composite` 解析 20 个文件；`TEST_GROUP=form pnpm test:validate` 只扫描目标组 75 个文件并保留现有 56 个 soft warnings。新增 `tests/core/component-test-groups.spec.ts` 覆盖 group 列表、非空解析、排序去重、core-only 解析、framework narrowing、filter alias、未知参数错误、空 filter 失败和 root package scripts 入口。`scripts/README.md` 与 `tests/TEST_QUALITY_GUIDELINES.md` 已明确 `--framework` 只缩窄 React/Vue component specs 且保留 shared core specs，并记录后续 Rxx 验证模板。

**脚本调整范围**：未修改 runner 语义或 package scripts；现有 `test:group`、`test:group:*` 与 `test:validate` 已满足 R21 目标，本轮只增加自检和文档约束。

**后续验证模板**：

- 组件源码改动运行对应 `pnpm test:group:<group>`，必要时用 `--framework` 或 `--filter` 缩小范围。
- 跨组 helper 改动运行所有受影响 group，并补充 focused `vitest run`。
- 文档或示例改动补充 `docs:api:check`、相关 examples 检查和 changed-file Prettier check。
- 发布面或门禁策略变更升级到 `pnpm quality:release`。

**实际验证**：

- `corepack pnpm test:group -- --group form --list`
- `corepack pnpm test:group:form -- --framework react --filter primitives --list`
- `TEST_GROUP=form corepack pnpm test:validate`
- `corepack pnpm vitest run tests/core/component-test-groups.spec.ts`
- `corepack pnpm prettier --check scripts/README.md tests/TEST_QUALITY_GUIDELINES.md docs/ROADMAP.md docs/V2_COMPLETED.md tests/core/component-test-groups.spec.ts`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/V2_COMPLETED.md scripts/README.md tests/TEST_QUALITY_GUIDELINES.md tests/core/component-test-groups.spec.ts`
- `git diff --check`

**状态更新要求**：已写回 R21 状态、日期、分组审计结论、脚本调整范围、后续验证模板和关键验证命令；阶段 15 已同步为 `已完成（2026-06-30）`，当前可执行任务推进到 R22。R21 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。

### R22 Skill reference compression and routing

**状态**：已完成（2026-06-30）。

**目标**：压缩 Tigercat Skill 文档读取路径，减少默认读取 token；让 LLM 先读取短入口，再通过链接进入准确的组件、props、examples、recipe 或专题文档。删除或迁出对“使用组件库搭建应用”无帮助的维护者内容。

**允许修改**：`skills/tigercat/SKILL.md`、`skills/tigercat/ROADMAP.md` 的保留/迁移策略、`skills/tigercat/references/**` 手写参考、`scripts/generate-api-docs.mjs` 的生成文案、`scripts/validate-api.mjs` 的 Skill token/行数护栏、必要 docs。

**不得修改**：组件运行时行为、public API、测试语义、examples 页面行为；不得手改由 `pnpm docs:api` 生成后会覆盖的 references 内容，除非同步修改生成器。

**执行摘要**：`skills/tigercat/SKILL.md` 已压缩为按任务路由的短入口，只保留建应用、查组件、props/examples、跨框架差异和专题文档路径；维护者发布与 token 参考保留为 maintainer-only。`skills/tigercat/ROADMAP.md` 从详细 backlog 压缩为维护者说明，普通 Skill reference 不再链接它；`references/recipes/building-apps.md` 末尾改为 Scope，不再把建应用路径导向内部 Roadmap。`references/shared/patterns/common.md` 已从长篇示例改为跨框架状态、slot/children、组合组件、浮层和 SSR 的速查页；`references/shared/glossary.md` 删除过时的 compatibility re-export 术语。`scripts/generate-api-docs.mjs` 已让 `shared/api-summary.md` 只保留 Type File / Props Interfaces，删除与 component-index 重复的 Components / Exports 列；`context7.json` 已改为指向实际存在的 `vue/index.md`、`react/index.md` 和 `examples/{category}.md`。

**压缩规模**：

- `skills/tigercat/SKILL.md`：34 行 / 2955 bytes → 18 行 / 1413 bytes。
- `skills/tigercat/ROADMAP.md`：47 行 / 5628 bytes → 11 行 / 929 bytes。
- `references/shared/patterns/common.md`：207 行 / 10291 bytes → 53 行 / 4450 bytes。
- `references/shared/api-summary.md`：18360 bytes → 11995 bytes。
- `skills/tigercat/**/*.md` 汇总：2611 行 / 238648 bytes → 2404 行 / 219316 bytes（PowerShell line count）；`api:validate` 的空行计数当前为 3345 行，预算收紧为 3600 行。

**护栏调整**：`scripts/validate-api.mjs` 已新增或收紧以下 checks：

- `SKILL.md` ≤2600 bytes。
- `skills/tigercat/ROADMAP.md` ≤24 行。
- Skill 全部 markdown ≤3600 行。
- `shared/api-summary.md` ≤14000 bytes。
- 手写 references（含 shared hand references）≤120 行。
- 普通 Skill 入口和 references 不得链接 `ROADMAP.md`。
- `context7.json` 中所有 `skills/tigercat/*` 路径必须存在。

**实际验证**：

- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 prettier --check context7.json scripts/generate-api-docs.mjs scripts/validate-api.mjs skills/tigercat/SKILL.md skills/tigercat/ROADMAP.md skills/tigercat/references/recipes/building-apps.md skills/tigercat/references/shared/glossary.md skills/tigercat/references/shared/patterns/common.md skills/tigercat/references/shared/api-summary.md docs/ROADMAP.md docs/V2_COMPLETED.md`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/V2_COMPLETED.md skills/tigercat scripts context7.json`
- `git diff --check`

**状态更新要求**：已写回 R22 状态、日期、压缩前后读取规模、删除/迁出的 Skill 内容、保留的按需链接结构和关键验证命令；阶段 16 已同步为 `已完成（2026-06-30）`，当前可执行任务推进到 R23。R22 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。

### R23 Example demo consolidation and reproducible code snippets

**状态**：已完成（2026-06-30）。

**目标**：执行 R23 的 Basic/Layout 子批次，让 React/Vue 示例页面的 Code 展示内容与当前 demo 页面保持同步，复制后可复现完整示例页面，并移除局部 Script 片段漂移风险。

**允许修改**：`examples/example/react/src/pages/**`、`examples/example/vue3/src/pages/**`、示例共享说明、必要文档。

**不得修改**：组件 public API、组件运行时行为、发布产物策略、R21 分组 runner 语义、未来实时运行/编辑演示代码组件。

**执行摘要**：Basic/Layout 子批次覆盖 React 与 Vue 共 56 个页面：Button、Icon、Link、Text、Code、Image、ImageCropper、ImageViewer、Avatar、Badge、Tag、Empty、Result、QRCode、Statistic、Rate、Segmented、Watermark、Layout、Grid、Space、Divider、Card、Descriptions、List、Skeleton、Splitter、PrintLayout。所有目标页面新增同页 `?raw` 源码导入，并将 `DemoBlock` 的 `code` 指向该 raw source；原先分散的 `script` tab 已从目标页面移除，避免展示脚本与实际 preview 状态继续漂移。`examples/README.md` 已补充后续维护规则：DemoBlock 展示代码必须来自同页 `?raw` 源码或可验证 fixture。

**代码展示来源策略**：

- Basic/Layout 页面当前采用同页 `?raw` source 作为 Code 标签内容，复制内容会随页面事实源更新。
- 后续如某些页面需要更小的可抽取片段，可改为渲染同一个 fixture 并以 fixture `?raw` 作为 Code 来源。
- 本轮未引入实时运行或在线编辑器；该能力仍属后续计划。

**实际验证**：

- `npx -y pnpm@11.9.0 test:group:basic`
- `npx -y pnpm@11.9.0 test:group:layout`
- `npx -y pnpm@11.9.0 example:build`
- `npx -y pnpm@11.9.0 example:ssr:check`
- `npx -y pnpm@11.9.0 docs:api`
- `npx -y pnpm@11.9.0 docs:api:check`
- `npx -y pnpm@11.9.0 api:validate`
- `npx -y pnpm@11.9.0 prettier --check <changed files>`
- `rg -n "^(<<<<<<<|=======|>>>>>>>)" docs/ROADMAP.md docs/V2_COMPLETED.md examples skills/tigercat`
- `git diff --check`

**状态更新要求**：已写回 R23 状态、日期、Basic/Layout 覆盖范围、代码展示来源策略、可复制复现方式和关键验证命令；阶段 17 已同步为 `已完成（2026-06-30）`，当前可执行任务为 `待追加`。R23 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。

### R24 Example source guard and first merged demo pass

**状态**：已完成（2026-06-30）。

**目标**：在 R23 基础上将 raw-source code 展示策略扩展到所有 React/Vue Example 页面，移除 DemoBlock 的脚本 Tab，并开始合并互不冲突的展示效果。

**允许修改**：`examples/example/react/src/components/DemoBlock.tsx`、`examples/example/vue3/src/components/DemoBlock.vue`、React/Vue example pages、example/source 校验脚本、`package.json` scripts、`examples/README.md`、`scripts/README.md`、路线图归档。

**不得修改**：组件 public API、组件运行时行为、发布产物策略、R21 分组 runner 语义、SSR 示例行为。

**执行摘要**：React/Vue `DemoBlock` 已删除 `script` prop 与脚本 Tab，复制按钮只复制当前 code source。所有带 `DemoBlock` 的 React/Vue 页面均导入同页 `?raw` source，并将 `code` 指向该 raw source；新增 `scripts/validate-example-sources.mjs` 与 `example:sources:check`，校验页面不得传入 `script` 且 `code` 必须来自 `?raw` import，`quality:examples` 已先跑 source check 再跑 example build。Button 与 Input 的 React/Vue 页面已先行合并可共存展示：Button 从 8 个 DemoBlock 合并为 3 个，Input 从 11 个 DemoBlock 合并为 3 个；弹层、图表、高级交互和组合组件的剩余展示合并继续留给 R25-R27。

**实际验证**：

- `npx -y pnpm@11.9.0 example:sources:check`
- `npx -y pnpm@11.9.0 --filter @expcat/tigercat-example-react build`
- `npx -y pnpm@11.9.0 --filter @expcat/tigercat-example-vue3 build`

**状态更新要求**：已写回 R24 状态、日期、全量 raw-source 护栏、Button/Input 展示合并范围和关键验证命令；阶段 18 已同步为 `已完成（2026-06-30）`，当前可执行任务推进到 R25。R24 未修改 public API 或 shared contract，因此 [V2_API_AUDIT.md](V2_API_AUDIT.md) 无需更新。
