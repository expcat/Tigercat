---
name: tigercat-ssr
description: Tigercat SSR usage and component authoring guidance
---

# SSR 支持

Tigercat 组件以客户端交互为主，但共享工具和组件实现应避免在服务端渲染阶段直接访问浏览器 API。当前 SSR 守卫集中在 `@expcat/tigercat-core` 的 `isBrowser()`。

## 使用原则

- 在 Nuxt、Next.js 等 SSR 框架中，优先通过正常包入口导入组件：`@expcat/tigercat-vue`、`@expcat/tigercat-react`。
- 主题 CSS 变量通过 Tailwind 插件或静态 CSS 注入；运行时主题切换只在客户端执行。
- 需要读取 `window`、`document`、`navigator`、`localStorage`、`matchMedia`、`ResizeObserver` 或 DOM 尺寸时，放到客户端生命周期或 effect 中。
- 不要让初始渲染依赖客户端专有值；服务端和客户端首屏 markup 应保持一致，避免 hydration mismatch。

## 客户端守卫

```ts
import { isBrowser } from '@expcat/tigercat-core'

if (isBrowser()) {
  document.documentElement.classList.toggle('dark', true)
}
```

组件内部新增浏览器 API 访问时，优先使用 `isBrowser()` 或框架生命周期：

| 场景           | 推荐做法                                      |
| -------------- | --------------------------------------------- |
| DOM 查询/尺寸  | Vue `onMounted` / React `useEffect` 后读取    |
| 全局事件监听   | 客户端生命周期注册，卸载时移除                |
| Portal/overlay | 非浏览器环境返回 `null` 或跳过挂载            |
| 主题变量读写   | `setThemeColors` / `getThemeColor` 客户端调用 |
| 媒体查询/暗色  | 客户端初始化后同步，CSS 默认值负责首屏        |
| 拖拽/触控/滚动 | 客户端绑定事件，服务端只输出静态结构          |

## Nuxt 3 示例

```vue
<script setup lang="ts">
import { Button } from '@expcat/tigercat-vue'
</script>

<template>
  <Button variant="solid">保存</Button>
</template>
```

需要客户端环境的交互可以放入 `onMounted`：

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { setThemeColors } from '@expcat/tigercat-core'

onMounted(() => {
  setThemeColors({ primary: '#2563eb' })
})
</script>
```

## Next.js 示例

```tsx
import { Button } from '@expcat/tigercat-react'

export function SaveButton() {
  return <Button variant="solid">保存</Button>
}
```

需要浏览器环境的主题切换放入客户端组件：

```tsx
'use client'

import { useEffect } from 'react'
import { setThemeColors } from '@expcat/tigercat-core'

export function ThemeBootstrap() {
  useEffect(() => {
    setThemeColors({ primary: '#2563eb' })
  }, [])

  return null
}
```

## Hydration 风险点

| 组件/能力       | 风险                                        | 建议                                         |
| --------------- | ------------------------------------------- | -------------------------------------------- |
| DatePicker      | locale、时区或当前日期导致服务端/客户端不同 | 传入稳定 `value`、`locale` 和格式化配置      |
| Charts          | 随机 id 或客户端尺寸影响 SVG 输出           | 使用稳定 id；尺寸依赖客户端时先给定容器尺寸  |
| Modal/Drawer    | 初始 `open` 与客户端状态不同                | 服务端和客户端使用同一初始 open 值           |
| Tooltip/Popover | 首屏定位依赖 DOM 尺寸                       | 关闭态首屏渲染，打开后再计算定位             |
| Theme           | 客户端读取 localStorage 后切换 class        | 在 HTML 层提前注入默认 class 或使用 CSS 默认 |

## 组件开发检查清单

新增或修改组件时确认：

- 模块顶层没有直接读取浏览器全局对象。
- 初始 render 不依赖客户端尺寸、滚动位置或媒体查询结果。
- 浏览器事件监听有对应清理逻辑。
- Portal、overlay、拖拽、复制、上传等能力在非浏览器环境下可静默跳过或返回稳定占位。
- 可见文案、日期和 id 在服务端与客户端保持稳定。
- 相关 SSR 行为已通过单测覆盖；Nuxt / Next 集成验证仍按 Roadmap 单独推进。
