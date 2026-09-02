# Tigercat Next.js 16 SSR Example

This example is a copy-paste recipe: Tailwind v4 + the Tigercat plugin, one `ConfigProvider` at the app root, and a `'use client'` boundary for components (`@expcat/tigercat-react` does not ship `'use client'` yet — do not import them from a Server Component).

```bash
pnpm --filter @expcat/tigercat-example-nextjs build
pnpm --filter @expcat/tigercat-example-nextjs dev
```

`app/globals.css` uses the Tailwind recipe in [examples/README.md](../README.md). Point `@source` at `packages/react/dist` and `packages/core/dist` — Next's PostCSS scan does not follow the pnpm `node_modules` symlink. `layout.tsx` sets `<html lang="zh-CN">` and wraps `children` with `ConfigProvider locale={zhCN} colorScheme="light"`.

The page HTML contains a primary Button, a **closed** DatePicker (`value="2024-01-15"`, `format="yyyy-MM-dd"` — input formatting, not an open calendar), and a fixed-size `gradient` BarChart. An unbound DatePicker calls `new Date()` during render.

`pnpm example:ssr:check` builds this app, asserts those strings plus `--tiger-primary` in CSS, keeps `next-env.d.ts` stable, and hydrates the same tree. See [examples/README.md](../README.md).
