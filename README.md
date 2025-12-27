# Tigercat

A Tailwind CSS-based UI component library supporting both Vue 3 and React.

## 📋 Roadmap

See our [Development Roadmap](./ROADMAP.md) for all planned components and development progress.

查看我们的 [开发路线图](./ROADMAP.md) 了解所有计划中的组件和开发进度。

## Project Structure

This is a monorepo managed with pnpm workspaces containing:

| Package | Description |
|---------|-------------|
| `@tigercat/core` | Core utilities for Tigercat UI library |
| `@tigercat/vue` | Vue 3 components |
| `@tigercat/react` | React components |

## Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev
```

### Project Structure

```
tigercat/
├── packages/
│   ├── core/           # Core utilities
│   ├── vue/            # Vue 3 components
│   └── react/          # React components
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## License

MIT