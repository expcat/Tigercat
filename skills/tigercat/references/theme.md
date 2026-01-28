---
name: tigercat-theme
description: Tigercat theme configuration - CSS variables, dark mode, JS API
---

# 主题配置

Tigercat 使用 CSS 变量控制主题颜色，支持自动注入、手动配置和 JS API。

## 自动注入（推荐）

使用 Tailwind 插件自动注入默认主题变量：

```js
// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'

export default {
  plugins: [tigercatPlugin]
}
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
  --tiger-secondary-disabled: #9ca3af;

  /* 按钮 outline/ghost 悬停背景 */
  --tiger-outline-bg-hover: #eff6ff;
  --tiger-ghost-bg-hover: #eff6ff;

  /* 边框和文本 */
  --tiger-border: #e5e7eb;
  --tiger-text: #1f2937;
  --tiger-text-secondary: #6b7280;
}
```

### 图表色板

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

图表组件默认使用：

- `--tiger-border`：坐标轴、网格线
- `--tiger-text`：轴标题
- `--tiger-text-secondary`：刻度文字
- `--tiger-primary`：柱状图/散点图默认色
- `--tiger-chart-1` ~ `--tiger-chart-6`：饼图色板

---

## JS/TS API

### setThemeColors

设置主题色（运行时动态切换）：

```ts
import { setThemeColors } from '@expcat/tigercat-core'

setThemeColors({
  primary: '#ff0000',
  primaryHover: '#cc0000'
})

// 指定目标元素
setThemeColors({ primary: '#ff0000' }, document.getElementById('app'))
```

### getThemeColor

读取当前主题色：

```ts
import { getThemeColor } from '@expcat/tigercat-core'

const primary = getThemeColor('primary')
const border = getThemeColor('border')
```

---

## 暗色模式

### 方法一：CSS 类切换（推荐）

```css
/* styles/theme.css */
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-secondary: #4b5563;
  --tiger-border: #e5e7eb;
  --tiger-text: #1f2937;
}

.dark {
  --tiger-primary: #60a5fa;
  --tiger-primary-hover: #3b82f6;
  --tiger-secondary: #9ca3af;
  --tiger-border: #374151;
  --tiger-text: #f9fafb;
}
```

#### Vue 切换

```vue
<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>
```

#### React 切换

```tsx
import { useState, useEffect } from 'react'

function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return { isDark, toggleTheme }
}
```

### 方法二：JS 动态切换

```ts
import { setThemeColors } from '@expcat/tigercat-core'

const lightTheme = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  secondary: '#4b5563',
  border: '#e5e7eb',
  text: '#1f2937'
}

const darkTheme = {
  primary: '#60a5fa',
  primaryHover: '#3b82f6',
  secondary: '#9ca3af',
  border: '#374151',
  text: '#f9fafb'
}

function toggleTheme(isDark: boolean) {
  setThemeColors(isDark ? darkTheme : lightTheme)
}
```

### 方法三：跟随系统

```ts
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function applySystemTheme(e: MediaQueryListEvent | MediaQueryList) {
  document.documentElement.classList.toggle('dark', e.matches)
}

// 初始化
applySystemTheme(mediaQuery)

// 监听变化
mediaQuery.addEventListener('change', applySystemTheme)
```

---

## 主题预设

### 预置颜色方案

```ts
import { THEME_CSS_VARS } from '@expcat/tigercat-core'

// 获取所有变量名
console.log(THEME_CSS_VARS)
// ['--tiger-primary', '--tiger-primary-hover', ...]
```

### 自定义主题

```ts
const brandTheme = {
  primary: '#7c3aed', // 品牌紫
  primaryHover: '#6d28d9',
  secondary: '#059669', // 品牌绿
  secondaryHover: '#047857'
}

setThemeColors(brandTheme)
```

---

## Tailwind 中使用主题变量

```html
<!-- 使用变量并带 fallback -->
<button class="bg-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-primary-hover,#1d4ed8)]">
  Button
</button>

<!-- 文本颜色 -->
<p class="text-[var(--tiger-text,#1f2937)]">Content</p>

<!-- 边框 -->
<div class="border border-[var(--tiger-border,#e5e7eb)]">Card</div>
```

---

## 变量命名规则

| 变量                       | 用途                     |
| -------------------------- | ------------------------ |
| `--tiger-primary`          | 主色（按钮、链接、高亮） |
| `--tiger-primary-hover`    | 主色悬停                 |
| `--tiger-primary-disabled` | 主色禁用                 |
| `--tiger-secondary`        | 次要色（次要按钮）       |
| `--tiger-outline-bg-hover` | outline 按钮悬停背景     |
| `--tiger-ghost-bg-hover`   | ghost 按钮悬停背景       |
| `--tiger-border`           | 边框、分割线             |
| `--tiger-text`             | 主文本                   |
| `--tiger-text-secondary`   | 次要文本                 |
| `--tiger-chart-N`          | 图表色板 (N=1-6)         |
