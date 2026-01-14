# 主题配置 (Theme Configuration)

Tigercat 支持通过 CSS 变量进行主题颜色配置，可以实时更改主题颜色而无需重新编译。

## 使用 CSS 变量

### 在 CSS 文件中配置

```css
/* 默认主题 */
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;
  --tiger-secondary: #4b5563;
  --tiger-secondary-hover: #374151;
  --tiger-secondary-disabled: #9ca3af;
  --tiger-outline-bg-hover: #eff6ff;
  --tiger-ghost-bg-hover: #eff6ff;
}

/* 深色主题 */
.dark {
  --tiger-primary: #60a5fa;
  --tiger-primary-hover: #3b82f6;
  --tiger-primary-disabled: #1e3a8a;
  --tiger-outline-bg-hover: #1e3a8a;
  --tiger-ghost-bg-hover: #1e3a8a;
}

/* 自定义主题 */
.custom-theme {
  --tiger-primary: #ff6b6b;
  --tiger-primary-hover: #ee5a52;
  --tiger-primary-disabled: #ffc9c9;
}
```

### 在 JavaScript/TypeScript 中配置

#### React 示例

```tsx
import { useEffect } from 'react'
import { Button, setThemeColors } from '@tigercat/react'

function App() {
  useEffect(() => {
    // 设置主题颜色
    setThemeColors({
      primary: '#ff6b6b',
      primaryHover: '#ee5a52',
      primaryDisabled: '#ffc9c9'
    })
  }, [])

  const switchToBlueTheme = () => {
    setThemeColors({
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryDisabled: '#93c5fd'
    })
  }

  const switchToGreenTheme = () => {
    setThemeColors({
      primary: '#10b981',
      primaryHover: '#059669',
      primaryDisabled: '#6ee7b7'
    })
  }

  return (
    <div>
      <Button onClick={switchToBlueTheme}>蓝色主题</Button>
      <Button onClick={switchToGreenTheme}>绿色主题</Button>
      <Button variant="primary">Primary Button</Button>
    </div>
  )
}
```

#### Vue 3 示例

```vue
<script setup>
import { onMounted } from 'vue'
import { Button, setThemeColors } from '@tigercat/vue'

onMounted(() => {
  // 设置主题颜色
  setThemeColors({
    primary: '#ff6b6b',
    primaryHover: '#ee5a52',
    primaryDisabled: '#ffc9c9'
  })
})

const switchToBlueTheme = () => {
  setThemeColors({
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryDisabled: '#93c5fd'
  })
}

const switchToGreenTheme = () => {
  setThemeColors({
    primary: '#10b981',
    primaryHover: '#059669',
    primaryDisabled: '#6ee7b7'
  })
}
</script>

<template>
  <div>
    <Button @click="switchToBlueTheme">蓝色主题</Button>
    <Button @click="switchToGreenTheme">绿色主题</Button>
    <Button variant="primary">Primary Button</Button>
  </div>
</template>
```

## 可用的 CSS 变量

| CSS 变量                     | 说明                 | 默认值    |
| ---------------------------- | -------------------- | --------- |
| `--tiger-primary`            | 主色                 | `#2563eb` |
| `--tiger-primary-hover`      | 主色悬停             | `#1d4ed8` |
| `--tiger-primary-disabled`   | 主色禁用             | `#93c5fd` |
| `--tiger-secondary`          | 次要颜色             | `#4b5563` |
| `--tiger-secondary-hover`    | 次要颜色悬停         | `#374151` |
| `--tiger-secondary-disabled` | 次要颜色禁用         | `#9ca3af` |
| `--tiger-outline-bg-hover`   | Outline 按钮悬停背景 | `#eff6ff` |
| `--tiger-ghost-bg-hover`     | Ghost 按钮悬停背景   | `#eff6ff` |

## API 参考

### `setThemeColors(colors, element?)`

设置主题颜色。

**参数：**

