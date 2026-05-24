# 性能与按需加载

Tigercat 的 Vue、React、Core 包都提供子路径入口，推荐在大型应用中按组件导入，减少首屏 bundle 体积。

## 子路径导入

```ts
import { Button } from '@expcat/tigercat-vue/Button'
import { Select } from '@expcat/tigercat-vue/Select'
```

```tsx
import { Button } from '@expcat/tigercat-react/Button'
import { Select } from '@expcat/tigercat-react/Select'
```

## 重型组件懒加载

弹层、日期时间选择器、颜色选择器和图表适合按页面或交互时机懒加载。

```ts
import { defineAsyncComponent } from 'vue'

export const LazyDatePicker = defineAsyncComponent(() => import('@expcat/tigercat-vue/DatePicker'))
export const LazyLineChart = defineAsyncComponent(() => import('@expcat/tigercat-vue/LineChart'))
```

```tsx
import { lazy } from 'react'

export const LazyDatePicker = lazy(() => import('@expcat/tigercat-react/DatePicker'))
export const LazyLineChart = lazy(() => import('@expcat/tigercat-react/LineChart'))
```

## 图表按需入口

图表组件支持独立入口，业务页可以只加载当前需要的图表类型。

```ts
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import { BarChart } from '@expcat/tigercat-vue/BarChart'
```

```tsx
import { LineChart } from '@expcat/tigercat-react/LineChart'
import { BarChart } from '@expcat/tigercat-react/BarChart'
```

## Size Limit

仓库的 size-limit 配置同时覆盖完整包和代表性单组件子路径。Button 子路径入口目标为 gzip 后小于 15KB，修改 shared utils 或组件依赖后建议运行：

```bash
pnpm build
pnpm size
```
