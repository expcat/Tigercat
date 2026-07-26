# Tigercat Agent 指南

<!-- LLM-INDEX
project: Tigercat UI Library
type: monorepo (pnpm workspace)
frameworks: Vue3, React
styling: Tailwind CSS + CSS Variables
language: TypeScript strict mode
packages: core, vue, react, cli, mcp
-->

本文件是适用于所有编码代理的通用约束入口。Tigercat 是基于 Tailwind CSS 的跨框架 UI 组件库（Vue 3 + React），采用 pnpm workspace monorepo。

组件 API、Props、示例、主题、i18n、术语表见 `skills/tigercat/SKILL.md`。架构约束与根因修复要求见 `CONTRIBUTING.md`「根因修复与架构约束」。

## 核心规则

- 先读相关源码、测试和文档，再动手；新增组件参照现有同类组件。
- 框架无关类型、计算、格式化和样式逻辑放到 `packages/core/`；Vue/React 层只负责渲染、事件、slots/children、refs/attrs/props 绑定。
- 组件 API、交互或样式变化时，同步检查导出、测试、Example 和 `skills/tigercat/references/` 文档。
- 不做无关重构；不覆盖或回退用户已有修改。

## 修改位置

| 路径                               | 用途                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `packages/core/src/types/`         | 跨框架共享类型                                                             |
| `packages/core/src/utils/`         | 通用工具，文件名 kebab-case                                                |
| `packages/core/src/theme-runtime/` | 主题 CSS 变量与 helpers（`themes/` 是命名预设，`tokens/` 是 token 生成物） |
| `packages/vue/src/components/`     | Vue 3 组件，PascalCase `.ts`                                               |
| `packages/react/src/components/`   | React 组件，PascalCase `.tsx`                                              |
| `packages/cli/src/`                | 脚手架 CLI；自带 `utils/`，不得导入 `scripts/utils/*`                      |
| `packages/mcp/src/`                | 只读 stdio MCP 服务，只路由 Skill references                               |
| `packages/*/src/index.ts(x)`       | 对外导出                                                                   |
| `tests/{core,vue,react,mcp}/`      | Vitest + Testing Library 测试                                              |
| `examples/example/`                | Vue 3 与 React 示例站                                                      |
| `skills/tigercat/`                 | 通用 Agent 文档、Props、示例、主题与 i18n                                  |

父子组合组件优先在父组件文件中统一导出；旧子组件文件只保留 re-export 兼容层。

### 生成物：只能重跑生成器，不得手改

| 生成物                                                                                                                                         | 生成命令            | 漂移闸                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------- |
| `skills/tigercat/references/{component-index.md,examples/*,shared/props/*,shared/api-summary.md,vue/index.md,react/index.md}`、`context7.json` | `pnpm docs:api`     | `pnpm docs:api:check`     |
| `api-reports/*`                                                                                                                                | `pnpm api:baseline` | `pnpm api:baseline:check` |
| `packages/*/package.json` 的 `exports`                                                                                                         | `pnpm exports:sync` | `pnpm exports:check`      |
| `packages/core/src/tokens/*`                                                                                                                   | `pnpm tokens:build` | `pnpm tokens:check`       |

组件路由事实源是 `scripts/lib/public-components.mjs`；改公开组件先改事实源再重跑生成器。
`skills/tigercat/references/` 下其余手写文档受 `pnpm api:validate` 的行数与体积预算约束。

### 文档分层：一件事只在一处展开

| 文档                | 拥有的内容                                         |
| ------------------- | -------------------------------------------------- |
| `README.md`         | 用户入口：安装、快速开始、兼容性、包清单           |
| `AGENTS.md`         | 代理约束：目录职责、代码风格、交付清单、生成物边界 |
| `CONTRIBUTING.md`   | 流程与架构约束：分支、PR、根因修复与架构约束       |
| `tests/README.md`   | 测试约定、执行模型与「按改动范围验证」命令表       |
| `scripts/README.md` | 脚本与门禁命令清单                                 |
| `docs/ROADMAP.md`   | 当前可执行任务与任务登记规则（不存完成历史）       |
| `docs/MIGRATION.md` | breaking change 与迁移路径                         |
| `CHANGELOG.md`      | 版本变更与完成历史                                 |
| `skills/tigercat/`  | 组件 API、Props、示例、主题、i18n                  |

其他文档引用这些内容时只放链接，不复制正文。

## 代码风格

- 遵循 `.prettierrc.json` / `.editorconfig`：单引号、无分号、2 空格、无尾逗号、`bracketSameLine: true`。`pnpm format:check` 已进 `quality:static`，提交前跑 `pnpm format`。
- 生成器写出的文件也必须过 prettier，且要复用 `.prettierrc.json`（`resolveConfig`）而不是手写配置子集，否则产物会与 `format:check` 永久互相打架。
- import 顺序：外部依赖 -> `@expcat/tigercat-core` -> 相对路径。
- TypeScript 严格模式；源码禁用 `any`；导出函数写清晰返回类型。
- React 原生属性冲突用 `Omit<...>`；Vue `attrs.class/style` 使用既有 helper 合并。
- 浏览器 API 访问前使用 `isBrowser()` 或等价 SSR 守卫。

## 完成交付

新增组件或显著功能需按范围同步完成：Core 类型/工具及导出、Vue 与 React 实现及入口导出、正常/a11y/边界测试、复杂交互的 E2E、有用户可见文案时的 i18n label、`skills/tigercat/references/` 文档与必要 Example，以及受影响的 roadmap、测试清单或 API 文档。E2E 只做功能断言，不新增图片对比基线。

按改动范围选择验证命令见 [tests/README.md](tests/README.md)「按改动范围验证」；命令与脚本清单见 [scripts/README.md](scripts/README.md)。

不要声称未运行的检查已经通过；构建排错优先定位 `tsup --dts` / `vue-tsc` 的根因。
