---
name: tigercat-ssr
description: Tigercat SSR usage and component authoring guidance
---

# SSR 支持

Tigercat 可在 Nuxt、Next.js 等 SSR 框架中通过正常包入口使用：`@expcat/tigercat-vue`、`@expcat/tigercat-react`。组件实现和共享工具不得在服务端渲染阶段直接读取浏览器 API。

## Rules

- 顶层模块代码不要读取 `window`、`document`、`navigator`、`localStorage`、`matchMedia`、DOM 尺寸或 `ResizeObserver`。
- 客户端专属逻辑放进 Vue `onMounted` 或 React `useEffect` / 客户端组件。
- 初始渲染不要依赖客户端尺寸、滚动位置、媒体查询、当前时间或随机值。
- Portal、overlay、拖拽、复制、上传等能力在非浏览器环境返回稳定占位或跳过挂载。
- 主题 CSS 变量可静态注入；运行时主题读写只在客户端执行。要把 ConfigProvider 的 `theme` / `dir` / `lang` 写进首屏 HTML，在 `<html>` 上预置**同一套**值（`lang`、`dir`、`class="dark"`、`data-tiger-style="modern"`）。`colorScheme="auto"` 首屏当 light，不要等 hydrate 再闪 `.dark`；系统暗色请用 cookie / 预置 class。

## Browser Guard

```ts
import { isBrowser } from '@expcat/tigercat-core'

if (isBrowser()) {
  document.documentElement.classList.toggle('dark', true)
}
```

| 场景           | 做法                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| DOM 查询/尺寸  | Vue `onMounted` / React `useEffect` 后读取                                                |
| 全局事件监听   | 客户端注册，卸载时移除                                                                    |
| Portal/overlay | 非浏览器环境返回 `null` 或稳定占位                                                        |
| 主题变量读写   | 客户端调用 `setThemeColors` / `getThemeColor`；应用层用 ConfigProvider，html 预置同一套值 |
| 媒体查询/暗色  | `colorScheme="auto"` 首屏当 light；系统暗色用 cookie / `<html class="dark">`              |
| 图表尺寸       | 先给定容器尺寸；需要测量时延迟到客户端                                                    |

## Framework Checks

| Framework | 验证命令                                              | 组件入口                 | 客户端逻辑位置                                                                          |
| --------- | ----------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| Nuxt 3    | `pnpm --filter @expcat/tigercat-example-nuxt build`   | `@expcat/tigercat-vue`   | `onMounted`                                                                             |
| Next.js   | `pnpm --filter @expcat/tigercat-example-nextjs build` | `@expcat/tigercat-react` | `'use client'` island；包本身尚未打 `'use client'`，不要从 Server Component 直接 import |
| Both      | `pnpm example:ssr:build`                              | 正常包入口               | 避免服务端访问浏览器对象                                                                |

## Hydration Risks

| 能力            | 风险                                        | 建议                                                                              |
| --------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| DatePicker      | locale、时区或当前日期不同                  | 传稳定 `value`、`locale` 和格式化配置                                             |
| Charts          | 随机 id 或客户端尺寸影响 SVG                | 使用稳定 id；尺寸依赖客户端时给容器尺寸                                           |
| Modal/Drawer    | 初始 `open` 状态不同                        | 服务端和客户端使用同一初始 open 值                                                |
| Tooltip/Popover | 首屏定位依赖 DOM                            | 首屏关闭，打开后再计算定位                                                        |
| Theme           | hydrate 后才 `setTheme` / `auto` 加 `.dark` | `<html>` 预置与 ConfigProvider 同一套 class / `dir` / `lang`；`auto` 首屏当 light |

## Component Checklist

- 没有顶层浏览器全局访问。
- 初始 render 输出稳定 markup。
- 事件监听和 observer 有清理逻辑。
- 非浏览器环境有稳定 fallback。
- 日期、id、可见文案和图表 gradient id 可复现。
- SSR 行为有单测或通过 `pnpm example:ssr:build` 验证。