- `colors`: `Partial<Record<keyof typeof THEME_CSS_VARS, string>>` - 要设置的颜色对象
- `element`: `HTMLElement` (可选) - 要设置颜色的元素，默认为 `document.documentElement`

**示例：**

```typescript
// 设置全局主题颜色
setThemeColors({
  primary: '#ff0000',
  primaryHover: '#cc0000'
})

// 设置特定容器的主题颜色
const container = document.querySelector('.my-container')
setThemeColors(
  {
    primary: '#00ff00'
  },
  container
)
```

### `getThemeColor(colorKey, element?)`

获取当前主题颜色值。

**参数：**

- `colorKey`: `keyof typeof THEME_CSS_VARS` - 颜色键名
- `element`: `HTMLElement` (可选) - 要获取颜色的元素，默认为 `document.documentElement`

**返回：** `string | undefined` - 当前颜色值

**示例：**

```typescript
import { getThemeColor } from '@tigercat/core'

const primaryColor = getThemeColor('primary')
console.log(primaryColor) // '#2563eb'
```

## 高级用法

### 针对特定容器的主题

```tsx
import { useEffect, useRef } from 'react'
import { Button, setThemeColors } from '@tigercat/react'

function ThemedContainer() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // 为这个容器设置独立的主题
      setThemeColors(
        {
          primary: '#ff6b6b',
          primaryHover: '#ee5a52'
        },
        containerRef.current
      )
    }
  }, [])

  return (
    <div ref={containerRef}>
      <Button variant="primary">这个按钮使用自定义主题</Button>
    </div>
  )
}
```

### 响应系统主题切换

```tsx
import { useEffect } from 'react'
import { setThemeColors } from '@tigercat/react'

function useSystemTheme() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // 深色主题
        setThemeColors({
          primary: '#60a5fa',
          primaryHover: '#3b82f6',
          outlineBgHover: '#1e3a8a'
        })
      } else {
        // 浅色主题
        setThemeColors({
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          outlineBgHover: '#eff6ff'
        })
      }
    }

    // 初始设置
    updateTheme(mediaQuery)

    // 监听变化
    mediaQuery.addEventListener('change', updateTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])
}
```

## 暗色模式 (Dark Mode)

Tigercat 完全支持暗色模式。您可以通过多种方式实现暗色主题。

### 方法一：使用 CSS 类切换

```css
/* styles/theme.css */
:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
  --tiger-primary-disabled: #93c5fd;
  --tiger-secondary: #4b5563;
  --tiger-secondary-hover: #374151;
  --tiger-secondary-disabled: #9ca3af;
  --tiger-outline-bg-hover: #eff6ff;
  --tiger-ghost-bg-hover: #eff6ff;
}

/* 暗色模式 */
.dark {
  --tiger-primary: #60a5fa;
  --tiger-primary-hover: #3b82f6;
  --tiger-primary-disabled: #1e3a8a;
  --tiger-secondary: #9ca3af;
  --tiger-secondary-hover: #6b7280;
  --tiger-secondary-disabled: #374151;
  --tiger-outline-bg-hover: #1e3a8a;
  --tiger-ghost-bg-hover: #1e3a8a;
}
```

#### Vue 3 实现

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@tigercat/vue'

const isDark = ref(false)

// 从 localStorage 读取用户偏好
onMounted(() => {
  const stored = localStorage.getItem('theme')
  isDark.value = stored === 'dark'
  applyTheme(isDark.value)
})

const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
}
</script>

<template>
  <div>
    <Button @click="toggleTheme">
      {{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}
    </Button>
  </div>
</template>
```

#### React 实现

```tsx
import { useState, useEffect } from 'react'
import { Button } from '@tigercat/react'

function App() {
  const [isDark, setIsDark] = useState(false)

  // 从 localStorage 读取用户偏好
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const dark = stored === 'dark'
    setIsDark(dark)
    applyTheme(dark)
  }, [])

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    applyTheme(newDark)
  }

  return (
    <div>
      <Button onClick={toggleTheme}>{isDark ? '切换到亮色模式' : '切换到暗色模式'}</Button>
    </div>
  )
}
```

### 方法二：使用 JavaScript 动态切换

```tsx
import { setThemeColors } from '@tigercat/react'

