---
name: tigercat-getting-started
description: Tigercat setup, package imports, Tailwind CSS v4 integration, and doctor command
---

# Getting Started

Use the CLI template for new apps whenever possible; templates are Tailwind CSS v4-only and wire Vite, Tigercat, and framework peers together. Stable and preview versions: [root README](https://github.com/expcat/Tigercat/blob/main/README.md); match app and CLI version. Commands here use `@next` so they match this checkout.

```bash
pnpm dlx @expcat/tigercat-cli@next create my-app --template vue3
pnpm dlx @expcat/tigercat-cli@next create my-app --template react
```

For manual installation, install the shared core package and exactly one framework package, on that same tag.

```bash
pnpm add @expcat/tigercat-core@next @expcat/tigercat-vue@next
pnpm add @expcat/tigercat-core@next @expcat/tigercat-react@next
```

Vue and React should prefer PascalCase subpaths for on-demand bundles.

```ts
import { Button } from '@expcat/tigercat-vue/Button'
```

```tsx
import { Button } from '@expcat/tigercat-react/Button'
```

Root named exports remain available for small apps, hooks/composables, command APIs
([command-apis.md](command-apis.md)), and shared types. Larger apps should use component subpaths at
route or interaction boundaries.

Tailwind integration must use Tailwind CSS v4 and `@tailwindcss/vite`.

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind";
@source '../node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}';
```

The plugin also injects Steps connector geometry (vertical/horizontal tails
centered on the icon column), ImagePreview chrome (close, previous/next, toolbar),
and the WorkflowDesigner center-axis canvas rail. Do not rely on JIT-scanned
utilities such as `inset-inline-start-4` for those positions.

Runtime theme switching uses `ConfigProvider` `theme` / `colorScheme`. `theme="modern"` selects
the modern preset. The Tailwind entry is only `@plugin "@expcat/tigercat-core/tailwind"`.

Run `pnpm dlx @expcat/tigercat-cli@next doctor --json` in an application to verify Node, pnpm, Tailwind v4, framework peers, and template dependencies.

Next: [cli.md](cli.md) · [theme.md](theme.md) · [recipes/building-apps.md](recipes/building-apps.md)
