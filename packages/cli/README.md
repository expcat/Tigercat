# @expcat/tigercat-cli

CLI tooling for the [Tigercat](https://github.com/expcat/Tigercat) UI component library.

## Installation

```bash
pnpm add -g @expcat/tigercat-cli
# or
npx @expcat/tigercat-cli
```

## Usage Examples

### Start a Vue 3 project

```bash
tigercat create admin-console --template vue3
cd admin-console
pnpm install
pnpm dev
```

Preview the generated file list without writing files:

```bash
tigercat create admin-console --template vue3 --dry-run
```

### Start a React project

```bash
tigercat create design-lab --template react
cd design-lab
pnpm install
pnpm dev
```

### Add component boilerplate to an existing project

Run from a project that already depends on `@expcat/tigercat-vue` or `@expcat/tigercat-react`:

```bash
tigercat add Button Form Input Select
tigercat add --framework vue3 --install --snippet src/tigercat-components.ts
```

When no component names are provided, `add` opens an interactive multi-select prompt.
The command prints the correct package import, detects missing peer dependencies,
can install them with `--install`, and creates `src/components/*Demo.vue` or
`src/components/*Demo.tsx` files when a `src/components` directory exists.

```bash
tigercat add Button Form Input Select --dry-run
```

### Open a temporary playground

```bash
tigercat playground --template vue3 --port 3456
tigercat playground --template react --port 3457
tigercat playground --template react --no-open
```

Playground files are created under `.tigercat-playground/` in the current working directory.

```bash
tigercat playground --template react --port 3457 --dry-run
```

### Generate API docs from type definitions

```bash
tigercat generate docs --input packages/core/src/types --output docs/api
tigercat generate docs --input packages/core/src/types --output docs/api --dry-run
tigercat generate test Button --framework both
tigercat generate doc-template Button --output docs/components
```

### Check project compatibility

```bash
tigercat doctor
tigercat doctor --json
```

`doctor` verifies `package.json`, Node.js, pnpm, Tailwind CSS, Tigercat peer dependencies,
template dependency compatibility, and the supported version compatibility matrix. JSON output is
designed for CI and automated diagnostics.

## Commands

### `tigercat create <name>`

Create a new project with Tigercat pre-configured.

```bash
tigercat create my-app --template vue3
tigercat create my-app --template react
tigercat create my-app --template vue3 --dry-run
```

### `tigercat add <component>`

Add a component to your project with import boilerplate.

```bash
tigercat add Button
tigercat add Form Input Select DatePicker
tigercat add --framework react --install --snippet src/tigercat-components.ts
tigercat add Button --dry-run
```

### `tigercat playground`

Launch an interactive playground for testing components.

```bash
tigercat playground
tigercat playground --template react
tigercat playground --template react --no-open
tigercat playground --template react --dry-run
```

### `tigercat generate docs`

Generate API documentation from component type definitions.

```bash
tigercat generate docs
tigercat generate docs --output ./docs/api
tigercat generate docs --output ./docs/api --dry-run
```

### `tigercat generate test`

Generate Vue and/or React starter test templates for a component.

```bash
tigercat generate test Button --framework both
tigercat generate test Button --framework vue3
tigercat generate test Button --framework react --dry-run
```

### `tigercat generate doc-template`

Generate a component documentation page template.

```bash
tigercat generate doc-template Button
tigercat generate doc-template Button --output docs/components --dry-run
```

### `tigercat doctor`

Check whether the current project has compatible Node, pnpm, Tailwind CSS, Tigercat peer dependencies, and template tooling.

```bash
tigercat doctor
tigercat doctor --json
```

## Windows Support

The CLI is fully cross-platform. All template file paths use forward slashes and are
resolved via Node.js `path.resolve()` at write time, so they work correctly on Windows
with backslash paths, paths containing spaces, and UNC paths.

### Package Manager `.cmd` Shims

When installed globally or locally, each package manager creates platform-specific shims
so that `tigercat` can be invoked directly from PowerShell, CMD, or Git Bash:

| Package manager | Global install                     | Shim files created                              |
| --------------- | ---------------------------------- | ----------------------------------------------- |
| **pnpm**        | `pnpm add -g @expcat/tigercat-cli` | `tigercat.cmd`, `tigercat` (sh)                 |
| **npm**         | `npm i -g @expcat/tigercat-cli`    | `tigercat.cmd`, `tigercat` (sh), `tigercat.ps1` |
| **bun**         | `bun add -g @expcat/tigercat-cli`  | `tigercat.cmd`, `tigercat` (sh)                 |

For local (non-global) installs, run via `npx tigercat`, `pnpm exec tigercat`, or
`bunx tigercat`. The `#!/usr/bin/env node` shebang in the built output is used by all
three package managers to locate the Node.js runtime.

> **Note:** If you use Corepack with pnpm on Windows, ensure `shell: true` is passed
> when spawning pnpm programmatically (the project scripts already handle this via
> `scripts/utils/pnpm.mjs`).

## License

MIT
