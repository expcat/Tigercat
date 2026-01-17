# GitHub Copilot Instructions for Tigercat

<!-- LLM-INDEX
project: Tigercat UI Library
type: monorepo (pnpm workspace)
frameworks: Vue3, React
styling: Tailwind CSS + CSS Variables
language: TypeScript (strict mode)
packages:
  - @expcat/tigercat-core → packages/core/ (shared utils/types/theme)
  - @expcat/tigercat-vue → packages/vue/ (Vue 3 components, .ts files)
  - @expcat/tigercat-react → packages/react/ (React components, .tsx files)
key-files:
  - packages/*/src/index.ts(x) → public exports
  - docs/components-vue.md → Vue API reference
  - docs/components-react.md → React API reference
  - docs/theme.md → theming guide
-->

Tigercat 是一个基于 Tailwind CSS 的 UI 组件库，同时提供 Vue 3 与 React 实现。仓库是 TypeScript 严格模式 + pnpm workspace 的 monorepo。

## 任务快查（按任务类型）

| 任务类型         | 关键步骤                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **新增组件**     | 1) 参照 `Button` 写法 2) core 抽共享类型/utils 3) vue + react 各实现 4) 导出到 index 5) 补测试 6) 更新 docs |
| **修改现有组件** | 1) 先读源码理解 2) 改 core 或 vue/react 3) 同步另一框架(如适用) 4) 更新测试                                 |
| **修复类型错误** | 1) 定位根因(tsup/vue-tsc 报错) 2) 优先改类型定义 3) 不用 `any`                                              |
| **添加测试**     | 1) 参照同类组件测试 2) Vue: `tests/vue/` React: `tests/react/` 3) 用 Testing Library                        |
| **更新文档**     | 1) API 变更 → `docs/components-*.md` 2) 新模式/约定 → 本文件                                                |

## 工作方式（高信噪比规则）

- 先找现有模式再动手：优先对照同类组件（例如 `Button`/`Input`）的写法，保持风格一致。
- 解决根因：避免“表面补丁”；尽量把框架无关逻辑沉到 `@expcat/tigercat-core`。
- 变更要可交付：不要只写计划；如果要动代码，就同时补齐导出、类型、测试与文档（见下方 DoD）。
- 避免无关重构：不做大范围格式化、不改公共 API 命名、不“顺手修一堆”。

## 本次经验（类型与构建）

### 类型规范

| 场景             | 做法                | 示例                                         |
| ---------------- | ------------------- | -------------------------------------------- |
| 已知类型         | 用精确类型          | `variant: 'primary' \| 'secondary'`          |
| 边界输入         | 用 `unknown` + 收窄 | `if (typeof x === 'string')`                 |
| Vue attrs.class  | 用 helper           | `coerceClassValue(attrs.class)`              |
| Vue attrs.style  | 用 helper           | `mergeStyleValues(attrs.style, props.style)` |
| Vue h() children | 最小断言            | `type HChildren = Parameters<typeof h>[2]`   |
| React props 冲突 | Omit 原生属性       | `Omit<InputHTMLAttributes, 'defaultValue'>`  |

### 构建排错

- 先复现再定位：优先看 `tsup --dts` / `vue-tsc` 报错点，修"根因类型"而不是压制报错
- 截断日志别吞退出码：`set -o pipefail && pnpm build 2>&1 | tail -n 200`
- demo 类型要正确：Vue 模板自动解包 `ref`，事件参数传 index/值，不强依赖 `Ref<T>`
- demo 引入层级清晰：优先从 `@expcat/tigercat-vue` / `@expcat/tigercat-react` 引类型与组件

### 代码风格速记

- 字符串用单引号 `'`，不写分号，缩进 2 空格
- 多行对象/数组不加尾随逗号
- JSX 多行属性 `>` 与最后属性同行 (`bracketSameLine: true`)
- import 顺序：外部依赖 → `@expcat/tigercat-core` → 相对路径

## 目录速查（改哪里）

- `packages/core/`：框架无关的 types/utils/theme（改这里会影响 Vue + React）
  - `packages/core/src/utils/`：通用工具与样式计算（文件多为 kebab-case，如 `class-names.ts`）
  - `packages/core/src/types/`：跨框架共享的 Props / 类型
  - `packages/core/src/theme/`：主题 CSS 变量与 theme helpers
- `packages/vue/`：Vue 3 组件实现（当前仓库的 Vue 组件是 `.ts` 模块，不是 `.vue` SFC）
  - `packages/vue/src/components/`：组件（PascalCase 文件名，例如 `Button.ts`）
  - `packages/vue/src/index.ts`：对外导出
- `packages/react/`：React 组件实现
  - `packages/react/src/components/`：组件（PascalCase 文件名，例如 `Button.tsx`）
  - `packages/react/src/index.tsx`：对外导出（组件 + `type` 导出）
- `docs/components-vue.md`：Vue 组件总览（简要）
- `docs/components-react.md`：React 组件总览（简要）
- `tests/`：Vitest + Testing Library 测试（Vue/React 分目录）

## 决策指南（快速判断放哪）

1. 逻辑/样式计算可复用（校验、格式化、variant class 生成、主题变量）→ 放 `packages/core/src/utils/*`

2. 仅 Vue 特有（slots、emits、attrs 透传、Vue 指令行为）→ 放 `packages/vue/src/components/*`

3. 仅 React 特有（hooks、refs、context、受控/非受控）→ 放 `packages/react/src/components/*`

## 变更完成标准（Definition of Done）

对“新增组件”或“显著功能”默认满足：

1. `@expcat/tigercat-core`：必要的类型/工具被抽出并导出（如果 Vue/React 都会用到）
2. Vue：新增/修改组件文件，并在 `packages/vue/src/index.ts` 导出
3. React：新增/修改组件文件，并在 `packages/react/src/index.tsx` 导出（需要时同时导出 `type Props`）
4. Tests：至少补齐对应框架的单测；复杂组件补充 a11y/边界场景
5. Docs：在 `docs/components-vue.md` 与 `docs/components-react.md` 补齐简要描述与分组
6. 进度文件：必要时更新 `ROADMAP.md`、测试清单（见 `tests/*CHECKLIST*.md`）

## 代码约定

### 格式化

- 遵循 `.prettierrc.json` 与 `.editorconfig`（见上方"代码风格速记"）
- 只改与任务相关的代码，不做大范围格式化

### TypeScript

- 严格模式；避免 `any`；优先精确类型（见上方"类型规范"表）
- 导出的公共函数/类型尽量写清晰的返回类型

### 组件 API 约定

- Vue：事件用 kebab-case（例如 `emits: ['click']`，文档也用 kebab-case）。
- React：事件 prop 用 camelCase（例如 `onClick`）。
- 透传属性：
  - Vue：使用 `attrs` 并谨慎处理 `class` 合并；必要时显式转发 `onClick` 等（参照现有 `Button.ts`）。
  - React：通过 `{...props}` 透传，同时保留 `className` 合并。

### 文件命名

- Core utils：kebab-case（例如 `class-names.ts`、`button-utils.ts`）
- Vue components：PascalCase + `.ts`（例如 `Button.ts`）
- React components：PascalCase + `.tsx`（例如 `Button.tsx`）
- Docs：kebab-case（例如 `components-vue.md`）

## Styling / Theme（必须支持主题）

- Tailwind 优先；颜色相关必须用 CSS 变量并带 fallback。
- 推荐写法：`bg-[var(--tiger-primary,#2563eb)]`、`hover:bg-[var(--tiger-primary-hover,#1d4ed8)]`。
- Theme helpers（来自 `@expcat/tigercat-core`）：`THEME_CSS_VARS`、`setThemeColors`、`getThemeColor`。

## Testing（默认要求）

- 测试工具：Vitest + Testing Library。
- React：优先 `userEvent`，少用 `fireEvent`。
- Vue：使用 `tests/utils/render-helpers.ts` 相关 helpers。
- 复杂组件：补 a11y（`tests/utils/a11y-helpers.ts`）与边界场景（空态、禁用、极值、键盘交互）。

## 常用命令

```bash
pnpm install
pnpm build
pnpm dev
pnpm lint
pnpm clean
```

## 模板（与仓库实现一致）

### Vue 组件骨架（`.ts`，defineComponent + render）

```ts
import { defineComponent, h, computed, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'

export const MyComponent = defineComponent({
  name: 'TigerMyComponent',
  props: {
    variant: {
      type: String as PropType<'primary' | 'secondary'>,
      default: 'primary'
    }
  },
  emits: ['change'],
  setup(props, { emit, slots, attrs }) {
    const classes = computed(() => classNames('...', coerceClassValue(attrs.class)))
    return () => h('div', { class: classes.value }, slots.default?.())
  }
})

export default MyComponent
```

### React 组件骨架（`.tsx`，FC）

```tsx
import React, { useMemo } from 'react'
import { classNames } from '@expcat/tigercat-core'

export interface MyComponentProps {
  variant?: 'primary' | 'secondary'
  className?: string
  children?: React.ReactNode
}

export const MyComponent: React.FC<MyComponentProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  const classes = useMemo(
    () => classNames('...', variant === 'primary' && '...', className),
    [variant, className]
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
```

## 维护文档（何时更新）

- 只有当出现“新的通用模式/约束/目录结构/测试约定”时才更新本文件。
- 组件的简要说明与分组应写在 `docs/components-vue.md` 与 `docs/components-react.md`，不要把实现细节塞进本文件。
