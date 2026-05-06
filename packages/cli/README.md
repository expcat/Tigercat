# @expcat/tigercat-cli

CLI tooling for the [Tigercat](https://github.com/expcats/Tigercat) UI component library.

## Installation

```bash
pnpm add -g @expcat/tigercat-cli
# or
npx @expcat/tigercat-cli
```

## Commands

### `tigercat create <name>`

Create a new project with Tigercat pre-configured.

```bash
tigercat create my-app --template vue3
tigercat create my-app --template react
```

### `tigercat add <component>`

Add a component to your project with import boilerplate.

```bash
tigercat add Button
tigercat add Form Input Select DatePicker
```

### `tigercat playground`

Launch an interactive playground for testing components.

```bash
tigercat playground
tigercat playground --template react
```

### `tigercat generate docs`

Generate API documentation from component type definitions.

```bash
tigercat generate docs
tigercat generate docs --output ./docs/api
```

### `tigercat doctor`

Check whether the current project has compatible Node, pnpm, Tailwind CSS, Tigercat peer dependencies, and template tooling.

```bash
tigercat doctor
```

## Windows Support

The CLI is fully cross-platform. All template file paths use forward slashes and are
resolved via Node.js `path.resolve()` at write time, so they work correctly on Windows
with backslash paths, paths containing spaces, and UNC paths.

### Package Manager `.cmd` Shims

When installed globally or locally, each package manager creates platform-specific shims
so that `tigercat` can be invoked directly from PowerShell, CMD, or Git Bash:

| Package manager | Global install                        | Shim files created               |
| --------------- | ------------------------------------- | -------------------------------- |
| **pnpm**        | `pnpm add -g @expcat/tigercat-cli`    | `tigercat.cmd`, `tigercat` (sh)  |
| **npm**         | `npm i -g @expcat/tigercat-cli`       | `tigercat.cmd`, `tigercat` (sh), `tigercat.ps1` |
| **bun**         | `bun add -g @expcat/tigercat-cli`     | `tigercat.cmd`, `tigercat` (sh)  |

For local (non-global) installs, run via `npx tigercat`, `pnpm exec tigercat`, or
`bunx tigercat`. The `#!/usr/bin/env node` shebang in the built output is used by all
three package managers to locate the Node.js runtime.

> **Note:** If you use Corepack with pnpm on Windows, ensure `shell: true` is passed
> when spawning pnpm programmatically (the project scripts already handle this via
> `scripts/utils/pnpm.mjs`).

## License

MIT
