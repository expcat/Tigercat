# Getting Started

Install the framework package and the shared core package.

```bash
pnpm add @expcat/tigercat-core @expcat/tigercat-vue
pnpm add @expcat/tigercat-core @expcat/tigercat-react
```

## Vue 3

```ts
import { Button, Input } from '@expcat/tigercat-vue'
```

## React

```tsx
import { Button, Input } from '@expcat/tigercat-react'
```

## Tailwind CSS

```ts
import { tigercatPlugin } from '@expcat/tigercat-core'

export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  plugins: [tigercatPlugin]
}
```

Run `tigercat doctor --json` in an application to verify Node, pnpm, Tailwind, framework peers, and template compatibility.
