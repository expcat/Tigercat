# Tigercat 开发说明

## 快速开始

```bash
pnpm dev:check
pnpm setup
pnpm dev
pnpm test
pnpm example:vue
```

## 常用命令

```bash
pnpm build
pnpm dev
pnpm test
pnpm test:vue
pnpm test:react
pnpm example:vue
pnpm example:react
pnpm lint
pnpm format:check
pnpm clean
```

## 新增组件（最小步骤）

1. Core 类型/工具：`packages/core/src/types|utils`
2. Vue 组件：`packages/vue/src/components` 并导出
3. React 组件：`packages/react/src/components` 并导出
4. 文档：更新 [docs/components-vue.md](./docs/components-vue.md) 与 [docs/components-react.md](./docs/components-react.md)
5. 测试：`tests/vue` / `tests/react`
6. 里程碑：必要时更新 [ROADMAP.md](./ROADMAP.md)

## 排错（简）

```bash
pnpm clean
pnpm install
pnpm build
pnpm test
```

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

````

Export in `packages/react/src/index.tsx`:

```typescript
export { YourComponent } from './components/YourComponent'
export type { YourComponentProps } from '@expcat/tigercat-core'
````

5. **Write Tests**

   ```bash
   # Vue tests
   tests/vue/YourComponent.spec.ts

   # React tests
   tests/react/YourComponent.spec.tsx
   ```

   Follow the test structure in existing test files. See [Testing Guide](./tests/TESTING_GUIDE.md).

6. **Add Documentation**

Update the concise overviews:

```bash
# Vue overview
docs/components-vue.md

# React overview
docs/components-react.md
```

Keep it brief:

- One-line component description
- Category placement only (no deep API details)

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

- **Framework Agnostic Core**: Put shared logic in `@expcat/tigercat-core`
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
pnpm --filter @expcat/tigercat-vue add some-package
pnpm --filter @expcat/tigercat-react add some-package
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
pnpm --filter @expcat/tigercat-vue clean

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

**Problem**: Changes to `@expcat/tigercat-core` require rebuilding dependent packages.

**Solution**:

```bash
# Rebuild all packages
pnpm build

# Or rebuild in dependency order
pnpm --filter @expcat/tigercat-core build
pnpm --filter @expcat/tigercat-vue build
pnpm --filter @expcat/tigercat-react build
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
