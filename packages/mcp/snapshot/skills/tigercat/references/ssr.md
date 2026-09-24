---
name: tigercat-ssr
description: Tigercat SSR usage and component authoring guidance
---

# SSR 支持

Tigercat 可在 Nuxt 4、Next.js 16 中使用。组件导入走 PascalCase 子路径。实现不得在服务端读浏览器 API。
通用安装 / Tailwind plugin 见 [getting-started.md](getting-started.md)。

React 包尚未打 `'use client'`：不要从 Next Server Component 直接 import 组件，放到 `'use client'` 边界里。
配方：`examples/nextjs`、`examples/nuxt`。`pnpm example:ssr:check` 锁构建 HTML 与 hydrate。

## Tailwind（SSR）

两站必须在 generic plugin 之外扫描 dist。只靠 SVG 能画不等于库接上了。

```css
@custom-variant dark (&:where(.dark, .dark *));
@source '../node_modules/@expcat/tigercat-react/dist';
@source '../node_modules/@expcat/tigercat-core/dist';
```

Next 用 `@tailwindcss/postcss`；Nuxt 用 `@tailwindcss/vite`。Vue 把 react 换成 `tigercat-vue`。
路径相对 CSS 文件。pnpm workspace 里若扫描不跟随 `node_modules` 符号链接，改为指向真实 `dist`（本仓库 Next 示例扫 `packages/*/dist`）。

## Rules

- 顶层模块不要读 `window`、`document`、`navigator`、`localStorage`、`matchMedia`、DOM 尺寸或 `ResizeObserver`。
- 客户端逻辑放 Vue `onMounted` 或 React `useEffect` / 客户端组件。
- 初始渲染不要依赖客户端尺寸、滚动、媒体查询、当前时间或随机值。
- Portal / overlay 在非浏览器返回稳定占位。浮层：React 原地 layer；Vue Teleport `disabled`。目标链是 overlay-host → ConfigProvider 根 → `document.body`。
- ConfigProvider 放应用根（Next：layout 里一层 client provider）。`<html lang>` / `dir` 与 locale 对齐。plugin CSS 是首屏 theme；`colorScheme="auto"` 首屏当 light，系统暗色用 cookie / 预置 class。

## Browser Guard

```ts
import { isBrowser } from '@expcat/tigercat-core'

if (isBrowser()) {
  document.documentElement.classList.toggle('dark', true)
}
```

| 场景           | 做法                                                         |
| -------------- | ------------------------------------------------------------ |
| DOM 查询/尺寸  | Vue `onMounted` / React `useEffect` 后读取                   |
| Portal/overlay | 非浏览器稳定 layer 占位；`open` 首屏也要有节点               |
| 媒体查询/暗色  | `auto` 首屏 light；系统暗色用 cookie / `<html class="dark">` |
| 图表尺寸       | 先给定容器尺寸                                               |

## Framework Checks

| Framework  | 验证命令                                              | 客户端逻辑                                               |
| ---------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Nuxt 4     | `pnpm --filter @expcat/tigercat-example-nuxt build`   | `onMounted`；示例 `typeCheck: false`                     |
| Next.js 16 | `pnpm --filter @expcat/tigercat-example-nextjs build` | `'use client'` 边界；不要从 Server Component 直接 import |
| Both       | `pnpm example:ssr:check`                              | 产物 HTML + 主题 CSS + hydrate                           |

## Hydration Risks

| 能力                 | 本 smoke                                         | 建议                                                       |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| DatePicker           | 关着的输入，`2024-01-15` + `format="yyyy-MM-dd"` | 覆盖输入格式化，不是打开的日历。不传 value 会 `new Date()` |
| Modal/Drawer/Tooltip | 不在本 smoke                                     | 不要把未演示的 overlay 写成已覆盖                          |

日期、id、可见文案和图表 gradient id 必须可复现。SSR 行为用单测或 `pnpm example:ssr:check` 验证。

Next: [getting-started.md](getting-started.md) · [theme.md](theme.md)