const lightTheme = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryDisabled: '#93c5fd',
  secondary: '#4b5563',
  secondaryHover: '#374151',
  secondaryDisabled: '#9ca3af',
  outlineBgHover: '#eff6ff',
  ghostBgHover: '#eff6ff'
}

const darkTheme = {
  primary: '#60a5fa',
  primaryHover: '#3b82f6',
  primaryDisabled: '#1e3a8a',
  secondary: '#9ca3af',
  secondaryHover: '#6b7280',
  secondaryDisabled: '#374151',
  outlineBgHover: '#1e3a8a',
  ghostBgHover: '#1e3a8a'
}

function toggleDarkMode(isDark: boolean) {
  setThemeColors(isDark ? darkTheme : lightTheme)
}
```

### 方法三：响应系统偏好

自动根据用户的系统设置切换主题：

```tsx
import { useEffect } from 'react'
import { setThemeColors } from '@tigercat/react'

function useAutoTheme() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // 系统偏好暗色模式
        document.documentElement.classList.add('dark')
      } else {
        // 系统偏好亮色模式
        document.documentElement.classList.remove('dark')
      }
    }

    // 初始设置
    updateTheme(mediaQuery)

    // 监听变化
    mediaQuery.addEventListener('change', updateTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])
}

// 在应用中使用
function App() {
  useAutoTheme()

  return <div>{/* 你的应用内容 */}</div>
}
```

## 常用配色方案 (Color Scheme Presets)

Tigercat 提供了一些预设的配色方案，可以快速应用。所有主题共享相同的次要颜色配置。

### 预设主题

```typescript
// 共享的次要颜色（所有主题通用）
const commonColors = {
  secondary: '#4b5563',
  secondaryHover: '#374151',
  secondaryDisabled: '#9ca3af'
}

// 蓝色主题（默认）
const blueTheme = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryDisabled: '#93c5fd',
  outlineBgHover: '#eff6ff',
  ghostBgHover: '#eff6ff',
  ...commonColors
}

// 绿色主题
const greenTheme = {
  primary: '#10b981',
  primaryHover: '#059669',
  primaryDisabled: '#6ee7b7',
  outlineBgHover: '#d1fae5',
  ghostBgHover: '#d1fae5',
  ...commonColors
}

// 紫色主题
const purpleTheme = {
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  primaryDisabled: '#c4b5fd',
  outlineBgHover: '#ede9fe',
  ghostBgHover: '#ede9fe',
  ...commonColors
}

// 红色主题
const redTheme = {
  primary: '#ef4444',
  primaryHover: '#dc2626',
  primaryDisabled: '#fca5a5',
  outlineBgHover: '#fee2e2',
  ghostBgHover: '#fee2e2',
  ...commonColors
}

// 橙色主题
const orangeTheme = {
  primary: '#f97316',
  primaryHover: '#ea580c',
  primaryDisabled: '#fdba74',
  outlineBgHover: '#ffedd5',
  ghostBgHover: '#ffedd5',
  ...commonColors
}
```

### 使用预设主题

```tsx
import { setThemeColors } from '@tigercat/react'

function ThemeSelector() {
  const themes = {
    blue: blueTheme,
    green: greenTheme,
    purple: purpleTheme,
    red: redTheme,
    orange: orangeTheme
  }

  const applyTheme = (themeName: keyof typeof themes) => {
    setThemeColors(themes[themeName])
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => applyTheme('blue')}>蓝色</Button>
      <Button onClick={() => applyTheme('green')}>绿色</Button>
      <Button onClick={() => applyTheme('purple')}>紫色</Button>
      <Button onClick={() => applyTheme('red')}>红色</Button>
      <Button onClick={() => applyTheme('orange')}>橙色</Button>
    </div>
  )
}
```

## 主题持久化 (Theme Persistence)

为了在用户刷新页面后保持主题设置，可以使用 `localStorage` 或其他存储方案。

### 使用 localStorage

#### Vue 3

```vue
<script setup>
import { ref, onMounted, watch } from 'vue'
import { setThemeColors } from '@tigercat/vue'

