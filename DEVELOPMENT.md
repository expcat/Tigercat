# Tigercat Development Guide

This guide provides detailed information for developers working on the Tigercat UI component library.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Commands](#development-commands)
- [Project Architecture](#project-architecture)
- [Adding New Components](#adding-new-components)
- [Testing Strategy](#testing-strategy)
- [Build System](#build-system)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Environment Setup

1. **Check Prerequisites**:

   ```bash
   # Verify your environment meets requirements
   pnpm dev:check
   ```

2. **Install Dependencies**:

   ```bash
   # Using the setup script (recommended for first-time setup)
   pnpm setup

   # Or manually
   pnpm install
   pnpm build
   ```

3. **Start Development**:

   ```bash
   # Watch mode for all packages
   pnpm dev

   # In another terminal, run tests in watch mode
   pnpm test

    # In another terminal, run an example
    pnpm example:vue    # or pnpm example:react
   ```

## 🛠 Development Commands

### Package Management

```bash
# Install dependencies
pnpm install

# Add a dependency to a specific package
pnpm --filter @tigercat/vue add vue-router
pnpm --filter @tigercat/react add react-router-dom

# Update dependencies
pnpm update
```

### Building

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm --filter @tigercat/core build
pnpm --filter @tigercat/vue build
pnpm --filter @tigercat/react build

# Watch mode (auto-rebuild on changes)
pnpm dev
pnpm --filter @tigercat/vue dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run specific framework tests
pnpm test:vue
pnpm test:react

# Run a specific test file
pnpm test Button.spec

# Run tests with coverage
pnpm test:coverage

# Run tests with UI (great for debugging)
pnpm test:ui
```

### Examples

```bash
# Run Vue3 example (http://localhost:5173)
pnpm example:vue

# Run React example (http://localhost:5174)
pnpm example:react

# Run both examples simultaneously
pnpm example:all

# Build examples for production
pnpm --filter @tigercat-example/vue3 build
pnpm --filter @tigercat-example/react build

# Preview production builds
pnpm --filter @tigercat-example/vue3 preview
pnpm --filter @tigercat-example/react preview
```

### Linting and Formatting

```bash
# Run ESLint
pnpm lint

# Format code with Prettier (repo source of truth: .prettierrc.json + .editorconfig)
pnpm format

# Check formatting (CI-friendly)
pnpm format:check

# Clean up build artifacts and node_modules
pnpm clean
```

### Environment Check

```bash
# Verify development environment
pnpm dev:check

# Or run the script directly
node ./scripts/check-env.mjs
```

## 🏗 Project Architecture

### Monorepo Structure

Tigercat uses pnpm workspaces to manage a monorepo with three main packages:

```
packages/
├── core/       # Framework-agnostic utilities and types
├── vue/        # Vue 3 components
└── react/      # React components
```

### Dependency Graph

```
@tigercat/vue  ──→  @tigercat/core

@tigercat/react ──→  @tigercat/core
```

- `@tigercat/core` has no framework dependencies
- Both `@tigercat/vue` and `@tigercat/react` depend on `@tigercat/core`
- Changes to `@tigercat/core` require rebuilding dependent packages

### Build Order

Packages are built in dependency order:

1. `@tigercat/core` (no dependencies)
2. `@tigercat/vue` and `@tigercat/react` (in parallel, both depend on core)
3. Example applications (depend on component packages)

## 🎨 Adding New Components

### Component Development Workflow

1. **Plan the Component**
   - Review [ROADMAP.md](./ROADMAP.md) for component priorities
   - Define component API (props, events, slots)
   - Consider accessibility requirements

2. **Create Core Types and Utilities**

   ```bash
   # Create type definitions
   packages/core/src/types/your-component.ts

   # Create utilities (if needed)
   packages/core/src/utils/your-component-utils.ts
   ```

   ```typescript
   // Example: packages/core/src/types/badge.ts
   export interface BadgeProps {
     variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
     size?: 'sm' | 'md' | 'lg'
     rounded?: boolean
   }
   ```

3. **Implement Vue Component**

   ```bash
   # Create component file
   packages/vue/src/components/YourComponent.vue
   ```

   ```vue
   <script setup lang="ts">
   import { computed } from 'vue'
   import type { YourComponentProps } from '@tigercat/core'

   const props = withDefaults(defineProps<YourComponentProps>(), {
     variant: 'primary',
     size: 'md'
   })

   const emit = defineEmits<{
     click: [event: MouseEvent]
   }>()
   </script>

   <template>
     <div @click="emit('click', $event)">
       <slot />
     </div>
   </template>
   ```

   Export in `packages/vue/src/index.ts`:

   ```typescript
   export { default as YourComponent } from './components/YourComponent.vue'
   export type { YourComponentProps } from '@tigercat/core'
   ```

4. **Implement React Component**

   ```bash
   # Create component file
   packages/react/src/components/YourComponent.tsx
   ```

   ```typescript
   import React from 'react'
   import type { YourComponentProps } from '@tigercat/core'

   export const YourComponent: React.FC<YourComponentProps> = ({
     variant = 'primary',
     size = 'md',
     onClick,
     children,
     ...props
   }) => {
     return (
       <div onClick={onClick} {...props}>
         {children}
       </div>
     )
   }
   ```

   Export in `packages/react/src/index.tsx`:

   ```typescript
   export { YourComponent } from './components/YourComponent'
   export type { YourComponentProps } from '@tigercat/core'
   ```

5. **Write Tests**

   ```bash
   # Vue tests
   tests/vue/YourComponent.spec.ts

   # React tests
   tests/react/YourComponent.spec.tsx
   ```

   Follow the test structure in existing test files. See [Testing Guide](./tests/TESTING_GUIDE.md).

6. **Add Documentation**

   ```bash
   # Component documentation
   docs/components/your-component.md
   ```

   Include:
   - Component description
   - Props/API reference
   - Usage examples (both Vue and React)
   - Accessibility notes
   - Styling customization

7. **Add to Examples**

   ```bash

   ```

# Vue example

examples/example/vue3/src/pages/YourComponentDemo.vue

# React example

examples/example/react/src/pages/YourComponentDemo.tsx

```

8. **Update Roadmap**

Mark component as complete in [ROADMAP.md](./ROADMAP.md):
- Vue: ✅
- React: ✅
- Docs: ✅
- Tests: ✅

### Component Best Practices

- **Framework Agnostic Core**: Put shared logic in `@tigercat/core`
- **Consistent API**: Keep Vue and React APIs as similar as possible
- **Accessibility First**: Follow ARIA best practices
- **Theme Support**: Use CSS variables for colors
- **TypeScript Strict**: Use strict TypeScript mode
- **Test Coverage**: Aim for high test coverage
- **Documentation**: Document all props, events, and usage patterns

## 🧪 Testing Strategy

### Test Organization

```

tests/
├── vue/ # Vue component tests
├── react/ # React component tests
└── utils/ # Shared test utilities
├── render-helpers.ts # Vue render helpers
├── render-helpers-react.ts # React render helpers
├── a11y-helpers.ts # Accessibility testing
├── theme-helpers.ts # Theme testing
└── test-fixtures.ts # Common test data

````

### Test Categories

Each component should have tests for:

1. **Rendering**: Default rendering, custom props, edge cases
2. **Props**: All prop variations and combinations
3. **Events**: All emitted events/handlers
4. **States**: Different states (disabled, loading, error, etc.)
5. **Theme**: Theme customization via CSS variables
6. **Accessibility**: ARIA attributes, keyboard navigation, no violations
7. **Snapshots**: Major use cases and variants

### Running Tests

```bash
# Watch mode during development
pnpm test

# Run specific tests
pnpm test Button         # All Button tests
pnpm test:vue            # Only Vue tests
pnpm test:react          # Only React tests

# Coverage and UI
pnpm test:coverage       # Generate coverage report
pnpm test:ui             # Interactive test UI
````

### Writing Tests

See detailed guides:

- [Vue Testing Guide](./tests/TESTING_GUIDE.md)
- [React Testing Guide](./tests/REACT_TESTING_GUIDE.md)

## 🔨 Build System

### Build Tool: tsup

We use [tsup](https://tsup.egoist.dev/) for building packages. It's fast and provides:

- TypeScript compilation
- Multiple output formats (CJS, ESM)
- Type definitions generation
- Watch mode for development

### Build Configuration

Each package has its own `package.json` with build scripts:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "clean": "rm -rf dist"
  }
}
```

### Output Structure

```
packages/*/dist/
├── index.js        # CommonJS
├── index.mjs       # ES Modules
├── index.d.ts      # TypeScript definitions (CJS)
└── index.d.mts     # TypeScript definitions (ESM)
```

## 📋 Common Tasks

### Adding a Dependency

```bash
# Root dependency (for development tools)
pnpm add -D vitest -w

# Package-specific dependency
pnpm --filter @tigercat/vue add some-package
pnpm --filter @tigercat/react add some-package
```

### Updating Version

```bash
# Update all packages version
pnpm version patch
pnpm version minor
pnpm version major
```

### Cleaning Up

```bash
# Remove all build artifacts
pnpm clean

# Remove build artifacts from specific package
pnpm --filter @tigercat/vue clean

# Remove node_modules (then reinstall)
rm -rf node_modules packages/*/node_modules examples/*/node_modules
pnpm install
```

### Working with Git

```bash
# Create feature branch
git checkout -b feature/new-component

# Keep branch updated
git fetch upstream
git rebase upstream/main

# Push changes
git push origin feature/new-component
```

## 🐛 Troubleshooting

### Common Issues

#### 1. `pnpm: command not found`

**Solution**:

```bash
npm install -g pnpm@10.26.2
```

#### 2. Build Errors After Updating Core

**Problem**: Changes to `@tigercat/core` require rebuilding dependent packages.

**Solution**:

```bash
# Rebuild all packages
pnpm build

# Or rebuild in dependency order
pnpm --filter @tigercat/core build
pnpm --filter @tigercat/vue build
pnpm --filter @tigercat/react build
```

#### 3. Example Not Loading Components

**Problem**: Examples require built packages.

**Solution**:

```bash
# Build packages first
pnpm build

# Then run example (preferred)
pnpm example:vue
```

#### 4. Test Failures After Changes

**Problem**: Tests may be cached.

**Solution**:

```bash
# Clear Vitest cache
rm -rf node_modules/.vitest

# Rerun tests
pnpm test
```

#### 5. TypeScript Errors in IDE

**Problem**: VSCode not picking up TypeScript changes.

**Solution**:

1. Reload VSCode window: `Cmd+Shift+P` → "Reload Window"
2. Restart TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. Rebuild packages: `pnpm build`

#### 6. Port Already in Use

**Problem**: Example server port (5173 or 5174) is already in use.

**Solution**:

```bash
# Find process using the port
lsof -i :5173
lsof -i :5174

# Kill the process
kill -9 <PID>

# Or use different ports (edit vite.config.ts in example packages)
```

### Getting Help

- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Search existing [GitHub Issues](https://github.com/expcats/Tigercat/issues)
- Ask in [GitHub Discussions](https://github.com/expcats/Tigercat/discussions)

## 📚 Additional Resources

### Documentation

- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [ROADMAP.md](./ROADMAP.md) - Development roadmap
- [Testing Guide](./tests/TESTING_GUIDE.md) - Vue testing
- [React Testing Guide](./tests/REACT_TESTING_GUIDE.md) - React testing

### External Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)
- [pnpm Documentation](https://pnpm.io/)

## 🎯 Next Steps

After setting up your development environment:

1. ✅ Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. ✅ Pick an issue from the [issue tracker](https://github.com/expcats/Tigercat/issues)
3. ✅ Create a feature branch
4. ✅ Make your changes
5. ✅ Write tests
6. ✅ Submit a pull request

Happy coding! 🐯
