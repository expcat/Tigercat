---
name: tigercat-performance
description: Tigercat import strategy, lazy loading, chart entries, and performance validation
---

# Performance

Prefer PascalCase component subpath imports for on-demand bundles; setup and import examples live
in [getting-started.md](getting-started.md). Root named exports remain for small apps,
hooks/composables, command APIs (`Message` / `notification` / `LoadingBar` — [command-apis.md](command-apis.md)),
and shared types. Large apps should put heavy components behind route or interaction boundaries.

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

Chart components expose independent entries so product pages can load only the chart types they use:
`@expcat/tigercat-vue/LineChart`, `@expcat/tigercat-react/BarChart`, and the same pattern for other chart types.

## Locale Imports

Single-language apps should import exactly the locale they need:

```ts
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
```

Apps that only need custom wording can use `defineText(...)`; it does not import Tigercat locale
packs. Runtime DatePicker string lookup lives behind
`@expcat/tigercat-core/datepicker-locales/registry` and should be imported only when all built-in
DatePicker presets are intentionally needed.

Run `pnpm build` and `pnpm size` after changing shared utils, chart code, exports, or component dependencies.

For component-batch performance work, run the matching grouped tests before the heavier gates:

```bash
pnpm test:group -- --group charts --list
pnpm test:group:charts
pnpm test:group -- --group advanced --framework vue
```

Then run `pnpm docs:api:check`, the relevant examples check, and changed-file Prettier check. Escalate to `pnpm size` and `pnpm publish:check` whenever shared dependencies, component subpaths, lazy imports, charts, editors, locale loading, or package side effects change.

## Benchmarks

Run `pnpm bench` (Vitest benchmark mode) locally. Suites live under `benchmarks/` (8 `.bench.ts`
files; the `benchmark` section of `vitest.config.ts` controls discovery). Results are advisory
rather than a release gate because shared or cross-platform timings are noisy. When comparing
changes, keep the machine and runtime stable and save JSON explicitly with
`pnpm bench --run --outputJson=bench-results.json`; benchmarks are not run in GitHub Actions.

Next: [getting-started.md](getting-started.md) · [command-apis.md](command-apis.md)
