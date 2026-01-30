---
name: tigercat-theme
description: Tigercat theme configuration - CSS variables, dark mode, JS API
---

# 主题配置

Tigercat 使用 CSS 变量控制主题颜色，支持自动注入、手动配置和 JS API。

## 自动注入（推荐）

```js
// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'

export default { plugins: [tigercatPlugin] }
```

---

## CSS 变量

### 核心变量

```css
:root {
  /* 主色 */
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;

  /* 次要色 */
  --tiger-secondary: #4b5563;
  --tiger-secondary-hover: #374151;

  /* 按钮悬停背景 */
  --tiger-outline-bg-hover: #eff6ff;
  --tiger-ghost-bg-hover: #eff6ff;

  /* 边框和文本 */
  --tiger-border: #e5e7eb;
  --tiger-text: #1f2937;
  --tiger-text-secondary: #6b7280;
}
```

### 图表色板

> 详见 [shared/props/charts.md](shared/props/charts.md)

```css
:root {
  --tiger-chart-1: #3b82f6;
  --tiger-chart-2: #10b981;
  --tiger-chart-3: #f59e0b;
  --tiger-chart-4: #ef4444;
  --tiger-chart-5: #8b5cf6;
  --tiger-chart-6: #ec4899;
}
```

---

## JS API

```ts
import { setThemeColors, getThemeColor, THEME_CSS_VARS } from '@expcat/tigercat-core'

// 设置主题色
setThemeColors({ primary: '#ff0000', primaryHover: '#cc0000' })

// 指定目标元素
setThemeColors({ primary: '#ff0000' }, document.getElementById('app'))

// 读取当前主题色
const primary = getThemeColor('primary')

// 获取所有变量名
console.log(THEME_CSS_VARS) // ['--tiger-primary', ...]
```

---

## 暗色模式

### 方法一：CSS 类切换（推荐）

```css
:root {
  --tiger-primary: #2563eb;
  --tiger-border: #e5e7eb;
  --tiger-text: #1f2937;
}

.dark {
  --tiger-primary: #60a5fa;
  --tiger-border: #374151;
  --tiger-text: #f9fafb;
}
```

**切换逻辑**（Vue/React 通用）：

```ts
// 初始化
const isDark = localStorage.getItem('theme') === 'dark'
document.documentElement.classList.toggle('dark', isDark)

// 切换
function toggleTheme() {
  const next = !document.documentElement.classList.contains('dark')
  document.documentElement.classList.toggle('dark', next)
  localStorage.setItem('theme', next ? 'dark' : 'light')
}
```

### 方法二：JS 动态切换

```ts
const lightTheme = { primary: '#2563eb', border: '#e5e7eb', text: '#1f2937' }
const darkTheme = { primary: '#60a5fa', border: '#374151', text: '#f9fafb' }

setThemeColors(isDark ? darkTheme : lightTheme)
```

### 方法三：跟随系统

```ts
const mq = window.matchMedia('(prefers-color-scheme: dark)')
document.documentElement.classList.toggle('dark', mq.matches)
mq.addEventListener('change', (e) => {
  document.documentElement.classList.toggle('dark', e.matches)
})
```

---

## Tailwind 中使用变量

```html
<button class="bg-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-primary-hover,#1d4ed8)]">
  Button
</button>
<p class="text-[var(--tiger-text,#1f2937)]">Content</p>
<div class="border border-[var(--tiger-border,#e5e7eb)]">Card</div>
```

---

## 变量速查

| 变量 | 用途 |
|------|------|
| `--tiger-primary` | 主色（按钮、链接） |
| `--tiger-primary-hover` | 主色悬停 |
| `--tiger-secondary` | 次要色 |
| `--tiger-border` | 边框、分割线 |
| `--tiger-text` | 主文本 |
| `--tiger-text-secondary` | 次要文本 |
| `--tiger-chart-N` | 图表色板 (N=1-6) |
