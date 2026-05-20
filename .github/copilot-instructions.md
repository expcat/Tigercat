# Tigercat Copilot Instructions

<!-- LLM-INDEX
project: Tigercat UI Library
type: monorepo (pnpm workspace)
frameworks: Vue3, React
styling: Tailwind CSS + CSS Variables
language: TypeScript (strict mode)
packages:
  - @expcat/tigercat-core → packages/core/
  - @expcat/tigercat-vue → packages/vue/
  - @expcat/tigercat-react → packages/react/
-->

Tigercat 是基于 Tailwind CSS 的跨框架 UI 组件库（Vue 3 + React），TypeScript 严格模式，pnpm workspace monorepo。

开始编码、审查或重构任务前，请优先使用 `karpathy-guidelines` skill。
组件 API、Props、代码示例、主题、i18n 等详细文档见 `skills/tigercat/SKILL.md`。

## 项目约定

- 阅读相关源码，理解既有结构和风格后再动手；新增组件参照同类组件（如 `Button`）写法。
- 框架无关逻辑沉到 `@expcat/tigercat-core`；Vue/React 层只做渲染和事件绑定。
- 变更要可交付：代码、导出、类型、测试、文档、Example 同步完成。
- 组件改动联动审查：API / 交互 / 样式变化时，同步检查 skills 文档、测试和 Example。

## 目录速查

| 路径 | 内容 |
|---|---|
| `packages/core/src/types/` | 跨框架共享类型 |
| `packages/core/src/utils/` | 通用工具（kebab-case，如 `class-names.ts`） |
| `packages/core/src/theme/` | 主题 CSS 变量与 helpers |
| `packages/vue/src/components/` | Vue 3 组件（PascalCase `.ts`，非 SFC） |
| `packages/react/src/components/` | React 组件（PascalCase `.tsx`） |
| `packages/*/src/index.ts(x)` | 对外导出 |
| `tests/{core,vue,react}/` | Vitest + Testing Library 测试 |
| `examples/example/` | Vue3 与 React 示例站 |
| `e2e/` | Playwright E2E 与视觉回归测试 |
| `skills/tigercat/` | AI Agent 文档（Props、示例、主题、i18n） |

## 决策指南（代码放哪）

1. 可复用逻辑/样式计算 → `packages/core/src/utils/*`
2. Vue 特有（slots、emits、attrs） → `packages/vue/src/components/*`
3. React 特有（hooks、refs、context） → `packages/react/src/components/*`
4. 父子组合组件 → 父组件文件中统一导出，旧子组件文件保留为 re-export 兼容层

### Charts 架构

纯 SVG 渲染，零第三方依赖。Core 层抽象计算（`types/chart.ts` + `utils/chart-utils.ts`），Vue/React 仅负责渲染。新增 Chart 组件遵循此架构。

## 代码约定

- 遵循 `.prettierrc.json` / `.editorconfig`：单引号、无分号、2 空格、无尾逗号、`bracketSameLine: true`
- import 顺序：外部依赖 → `@expcat/tigercat-core` → 相对路径
- TypeScript 严格模式；禁用 `any`；导出函数写清晰返回类型

### 类型规范

| 场景 | 做法 | 示例 |
|---|---|---|
| 已知类型 | 精确类型 | `variant: 'primary' \| 'secondary'` |
| 边界输入 | `unknown` + 收窄 | `if (typeof x === 'string')` |
| Vue attrs.class | helper | `coerceClassValue(attrs.class)` |
| Vue attrs.style | helper | `mergeStyleValues(attrs.style, props.style)` |
| React props 冲突 | Omit 原生属性 | `Omit<InputHTMLAttributes, 'defaultValue'>` |

### 构建排错

- 优先看 `tsup --dts` / `vue-tsc` 报错点，修根因类型而非压制报错
- demo 引入优先从 `@expcat/tigercat-vue` / `@expcat/tigercat-react` 导入

## 变更完成标准（DoD）

新增组件或显著功能需满足：

1. Core 类型/工具抽出并导出（如 Vue/React 共用）
2. Vue + React 各实现组件文件，在 `index.ts(x)` 导出
3. 补齐单测；复杂组件补 a11y / 边界场景
4. 补齐 `skills/tigercat/references/` 中对应文档
5. 审查 `examples/example/` 示例是否需同步
6. 必要时更新 `docs/ROADMAP.md`、`tests/*CHECKLIST*.md`
7. 按改动范围运行验证；无法运行时说明原因和剩余风险

## 验证

```bash
pnpm lint          # 静态检查
pnpm build         # 构建
pnpm test          # 全量测试（pnpm test:vue / pnpm test:react 分组）
pnpm size          # 包体积
pnpm example:build # Example 变更时
pnpm test:validate # 测试结构变更时
npx playwright test # E2E（需先 pnpm build）
```

- 不声称未运行的检查已通过；列出未运行项和建议补跑命令。

## 维护文档（何时更新）

- 出现新的通用模式、约束、目录结构或测试约定时更新本文件。
- 组件 API 文档写在 `skills/tigercat/references/`，不塞进本文件。
