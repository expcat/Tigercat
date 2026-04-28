# Phase 1B — Core Utils 横切审查 (2026-04)

> 范围：`packages/core/src/utils/`（~125 个 .ts 文件，外加 `helpers/`、`icons/`、`a11y/`、`i18n/`、`styles/` 子目录）

## 1. Tree-shaking 风险 (P0) ★★★

**症状**：`pnpm size:check` 输出包含大量

```
[WARNING] Ignoring this import because "packages/react/dist/chunk-XXX.mjs"
was marked as having no side effects [ignored-bare-import]
```

tsup 把 `Splitter`/`Resizable`/`CodeEditor`/`Kanban` 等组件拆成独立 chunk，但因为 `package.json` 里 `"sideEffects": false`，esbuild 直接**忽略对这些 chunk 的裸 import**。当下游用户从 barrel `import { Resizable } from '@expcat/tigercat-react'` 时，可能丢失运行时初始化（事件监听 / 全局样式注入）。

**优化项**：

- 审计每个 chunk 是否真的无副作用；如果含 `mount` / `addEventListener` / `Symbol.for` 等需在导入时执行的代码，必须在 chunk 文件路径上声明侧效。
- 推荐改为：
  ```jsonc
  // packages/{vue,react}/package.json
  "sideEffects": ["./dist/chunk-*.mjs", "./dist/components/*.mjs"]
  ```
  或更精细列出含副作用的具体组件文件（Message/Notification 全局容器、imperative API）。
- 用户**按需导入**子路径（`@expcat/tigercat-react/Button`）应继续工作，对体积无负面影响。

## 2. Barrel 导出链路过长 (P1)

`packages/core/src/utils/index.ts` 中存在大量 `export *` + 散落的 `export * from './xxx-utils'`，部分模块（如 `helpers/`、`styles/`）已分组，但又在底部又重复导出"补丁"列表（rate-utils、segmented-utils、stepper-utils 等十几个）。

**问题**：

- 编辑器跳转 / IDE 索引慢
- 任何一个 util 改动都触发整个 barrel 重新被 TS 检查
- 造成"backward compatibility 平坦导出"和"分组子模块"双重维护成本

**优化项**：

- 用一次性脚本扫描出**真正在 vue/react 包被引用**的导出符号清单，精简未被使用的 re-export。
- 强制所有新 utils 在 `helpers/` `styles/` 等分类目录下，不再追加根级 `export * from`。
- 文档（README / SKILL）声明：「公开 API 通过分组子路径 `@expcat/tigercat-core/styles` 导入更利于类型推导」。

## 3. 大文件拆分 (P1)

| 文件              | 大小      | 建议                                                                               |
| ----------------- | --------- | ---------------------------------------------------------------------------------- |
| `chart-utils.ts`  | **28 KB** | 拆为 `chart/scale.ts` `chart/axis.ts` `chart/path.ts` `chart/format.ts`            |
| `i18n/locales.ts` | 8.2 KB    | 每个 locale 独立文件 + 按需 import；为下游 tree-shaking 让路                       |
| `chart-shared.ts` | 4.3 KB    | 与 `chart-utils.ts` 一同重组到 `chart/` 目录                                       |
| `common-icons.ts` | 5.1 KB    | 路径常量按使用组件分文件；仅在 `Icon`/`DatePicker`/`TimePicker` 用到的不要全量导出 |

## 4. i18n 子路径导入 (P1)

`utils/i18n/locales.ts` 当前定义了 enUS/zhCN 等多个 locale 对象，全部通过 barrel 进入主入口。下游 `import { Button } from '@expcat/tigercat-vue'` 也会拉到 zhCN 字典数据（即使不用）。

**优化项**：

- 提供 `@expcat/tigercat-core/locales/zh-CN`、`/en-US` 等子路径
- 主入口仅导出**类型**（`TigerLocale`）与 `enUS` 一个默认 locale
- ConfigProvider 使用 lazy 注入

## 5. Icon 体积优化 (P2)

`utils/icons/index.ts` 仅 1 个文件，但 `common-icons.ts` 已经平铺 30+ 个 Path string 常量，且全部通过根 barrel 导出。下游用 `Button` 不需要 `calendarSolidIcon20PathD`。

**优化项**：

- 按"被哪个组件使用"分组到 `icons/datepicker.ts`、`icons/select.ts` 等
- 在 vue/react 组件源码里**直接 import 子路径**，避免走 barrel
- 配合 sideEffects 修复后能让 tree-shaking 真正干掉未用图标

## 6. 重复的 className 拼接模式 (P1)

抽样发现：每个 vue 组件 setup 里都重复

```ts
classNames(baseClasses, sizeClasses[size], disabled && disabledClasses, ..., coerceClassValue(attrs.class))
```

**优化项**：

- 在 core 提供 `composeComponentClasses({ base, size, state, custom })` helper，统一参数顺序与降低重复模板代码
- 给 React 提供同名 helper（无需 `coerceClassValue`，但保持签名一致）

## 7. 类型重复定义 (P1)

`packages/core/src/types/` 与各 component 自己 props 接口经常重复字段（如 `disabled`、`className`、`style`）。Vue 包同时使用 `VueXxxProps` 和 core 的 `XxxProps`，React 用 `XxxProps` 直接 `extends CoreXxxProps`。

**优化项**：

- 在 core 提供 `BaseInteractiveProps`、`BaseFormControlProps`、`BaseLayoutProps` 三个基类
- vue 和 react 的本框架 Props 都从这些基类继承，避免重复

## 8. utils/animation.ts / transition.ts (P2)

两个文件都涉及过渡，命名易混淆。建议合并为 `motion/` 子目录：

```
motion/
  durations.ts   // --tiger-motion-* 的 JS 镜像
  easings.ts     // standard / decelerate / emphasized
  presets.ts    // fade / slide / zoom 预设
  vue.ts        // <Transition> name 工厂
  react.ts      // useEnterLeave hook
```

## 9. helpers/ 子目录细化

`helpers/` 当前包含 class-names、coerce-class-value、env、style-values、copy-text、animation。建议：

- `dom/` (env, copy-text, focus-utils)
- `class/` (classNames, coerce, style-values)
- `motion/` (animation, transition)

## 10. 死代码扫描计划

执行：

```pwsh
pnpm dlx knip --workspace packages/core
pnpm dlx ts-prune -p packages/core/tsconfig.json
```

预期能清出未被任何包消费的旧 helper（v0.4.x 之前的过渡产物）。

## 验证

- 修复 sideEffects 后跑 `pnpm size:check` → 期望 React/Vue full 都能下降 5–10 KB
- `pnpm build` 不允许新警告
- 新分组路径需要在 `packages/core/package.json` 的 `exports` 里追加
