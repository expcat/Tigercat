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
      primaryDisabled: '#ffc9c9',
    })
  }, [])

  const switchToBlueTheme = () => {
    setThemeColors({
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryDisabled: '#93c5fd',
    })
  }

  const switchToGreenTheme = () => {
    setThemeColors({
      primary: '#10b981',
      primaryHover: '#059669',
      primaryDisabled: '#6ee7b7',
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
    primaryDisabled: '#ffc9c9',
  })
})

const switchToBlueTheme = () => {
  setThemeColors({
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryDisabled: '#93c5fd',
  })
}

const switchToGreenTheme = () => {
  setThemeColors({
    primary: '#10b981',
    primaryHover: '#059669',
    primaryDisabled: '#6ee7b7',
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

| CSS 变量 | 说明 | 默认值 |
|---------|------|--------|
| `--tiger-primary` | 主色 | `#2563eb` |
| `--tiger-primary-hover` | 主色悬停 | `#1d4ed8` |
| `--tiger-primary-disabled` | 主色禁用 | `#93c5fd` |
| `--tiger-secondary` | 次要颜色 | `#4b5563` |
| `--tiger-secondary-hover` | 次要颜色悬停 | `#374151` |
| `--tiger-secondary-disabled` | 次要颜色禁用 | `#9ca3af` |
| `--tiger-outline-bg-hover` | Outline 按钮悬停背景 | `#eff6ff` |
| `--tiger-ghost-bg-hover` | Ghost 按钮悬停背景 | `#eff6ff` |

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
  primaryHover: '#cc0000',
})

// 设置特定容器的主题颜色
const container = document.querySelector('.my-container')
setThemeColors({
  primary: '#00ff00',
}, container)
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
      setThemeColors({
        primary: '#ff6b6b',
        primaryHover: '#ee5a52',
      }, containerRef.current)
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
          outlineBgHover: '#1e3a8a',
        })
      } else {
        // 浅色主题
        setThemeColors({
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          outlineBgHover: '#eff6ff',
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

## 最佳实践

1. **使用语义化颜色**: 尽量使用 CSS 变量而不是硬编码颜色值
2. **保持一致性**: 确保所有主题颜色都有合理的对比度和可访问性
3. **性能考虑**: CSS 变量的更改会立即生效，无需重新渲染组件
4. **测试主题**: 确保在不同主题下所有组件都能正常显示

## 注意事项

- CSS 变量在不支持的旧浏览器中可能无法工作（IE 11 及更早版本）
- 如果未设置 CSS 变量，组件将使用默认的 Tailwind CSS 颜色
- 主题颜色的更改是响应式的，会立即反映在所有使用该变量的组件上
