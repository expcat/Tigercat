---
name: tigercat-getting-started
description: Tigercat setup, package imports, Tailwind CSS v4 integration, and doctor command
---

# Getting Started

Use the CLI template for new apps whenever possible; templates are Tailwind CSS v4-only and wire Vite, Tigercat, and framework peers together.

```bash
tigercat create my-app --template vue3
tigercat create my-app --template react
```

For manual installation, install the shared core package and exactly one framework package.

```bash
pnpm add @expcat/tigercat-core @expcat/tigercat-vue
pnpm add @expcat/tigercat-core @expcat/tigercat-react
```

Vue imports use `@expcat/tigercat-vue`.

```ts
import { Button, Input } from '@expcat/tigercat-vue'
```

React imports use `@expcat/tigercat-react`.

```tsx
import { Button, Input } from '@expcat/tigercat-react'
```

Tailwind integration must use Tailwind CSS v4 and `@tailwindcss/vite`.

```css
@import 'tailwindcss';
@plugin "@expcat/tigercat-core/tailwind/modern";
```

Run `tigercat doctor --json` in an application to verify Node, pnpm, Tailwind v4, framework peers, and template dependencies.
