# Tigercat Copilot Instructions

<!-- LLM-INDEX
project: Tigercat UI Library
type: monorepo (pnpm workspace)
frameworks: Vue3, React
styling: Tailwind CSS + CSS Variables
language: TypeScript strict mode
packages: core, vue, react, cli
-->

Tigercat 是基于 Tailwind CSS 的跨框架 UI 组件库（Vue 3 + React），pnpm workspace monorepo。

开始编码、审查或重构前，优先使用 `karpathy-guidelines` skill。组件 API、Props、示例、主题、i18n、术语表见 `skills/tigercat/SKILL.md`。

## Core Rules

- 先读相关源码、测试和文档，再动手；新增组件参照同类组件（如 `Button`）。
- 框架无关类型、计算、格式化和样式逻辑放到 `packages/core/`；Vue/React 层只做渲染、事件、slots/children、refs/attrs/props 绑定。
- 组件 API / 交互 / 样式变化时，同步检查导出、测试、Example、`skills/tigercat/references/` 文档。
- 不做无关重构；不回退用户已有修改。

## Where To Edit

| Path                             | Purpose                             |
| -------------------------------- | ----------------------------------- |
| `packages/core/src/types/`       | 跨框架共享类型                      |
| `packages/core/src/utils/`       | 通用工具，文件名 kebab-case         |
| `packages/core/src/theme/`       | 主题 CSS 变量与 helpers             |
| `packages/vue/src/components/`   | Vue 3 组件，PascalCase `.ts`        |
| `packages/react/src/components/` | React 组件，PascalCase `.tsx`       |
| `packages/*/src/index.ts(x)`     | 对外导出                            |
| `tests/{core,vue,react}/`        | Vitest + Testing Library 测试       |
| `examples/example/`              | Vue3 与 React 示例站                |
| `skills/tigercat/`               | Agent 文档、Props、示例、主题、i18n |

父子组合组件优先在父组件文件中统一导出；旧子组件文件只保留 re-export 兼容层。

## Code Style

- 遵循 `.prettierrc.json` / `.editorconfig`：单引号、无分号、2 空格、无尾逗号、`bracketSameLine: true`。
- import 顺序：外部依赖 → `@expcat/tigercat-core` → 相对路径。
- TypeScript 严格模式；源码禁用 `any`；导出函数写清晰返回类型。
- React 原生属性冲突用 `Omit<...>`；Vue `attrs.class/style` 使用既有 helper 合并。
- 浏览器 API 访问前使用 `isBrowser()` 或等价 SSR 守卫。

## Done Means

新增组件或显著功能需同步完成：

1. Core 类型/工具抽出并导出（如 Vue/React 共用）。
2. Vue + React 实现和包入口导出。
3. 单测覆盖正常、a11y、边界场景；复杂交互补 E2E 或视觉回归。
4. `skills/tigercat/references/` 对应文档和必要 Example。
5. 必要时更新 `docs/ROADMAP.md`、测试清单或 API 文档。

## Validation

```bash
pnpm lint
pnpm build
pnpm test
pnpm test:vue
pnpm test:react
pnpm test:validate
pnpm size
pnpm example:build
npx playwright test
```

按改动范围选择验证；不要声称未运行的检查已通过。构建排错优先看 `tsup --dts` / `vue-tsc` 报错根因。
