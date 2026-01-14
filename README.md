# Tigercat

A Tailwind CSS-based UI component library supporting both Vue 3 and React.

## 📋 Roadmap

See our [Development Roadmap](./ROADMAP.md) for all planned components and development progress.

查看我们的 [开发路线图](./ROADMAP.md) 了解所有计划中的组件和开发进度。

## Project Structure

This is a monorepo managed with pnpm workspaces containing:

| Package           | Description                            |
| ----------------- | -------------------------------------- |
| `@tigercat/core`  | Core utilities for Tigercat UI library |
| `@tigercat/vue`   | Vue 3 components                       |
| `@tigercat/react` | React components                       |

## Development

### Prerequisites

- Node.js >= 18 (recommended: 20.19.6)
- pnpm >= 8 (recommended: 10.26.2)

### Quick Setup

For first-time contributors, we provide a setup script:

```bash
# Clone and setup
git clone https://github.com/expcats/Tigercat.git
cd Tigercat
pnpm setup
```

Or manually:

```bash
# Install pnpm if not already installed
npm install -g pnpm@10.26.2

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Verify your environment
pnpm dev:check
```

### Development Workflow

```bash
# Development mode (watch all packages)
pnpm dev

# Run all tests
pnpm test

# Run examples (preferred)
pnpm example:vue    # Vue3 example on http://localhost:5173
pnpm example:react  # React example on http://localhost:5174
pnpm example:all    # Run both examples simultaneously

# Compatibility aliases
pnpm demo:vue
pnpm demo:react
pnpm demo:all
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific framework tests
pnpm test:vue     # Vue tests only
pnpm test:react   # React tests only

# Run tests with UI (great for debugging)
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

### Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `pnpm build`         | Build all packages               |
| `pnpm dev`           | Watch mode for all packages      |
| `pnpm test`          | Run all tests                    |
| `pnpm test:vue`      | Run Vue tests only               |
| `pnpm test:react`    | Run React tests only             |
| `pnpm test:ui`       | Run tests with interactive UI    |
| `pnpm test:coverage` | Run tests with coverage report   |
| `pnpm example:vue`   | Run Vue3 example (port 5173)     |
| `pnpm example:react` | Run React example (port 5174)    |
| `pnpm example:all`   | Run both examples simultaneously |
| `pnpm demo:vue`      | Alias of `example:vue`           |
| `pnpm demo:react`    | Alias of `example:react`         |
| `pnpm demo:all`      | Alias of `example:all`           |
| `pnpm dev:check`     | Verify development environment   |
| `pnpm lint`          | Lint all packages                |
| `pnpm clean`         | Clean build artifacts            |

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
├── examples/           # Example applications
│   └── example/
│       ├── vue3/       # Vue 3 example app
│       └── react/      # React example app
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

## Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

For detailed development documentation, see [DEVELOPMENT.md](./DEVELOPMENT.md).

### Quick Links

- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Development Guide](./DEVELOPMENT.md) - Development documentation
- [Roadmap](./ROADMAP.md) - Project roadmap and progress

## Troubleshooting

### Common Issues

**pnpm not found?**

```bash
npm install -g pnpm@10.26.2
```

**Example not loading components?**

```bash
# Build packages first
pnpm build
# Then run example
pnpm example:vue
```

**Tests failing after changes?**

```bash
# Clear cache and rebuild
pnpm clean
pnpm install
pnpm build
pnpm test
```

**Port already in use?**

```bash
# Check what's using the port
lsof -i :5173  # or :5174
# Kill the process or use a different port
```

For more troubleshooting tips, see [DEVELOPMENT.md](./DEVELOPMENT.md#troubleshooting).

## License

MIT
