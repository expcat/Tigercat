---
name: tigercat-tokens
description: Tigercat design token source files, generated outputs, and validation commands
---

# Design Tokens

`packages/core/tokens/tokens.json` is the single source of truth for Tigercat design tokens.

| Layer     | Source key  | CSS prefix                   | TS export         |
| --------- | ----------- | ---------------------------- | ----------------- |
| Primitive | `primitive` | `--tiger-primitive-*`        | `primitive*`      |
| Semantic  | `semantic`  | `--tiger-semantic-*`         | `semanticTokens`  |
| Component | `component` | `--tiger-component-{name}-*` | `componentTokens` |

Run this after editing token source data:

```bash
pnpm tokens:build
```

Generated outputs:

| File                                        | Purpose                          |
| ------------------------------------------- | -------------------------------- |
| `packages/core/tokens/tokens.css`           | CSS variables and `color-scheme` |
| `packages/core/src/tokens/tokens.ts`        | TS constants and token types     |
| `packages/core/tokens/tailwind-tokens.js`   | Tailwind v4 plugin token data    |
| `packages/core/tokens/figma-variables.json` | Figma Variables import data      |

For app setup, use Tailwind v4 CSS plugin syntax from [theme.md](theme.md).

Validate token-sensitive changes with `pnpm build`, `pnpm test`, `pnpm size`, and visual tests when component rendering changes.
