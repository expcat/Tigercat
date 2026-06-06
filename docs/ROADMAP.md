# Tigercat 路线图

<!-- LLM-INDEX
type: active-roadmap
scope: pending development roadmap only
verified-date: 2026-05-26
source: current repository audit and planning
-->

本文只记录仍需推进的任务和长期守护规则。已经完成的阶段、组件和发布准备事项不再保留在 Roadmap 中，回溯以 [CHANGELOG.md](../CHANGELOG.md)、发布记录和对应文档为准。

## 文档职责边界

- Roadmap 只记录当前待办、持续守护项和短期发布状态。
- [CHANGELOG.md](../CHANGELOG.md) 记录已交付且影响用户、贡献者或发布流程的变更。
- [scripts/README.md](../scripts/README.md) 维护命令入口和脚本职责。
- 组件 API、示例、主题、i18n、SSR 和发布流程以 `skills/tigercat/references/` 为准。

## 当前基线

| 项目     | 状态                                                             |
| -------- | ---------------------------------------------------------------- |
| 组件库   | Vue 3 + React 双端组件库，核心逻辑沉淀在 `@expcat/tigercat-core` |
| 包管理   | pnpm workspace，统一 catalog 管理核心工具链版本                  |
| 样式体系 | Tailwind CSS v4 + CSS Variables + Tigercat Tailwind plugin       |
| 发布版本 | v1.2.16 发布准备中                                               |
| 质量门禁 | Vitest、Playwright、a11y、size-limit、API/test validate          |

## 当前待办

- [ ] v1.2.16 发布执行：运行 `pnpm quality:release`、`pnpm build`，发布后执行 `pnpm smoke:published`。
- [ ] 发布后归档：确认 `CHANGELOG.md`、迁移指南、发布记录和 Roadmap 状态与实际发布结果一致。

## 持续守护

### Tailwind v4

- workspace catalog、CLI 模板版本、core peer dependency 和 example 依赖继续保持 Tailwind v4 对齐。
- 示例与 CLI 模板继续使用 `@tailwindcss/vite` + CSS `@plugin "@expcat/tigercat-core/tailwind/modern"` 接入。
- core package 必须继续暴露 `./tailwind`、`./tailwind/modern`、`./tokens.css` 和 `./figma-variables.json`。
- Tailwind 相关改动需覆盖 doctor、CLI 模板、example build 和必要 package build。

### 发布门禁

- 公共 API 冻结检查使用 `pnpm release:check`、`pnpm types:check` 和 `pnpm api:validate`。
- SSR 与 hydration 矩阵使用 `pnpm quality:ssr` 覆盖 Nuxt 与 Next.js。
- 主题与 token 变更后运行 `pnpm tokens:build`，并确认生成物只包含预期变化。
- Breaking change 必须同步到 [docs/MIGRATION.md](MIGRATION.md) 和 [CHANGELOG.md](../CHANGELOG.md)。

### 组件 Definition of Done

新增或显著修改组件默认满足：

1. `packages/core/src/types/` 定义共享 Props 类型。
2. `packages/core/src/utils/` 抽取框架无关逻辑。
3. `packages/vue/src/components/` 与 `packages/react/src/components/` 双端实现。
4. `packages/*/src/index.*` 与必要子路径完成导出。
5. 测试覆盖正常路径、边界条件、a11y、键盘交互和 SSR 守卫。
6. `skills/tigercat/references/` 与 Example 同步 API 文档和使用场景。
7. 涉及文案时接入 i18n；涉及动画时响应 `prefers-reduced-motion`。

## 验证策略

按改动范围选择最小验证集：

| 改动类型                   | 推荐验证                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Roadmap / docs only        | `pnpm exec prettier --check docs/ROADMAP.md`                                   |
| CLI 模板 / Tailwind v4     | CLI 模板单测、`pnpm --filter @expcat/tigercat-cli build`、`pnpm example:build` |
| core 工具 / token / plugin | `pnpm --filter @expcat/tigercat-core build`、`pnpm test:core`                  |
| Vue/React 组件             | 对应组件单测、`pnpm test:vue` / `pnpm test:react` 的窄范围                     |
| 复杂交互或移动端           | 相关 Playwright spec，必要时补视觉回归                                         |
| 发布链路                   | `pnpm quality:release`、`pnpm build`、发布后 smoke                             |
