---
name: tigercat-performance
description: Tigercat import strategy, lazy loading, chart entries, and performance validation
---

# Performance

Prefer package-level imports for ordinary usage and component subpath imports for large applications that need stricter bundle control.

## Subpath Imports

```ts
import { Button } from '@expcat/tigercat-vue/Button'
import { Select } from '@expcat/tigercat-vue/Select'
```

```tsx
import { Button } from '@expcat/tigercat-react/Button'
import { Select } from '@expcat/tigercat-react/Select'
```

## Lazy Loading

Heavy components such as overlays, date/time pickers, color pickers, editors, and charts should be loaded by route or interaction boundary.

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

## Chart Entries

Chart components expose independent entries so product pages can load only the chart types they use.

```ts
import { LineChart } from '@expcat/tigercat-vue/LineChart'
import { BarChart } from '@expcat/tigercat-vue/BarChart'
```

```tsx
import { LineChart } from '@expcat/tigercat-react/LineChart'
import { BarChart } from '@expcat/tigercat-react/BarChart'
```

Run `pnpm build` and `pnpm size` after changing shared utils, chart code, exports, or component dependencies.
