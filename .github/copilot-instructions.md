# GitHub Copilot Instructions for Tigercat

<!--
STRUCTURE NAVIGATION TAGS:
#core-utilities #vue-components #react-components #types #theme #testing #documentation #examples
-->

Tigercat 是一个基于 Tailwind CSS 的 UI 组件库，同时提供 Vue 3 与 React 实现。仓库是 TypeScript 严格模式 + pnpm workspace 的 monorepo。

## 工作方式（高信噪比规则）

- 先找现有模式再动手：优先对照同类组件（例如 `Button`/`Input`）的写法，保持风格一致。
- 解决根因：避免“表面补丁”；尽量把框架无关逻辑沉到 `@expcat/tigercat-core`。
- 变更要可交付：不要只写计划；如果要动代码，就同时补齐导出、类型、测试与文档（见下方 DoD）。
- 避免无关重构：不做大范围格式化、不改公共 API 命名、不“顺手修一堆”。

## 本次经验（精简版）

### 尽量不使用 any

- 优先用精确类型：能写具体类型就不要用 `unknown`。
- 仅在“边界输入确实未知”时用 `unknown`（例如 `attrs`、第三方回调、JSON/网络响应），并立刻收窄后再使用（类型守卫 / `typeof` / `in` / `Array.isArray`）。
- 不要在组件里散落断言：把可复用的收窄/合并逻辑下沉到 `@expcat/tigercat-core`。
- Vue attrs 常是 `unknown`：`class` 用 `coerceClassValue(attrs.class)`；`style` 用 `mergeStyleValues(attrs.style, props.style)`。
- Vue `h()` children 类型不稳时：优先用 `type HChildren = Parameters<typeof h>[2]` 做最小断言，不要 `as any`。
- React props 冲突（如 `defaultValue/title/autoComplete`）：用 `Omit<...>` 去掉原生属性再自定义，避免 DTS 冲突。

### 构建与排错

- 先复现再定位：优先看 `tsup --dts` / `vue-tsc` 报错点，修“根因类型”而不是压制报错。
- 截断日志别吞退出码：用 `set -o pipefail && pnpm build 2>&1 | tail -n 200`。
- demo 也要类型正确：Vue 模板会自动解包 `ref`，事件参数尽量传 index/值，不要让函数参数强依赖 `Ref<T>`。
- demo 依赖层级要清晰：优先从 `@expcat/tigercat-vue` / `@expcat/tigercat-react` 引类型与组件，避免 demo 直接绑死 core 内部实现。

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
- `docs/components/`：组件文档（kebab-case，例如 `button.md`）
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
5. Docs：在 `docs/components/*.md` 补齐 API、示例、a11y 说明与主题定制说明
6. 进度文件：必要时更新 `ROADMAP.md`、测试清单（见 `tests/*CHECKLIST*.md`）

## 代码约定

### 格式化（避免来回改格式）

- 以 Prettier 为唯一格式化来源：遵循仓库根目录 `.prettierrc.json` 与 `.editorconfig`。
- 统一规则（生成/修改代码时默认按此输出）：
  - 单引号：`'`（字符串、import 等）
  - 不写分号
  - 多行对象/数组/参数列表：不加尾随逗号
  - 缩进 2 空格；保持必要空格（例如 `{ a: 1 }`）
  - JSX/TSX 多行属性：`>` 与最后一个属性同一行（`bracketSameLine: true`）
- 不要为了“看起来更整齐”手动做大范围格式化；只改与任务相关的代码。

### TypeScript

- 严格模式；避免 `any`；优先精确类型。仅在边界/未知输入用 `unknown`，并先收窄再用。
- 导出的公共函数/类型尽量写清晰的返回类型。
- TS/TSX 不写分号；遵循 `.prettierrc.json`。
- `import` 顺序：外部依赖 → 内部包（`@expcat/tigercat-core`）→ 相对路径。

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
- Docs：kebab-case（例如 `button.md`）

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
- 组件的具体 API 与示例应写在 `docs/components/*.md`，不要把实现细节塞进本文件。