const currentTheme = ref('blue')

// 从 localStorage 加载主题
onMounted(() => {
  const savedTheme = localStorage.getItem('tigercat-theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    applyTheme(savedTheme)
  }
})

// 监听主题变化并保存
watch(currentTheme, (newTheme) => {
  localStorage.setItem('tigercat-theme', newTheme)
})

const applyTheme = (themeName) => {
  const themes = {
    blue: { primary: '#2563eb', primaryHover: '#1d4ed8' },
    green: { primary: '#10b981', primaryHover: '#059669' }
    // ... 其他主题
  }

  setThemeColors(themes[themeName])
}
</script>
```

#### React

```tsx
import { useState, useEffect } from 'react'
import { setThemeColors } from '@tigercat/react'

function usePersistedTheme() {
  const [currentTheme, setCurrentTheme] = useState('blue')

  // 从 localStorage 加载主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('tigercat-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  // 保存主题到 localStorage
  useEffect(() => {
    localStorage.setItem('tigercat-theme', currentTheme)
  }, [currentTheme])

  const applyTheme = (themeName: string) => {
    const themes = {
      blue: { primary: '#2563eb', primaryHover: '#1d4ed8' },
      green: { primary: '#10b981', primaryHover: '#059669' }
      // ... 其他主题
    }

    setThemeColors(themes[themeName])
  }

  return { currentTheme, setCurrentTheme: applyTheme }
}
```

### 使用 Cookie

```typescript
// 设置主题到 cookie
function setThemeCookie(theme: string) {
  document.cookie = `tigercat-theme=${theme}; path=/; max-age=31536000` // 1年
}

// 从 cookie 读取主题
function getThemeCookie(): string | null {
  const match = document.cookie.match(/tigercat-theme=([^;]+)/)
  return match ? match[1] : null
}
```

## 无障碍性考虑 (Accessibility Considerations)

### 1. 颜色对比度

确保主题颜色符合 WCAG 2.1 对比度要求：

- **正常文本**: 至少 4.5:1
- **大号文本**: 至少 3:1
- **交互元素**: 至少 3:1

```typescript
// 使用对比度检查工具验证颜色组合
const primary = '#2563eb' // 主色
const white = '#ffffff' // 背景色

// 确保对比度 >= 4.5:1
```

### 2. 状态指示不仅依赖颜色

```vue
<template>
  <!-- ✅ 好的实践：使用图标 + 颜色 -->
  <Button variant="primary"> <Icon name="check" /> 成功 </Button>

  <!-- ❌ 不好的实践：仅依赖颜色 -->
  <Button variant="primary">成功</Button>
</template>
```

### 3. 支持高对比度模式

```css
/* 支持 Windows 高对比度模式 */
@media (prefers-contrast: high) {
  :root {
    --tiger-primary: #0000ff;
    --tiger-primary-hover: #0000cc;
  }
}
```

### 4. 减少动画

对于喜欢减少动画的用户提供支持：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## CSS 变量覆盖

### 全局覆盖

在应用的根 CSS 文件中覆盖默认值：

```css
/* app.css */
:root {
  /* 覆盖主题颜色 */
  --tiger-primary: #8b5cf6;
  --tiger-primary-hover: #7c3aed;
  --tiger-primary-disabled: #c4b5fd;

  /* 自定义新的变量 */
  --tiger-success: #10b981;
  --tiger-warning: #f59e0b;
  --tiger-danger: #ef4444;
}
```

### 局部覆盖

为特定容器或组件覆盖主题：

```vue
<template>
  <!-- 为特定区域使用不同主题 -->
  <div class="custom-theme-area">
    <Button variant="primary">自定义主题按钮</Button>
  </div>
