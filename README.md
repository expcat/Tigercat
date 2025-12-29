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

### Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

For detailed testing guidelines, see:

**Vue Testing**:
- [Testing Guide](./tests/TESTING_GUIDE.md) - Comprehensive testing documentation
- [Quick Start Guide](./tests/QUICK_START.md) - Get started writing tests
- [Component Test Checklist](./tests/COMPONENT_TEST_CHECKLIST.md) - Track testing progress

**React Testing**:
- [Testing Guide](./tests/REACT_TESTING_GUIDE.md) - Comprehensive testing documentation
- [Quick Start Guide](./tests/REACT_QUICK_START.md) - Get started writing tests
- [Component Test Checklist](./tests/REACT_COMPONENT_TEST_CHECKLIST.md) - Track testing progress

### Project Structure

```
tigercat/
├── packages/
│   ├── core/           # Core utilities and types
│   ├── vue/            # Vue 3 components
│   └── react/          # React components
├── docs/               # Component documentation
│   ├── components/     # Individual component docs
│   └── theme.md        # Theme customization guide
├── tests/              # Test infrastructure and utilities
│   ├── vue/            # Vue component tests
│   ├── react/          # React component tests
│   └── utils/          # Test helpers and utilities
├── examples/           # Demo applications
│   └── demo/
│       ├── vue3/       # Vue 3 demo app
│       └── react/      # React demo app
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Documentation

Component documentation can be found in the `docs/components/` directory. Each component includes:
- API reference (props, events, types)
- Usage examples for both Vue 3 and React
- Styling and customization options
- Accessibility guidelines

See [docs/components/](./docs/components/) for the complete list of available components.

## License

MIT