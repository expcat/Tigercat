# Tigercat Agent 指南

<!-- LLM-INDEX
project: Tigercat UI Library
type: monorepo (pnpm workspace)
frameworks: Vue3, React
styling: Tailwind CSS + CSS Variables
language: TypeScript strict mode
packages: core, vue, react, cli
-->

本文件是适用于所有编码代理的通用约束入口。Tigercat 是基于 Tailwind CSS 的跨框架 UI 组件库（Vue 3 + React），采用 pnpm workspace monorepo。

开始编码、审查或重构前，优先使用 `karpathy-guidelines` skill。组件 API、Props、示例、主题、i18n、术语表见 `skills/tigercat/SKILL.md`。

## 核心规则

- 先读相关源码、测试和文档，再动手；新增组件参照现有同类组件。
- 框架无关类型、计算、格式化和样式逻辑放到 `packages/core/`；Vue/React 层只负责渲染、事件、slots/children、refs/attrs/props 绑定。
- 组件 API、交互或样式变化时，同步检查导出、测试、Example 和 `skills/tigercat/references/` 文档。
- 不做无关重构；不覆盖或回退用户已有修改。

## 修改位置

| 路径 | 用途 |
| --- | --- |
| `packages/core/src/types/` | 跨框架共享类型 |
| `packages/core/src/utils/` | 通用工具，文件名 kebab-case |
| `packages/core/src/theme/` | 主题 CSS 变量与 helpers |
| `packages/vue/src/components/` | Vue 3 组件，PascalCase `.ts` |
| `packages/react/src/components/` | React 组件，PascalCase `.tsx` |
| `packages/*/src/index.ts(x)` | 对外导出 |
| `tests/{core,vue,react}/` | Vitest + Testing Library 测试 |
| `examples/example/` | Vue 3 与 React 示例站 |
| `skills/tigercat/` | 通用 Agent 文档、Props、示例、主题与 i18n |

父子组合组件优先在父组件文件中统一导出；旧子组件文件只保留 re-export 兼容层。

## 代码风格

- 遵循 `.prettierrc.json` / `.editorconfig`：单引号、无分号、2 空格、无尾逗号、`bracketSameLine: true`。
- import 顺序：外部依赖 -> `@expcat/tigercat-core` -> 相对路径。
- TypeScript 严格模式；源码禁用 `any`；导出函数写清晰返回类型。
- React 原生属性冲突用 `Omit<...>`；Vue `attrs.class/style` 使用既有 helper 合并。
- 浏览器 API 访问前使用 `isBrowser()` 或等价 SSR 守卫。

## 完成交付

新增组件或显著功能需按范围同步完成：Core 类型/工具及导出、Vue 与 React 实现及入口导出、正常/a11y/边界测试、复杂交互的 E2E 或视觉回归、`skills/tigercat/references/` 文档与必要 Example，以及受影响的 roadmap、测试清单或 API 文档。

按改动范围选择验证：

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

不要声称未运行的检查已经通过；构建排错优先定位 `tsup --dts` / `vue-tsc` 的根因。