</template>

<style scoped>
.custom-theme-area {
  --tiger-primary: #10b981;
  --tiger-primary-hover: #059669;
}
</style>
```

### 组件级覆盖

```tsx
<div
  style={{
    '--tiger-primary': '#8b5cf6',
    '--tiger-primary-hover': '#7c3aed'
  }}>
  <Button variant="primary">紫色按钮</Button>
</div>
```

## 主题调试工具

### 实时主题编辑器

创建一个主题编辑器来实时调整颜色：

```vue
<script setup>
import { ref } from 'vue'
import { setThemeColors, getThemeColor } from '@tigercat/vue'

const primaryColor = ref('#2563eb')
const primaryHoverColor = ref('#1d4ed8')

const updateTheme = () => {
  setThemeColors({
    primary: primaryColor.value,
    primaryHover: primaryHoverColor.value
  })
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div>
      <label>主色：</label>
      <input type="color" v-model="primaryColor" @change="updateTheme" />
      <span>{{ primaryColor }}</span>
    </div>

    <div>
      <label>主色悬停：</label>
      <input type="color" v-model="primaryHoverColor" @change="updateTheme" />
      <span>{{ primaryHoverColor }}</span>
    </div>

    <Button variant="primary">预览按钮</Button>
  </div>
</template>
```

## 最佳实践

1. **使用语义化颜色**: 尽量使用 CSS 变量而不是硬编码颜色值
2. **保持一致性**: 确保所有主题颜色都有合理的对比度和可访问性
3. **性能考虑**: CSS 变量的更改会立即生效，无需重新渲染组件
4. **测试主题**: 确保在不同主题下所有组件都能正常显示
5. **提供默认值**: 始终为 CSS 变量提供后备值
6. **文档化自定义变量**: 如果添加了自定义主题变量，确保有文档说明
7. **考虑无障碍**: 确保颜色对比度符合 WCAG 标准
8. **主题持久化**: 保存用户的主题选择，提升用户体验
9. **响应式设计**: 支持根据系统偏好自动切换主题
10. **渐进增强**: 为不支持 CSS 变量的浏览器提供后备方案

## 常见问题

### 1. 为什么主题颜色没有生效？

确保：

- CSS 变量名称正确（以 `--tiger-` 开头）
- 在组件挂载后设置主题
- 检查是否有其他 CSS 规则覆盖了颜色

### 2. 如何在 SSR 应用中使用主题？

在服务器端渲染时，通过 `class` 或内联样式设置初始主题：

```tsx
// Next.js 示例
export default function RootLayout({ children }) {
  return (
    <html className="light">
      {' '}
      {/* 或从 cookie 读取 */}
      <body>{children}</body>
    </html>
  )
}
```

### 3. 主题切换时有闪烁？

在 HTML head 中添加脚本，在页面加载前应用主题：

```html
<script>
  // 在 <head> 中执行，避免闪烁
  ;(function () {
    const theme = localStorage.getItem('tigercat-theme') || 'light'
    document.documentElement.classList.add(theme)
  })()
</script>
```

### 4. 可以使用 Tailwind 的暗色模式吗？

可以！Tigercat 与 Tailwind 的暗色模式完全兼容：

```vue
<template>
  <div class="bg-white dark:bg-gray-800">
    <Button variant="primary">按钮</Button>
  </div>
</template>
```

## 注意事项

- CSS 变量在不支持的旧浏览器中可能无法工作（IE 11 及更早版本）
- 如果未设置 CSS 变量，组件将使用默认的 Tailwind CSS 颜色
- 主题颜色的更改是响应式的，会立即反映在所有使用该变量的组件上
- 建议在应用初始化时就设置主题，避免视觉跳变
- 暗色模式下，确保所有文本和交互元素都有足够的对比度
