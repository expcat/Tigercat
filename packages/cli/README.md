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

## License

MIT
