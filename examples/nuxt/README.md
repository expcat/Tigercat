# Tigercat Nuxt 3 SSR Example

This example verifies that Tigercat Vue components can render under Nuxt SSR and hydrate with stable markup.

```bash
pnpm --filter @expcat/tigercat-example-nuxt build
pnpm --filter @expcat/tigercat-example-nuxt dev
```

The page intentionally includes `DatePicker` with a stable value and `BarChart` with SVG gradients because those are the highest-risk SSR mismatch areas tracked in the Roadmap.
