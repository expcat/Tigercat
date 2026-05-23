# Tigercat Next.js SSR Example

This example verifies that Tigercat React components can render through a Next.js App Router client boundary and hydrate with stable markup.

```bash
pnpm --filter @expcat/tigercat-example-nextjs build
pnpm --filter @expcat/tigercat-example-nextjs dev
```

The page intentionally includes `DatePicker` with a stable value and `BarChart` with SVG gradients because those are the highest-risk SSR mismatch areas tracked in the Roadmap.
