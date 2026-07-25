# Tigercat Next.js SSR Example

This example verifies that Tigercat React components can render through a Next.js App Router client boundary and hydrate with stable markup.

```bash
pnpm --filter @expcat/tigercat-example-nextjs build
pnpm --filter @expcat/tigercat-example-nextjs dev
```

The page intentionally includes `DatePicker` with a stable value and `BarChart` with SVG gradients: those cover the two highest-risk hydration mismatch sources, locale/timezone formatting and generated SVG ids.

`pnpm example:ssr:check` builds this example as part of the release gate and verifies that `next-env.d.ts` is not rewritten by the build. See [examples/README.md](../README.md) for the full example-app layout.
