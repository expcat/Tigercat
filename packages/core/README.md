# @expcat/tigercat-core

[![npm version](https://img.shields.io/npm/v/@expcat/tigercat-core.svg)](https://www.npmjs.com/package/@expcat/tigercat-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Core utilities and shared types for [Tigercat](https://github.com/expcat/Tigercat) UI library.

> ⚠️ **Internal Package** - This package is used internally by `@expcat/tigercat-vue` and `@expcat/tigercat-react`. You typically don't need to install it directly.

## Installation

```bash
pnpm add @expcat/tigercat-core
# or
npm install @expcat/tigercat-core
```

## Exports

| Module              | Description                                                                     |
| ------------------- | ------------------------------------------------------------------------------- |
| **Utils**           | `classNames`, `coerceClassValue`, `copyText`, animation helpers, a11y utilities |
| **Types**           | Shared TypeScript types for all components (Button, Input, Modal, Table, etc.)  |
| **Theme**           | CSS variables (`THEME_CSS_VARS`), color utilities, component theme configs      |
| **Tailwind Plugin** | `tigercatPlugin` - Tailwind CSS plugin for theme integration                    |

## Tailwind Plugin

```css
@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind/modern';
```

The modern preset only changes component styling when a consumer sets
`data-tiger-style="modern"`; the default visual style remains unchanged.

## License

[MIT](https://opensource.org/licenses/MIT)
