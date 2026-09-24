---
name: tigercat-tokens
description: Tigercat design token source files, generated outputs, and validation commands
---

# Design Tokens

`packages/core/tokens/tokens.json` is the single source of truth. It generates:

1. Layered Figma/design tokens (`--tiger-primitive-*` / `--tiger-semantic-*`)
2. The **default runtime theme** (`runtimeThemeLight` / `runtimeThemeDark`)
3. Runtime aliases with the names components read (`--tiger-primary`, `--tiger-radius-md`, `--tiger-transition-base`, …) on `:root` and `.dark`

Default `primary` is `#2563eb` in both the layered tokens and the runtime aliases. Do not keep a second palette.

| Layer     | Source key  | CSS prefix            | TS export                                |
| --------- | ----------- | --------------------- | ---------------------------------------- |
| Primitive | `primitive` | `--tiger-primitive-*` | `primitive*`                             |
| Semantic  | `semantic`  | `--tiger-semantic-*`  | `semanticTokens`                         |
| Runtime   | `runtime`   | `--tiger-*`           | `runtimeThemeLight` / `runtimeThemeDark` |

Run this after editing token source data:

```bash
pnpm tokens:build
```

Generated outputs (do not hand-edit):

| File                                        | Purpose                                                          |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `packages/core/tokens/tokens.css`           | Layered tokens + runtime `--tiger-*` aliases + dark aliases      |
| `packages/core/src/tokens/tokens.ts`        | TS constants, including `runtimeThemeLight` / `runtimeThemeDark` |
| `packages/core/tokens/figma-variables.json` | Figma Variables import data                                      |

`tokens.css` is optional for apps that already use the Tailwind plugin: the plugin writes the same runtime names. Use `tokens.css` only when you need the layered Figma names in CSS.

Canonical runtime names are `--tiger-primary` / `--tiger-radius-*` / `--tiger-transition-*` (written by the plugin and `createTigerThemeScope`). There is no `--tiger-text-muted`, `--tiger-fill`, or `--tiger-bg` alias. Color switches and motion: [theme.md](theme.md).

Validate token-sensitive changes with `pnpm tokens:check` and the core theme specs (`design-tokens`, `themes-manager`, `theme-contrast`, `theme-css-var-aliases`).

Next: [theme.md](theme.md)
