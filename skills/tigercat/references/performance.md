---
name: tigercat-performance
description: Tigercat import strategy, lazy loading, chart entries, and performance validation
---

# Performance

Prefer PascalCase component subpath imports for on-demand bundles. Root named exports remain available for small apps and non-component APIs, but large applications should put heavy components behind route or interaction boundaries.

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

Use root named exports for hooks/composables, command APIs such as `Message` / `notification`, and shared framework/core types when no component subpath owns the symbol.

## Locale Imports

Single-language apps should import exactly the locale they need:

```ts
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
```

Apps that only need custom wording can use `defineText(...)`; it does not import
Tigercat locale packs. Runtime DatePicker string lookup lives behind
`@expcat/tigercat-core/datepicker-locales/registry` and should be imported only
when all built-in DatePicker presets are intentionally needed.

Run `pnpm build` and `pnpm size` after changing shared utils, chart code, exports, or component dependencies.

For component-batch performance work, run the matching grouped tests before the heavier gates:

```bash
pnpm test:group -- --group charts --list
pnpm test:group:charts
pnpm test:group -- --group advanced --framework vue
```

Then run `pnpm docs:api:check`, the relevant examples check, and changed-file Prettier check. Escalate to `pnpm size` and `pnpm publish:check` whenever shared dependencies, component subpaths, lazy imports, charts, editors, locale loading, or package side effects change.

## Benchmarks

Run `pnpm bench` (Vitest benchmark mode) to execute the suites under `benchmarks/` (8 `.bench.ts` files; the `benchmark` section of `vitest.config.ts` controls discovery). Results are advisory and not a CI gate: the P3 review kept hard baseline thresholds deferred because shared runners make micro-benchmark timings noisy and prone to false red builds. `.github/workflows/bench.yml` runs them weekly and on manual dispatch (`pnpm bench --run --outputJson=bench-results.json`) and uploads the JSON artifact for manual comparison against previous artifacts.
