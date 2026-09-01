# Tigercat Nuxt 4 SSR Example

This example is a copy-paste recipe: Tailwind v4 + the Tigercat plugin, and one `ConfigProvider` at the app root wrapping the page.

```bash
pnpm --filter @expcat/tigercat-example-nuxt build
pnpm --filter @expcat/tigercat-example-nuxt dev
```

`assets/main.css` imports Tailwind, `@plugin '@expcat/tigercat-core/tailwind'`, and `@source` on the Vue/core `dist` files. `app.vue` sets `html` `lang="zh-CN"` and `<ConfigProvider :locale="zhCN" color-scheme="light">`. `typescript.typeCheck` is off; this example does not type-check Vue SFCs.

The page HTML contains a primary Button, a **closed** DatePicker (`model-value="2024-01-15"`, `format="yyyy-MM-dd"` — input formatting, not an open calendar), and a fixed-size `gradient` BarChart. An unbound DatePicker calls `new Date()` during render.

`pnpm example:ssr:check` builds this app, prerenders `/`, asserts those strings plus `--tiger-primary` in CSS, and hydrates the same tree. See [examples/README.md](../README.md).
