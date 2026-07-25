# Tigercat Nuxt 3 SSR Example

This example verifies that Tigercat Vue components can render under Nuxt SSR and hydrate with stable markup.

```bash
pnpm --filter @expcat/tigercat-example-nuxt build
pnpm --filter @expcat/tigercat-example-nuxt dev
```

The page intentionally includes `DatePicker` with a stable value and `BarChart` with SVG gradients: those cover the two highest-risk hydration mismatch sources, locale/timezone formatting and generated SVG ids.

`pnpm example:ssr:check` builds this example as part of the release gate. See [examples/README.md](../README.md) for the full example-app layout.
