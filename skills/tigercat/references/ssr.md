---
name: tigercat-ssr
description: Tigercat SSR usage and component authoring guidance
---

# SSR 支持

Tigercat 可在 Nuxt 4、Next.js 16 中使用。组件导入走 PascalCase 子路径（`@expcat/tigercat-vue/Button`、`@expcat/tigercat-react/Button`）。实现不得在服务端读浏览器 API。

React 包尚未打 `'use client'`：不要从 Next Server Component 直接 import 组件，放到 `'use client'` 边界里。长期会在产物加 `'use client'` 或 `next` 子路径。

配方：`examples/nextjs`、`examples/nuxt`。`pnpm example:ssr:check` 锁构建 HTML 与 hydrate。

## Tailwind

两站必须接 Tailwind v4 + plugin + `@source` dist。只靠 SVG 能画不等于库接上了。

```css
@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind';
@custom-variant dark (&:where(.dark, .dark *));
@source '../node_modules/@expcat/tigercat-react/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';
```

Next 用 `@tailwindcss/postcss`；Nuxt 用 `@tailwindcss/vite`。Vue 把 react 换成 `tigercat-vue`。`@plugin '.../tailwind/modern'` 与 `theme="modern"` 等价。

## Rules

- 顶层模块不要读 `window`、`document`、`navigator`、`localStorage`、`matchMedia`、DOM 尺寸或 `ResizeObserver`。
- 客户端逻辑放 Vue `onMounted` 或 React `useEffect` / 客户端组件。
- 初始渲染不要依赖客户端尺寸、滚动、媒体查询、当前时间或随机值。
- Portal / overlay 在非浏览器返回稳定占位。浮层：React 原地 layer；Vue Teleport `disabled`。目标链是 overlay-host → ConfigProvider 根 → `document.body`。
- ConfigProvider 放应用根（Next：layout 里一层 client provider，页面不要再包）。`<html lang>` / `dir` 与 locale 对象对齐（本 smoke：`zh-CN` + `zhCN`）。plugin CSS 是首屏 theme；`colorScheme="light"` 与 html 不要 `.dark`。`colorScheme="auto"` 首屏当 light，系统暗色用 cookie / 预置 class。

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
| 全局事件监听   | 客户端注册，卸载时移除                                       |
| Portal/overlay | 非浏览器稳定 layer 占位；`open` 首屏也要有节点               |
| 主题变量读写   | 应用层 ConfigProvider；html 预置同一套值                     |
| 媒体查询/暗色  | `auto` 首屏 light；系统暗色用 cookie / `<html class="dark">` |
| 图表尺寸       | 先给定容器尺寸                                               |

## Framework Checks

| Framework  | 验证命令                                              | 组件入口                        | 客户端逻辑                                               |
| ---------- | ----------------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| Nuxt 4     | `pnpm --filter @expcat/tigercat-example-nuxt build`   | `@expcat/tigercat-vue/Button`   | `onMounted`；示例 `typeCheck: false`，不保证 Vue 类型    |
| Next.js 16 | `pnpm --filter @expcat/tigercat-example-nextjs build` | `@expcat/tigercat-react/Button` | `'use client'` 边界；不要从 Server Component 直接 import |
| Both       | `pnpm example:ssr:check`                              | 子路径                          | 产物 HTML + 主题 CSS + hydrate                           |

## Hydration Risks

| 能力                 | 本 smoke                                         | 建议                                                                   |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| DatePicker           | 关着的输入，`2024-01-15` + `format="yyyy-MM-dd"` | 覆盖输入格式化，不是打开的日历。不传 value 会在 render 里 `new Date()` |
| BarChart             | 定宽高 + `gradient`                              | 稳定 id `tiger-bar-grad-`                                              |
| Button               | primary 文案                                     | 接上 Tailwind 后才是样式证据                                           |
| Modal/Drawer/Tooltip | 不在本 smoke                                     | 关着或放到别的页；不要把未演示的 overlay 写成已覆盖                    |
| Theme                | plugin 默认 light                                | html 与 ConfigProvider 同一套；不要 hydrate 后再加 `.dark`             |

## Component Checklist

- 没有顶层浏览器全局访问。
- 初始 render 输出稳定 markup。
- 事件监听和 observer 有清理逻辑。
- 非浏览器环境有稳定 fallback。
- 日期、id、可见文案和图表 gradient id 可复现。
- SSR 行为有单测或通过 `pnpm example:ssr:check` 验证。
