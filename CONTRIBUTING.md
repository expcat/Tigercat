# Contributing to Tigercat

Thank you for your interest in contributing to Tigercat! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: >= 18.0.0 (recommended: 20.19.6)
- **pnpm**: >= 8.0.0 (recommended: 10.26.2)

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
# Install the recommended Node.js version
nvm install
nvm use
```

### Quick Setup

We provide a setup script that will configure your development environment:

```bash
# Clone the repository
git clone https://github.com/expcats/Tigercat.git
cd Tigercat

# Run the setup script
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

## 🔄 Development Workflow

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Tigercat.git
cd Tigercat
git remote add upstream https://github.com/expcats/Tigercat.git
```

### 2. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Development

```bash
# Start development mode (watch all packages)
pnpm dev

# Run tests in watch mode
pnpm test

# Run examples (preferred)
pnpm example:vue    # Vue3 example on http://localhost:5173
pnpm example:react  # React example on http://localhost:5174
pnpm example:all    # Run both examples simultaneously
```

### 4. Make Changes

- Write clean, maintainable code following our [coding standards](#coding-standards)
- Add tests for new features or bug fixes
- Update documentation as needed
- Ensure all tests pass

### 5. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific framework tests
pnpm test:vue
pnpm test:react

# Run tests with coverage
pnpm test:coverage

# Run tests with UI (great for debugging)
pnpm test:ui

# Lint your code
pnpm lint
```

### 6. Commit and Push

```bash
# Stage your changes
git add .

# Commit with a meaningful message (see Commit Messages section)
git commit -m "feat: add new Button variant"

# Push to your fork
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to the original repository on GitHub
- Click "New Pull Request"
- Select your fork and branch
- Fill in the PR template with details about your changes
- Link any related issues

## 📁 Project Structure

```
tigercat/
├── packages/
│   ├── core/           # Framework-agnostic utilities and types
│   ├── vue/            # Vue 3 components
│   └── react/          # React components
├── examples/
│   └── example/
│       ├── vue3/       # Vue 3 example app
│       └── react/      # React example app
├── tests/
│   ├── vue/            # Vue component tests
│   ├── react/          # React component tests
│   └── utils/          # Shared test utilities
├── docs/               # Component documentation
├── scripts/            # Development scripts
└── .vscode/            # VSCode settings and recommendations
```

### Where to Make Changes

- **Core utilities/types**: `packages/core/src/`
- **Vue components**: `packages/vue/src/components/`
- **React components**: `packages/react/src/components/`
- **Documentation**: `docs/components/`
- **Tests**: `tests/vue/` or `tests/react/`
- **Examples**: `examples/example/vue3/` or `examples/example/react/`

## 📝 Coding Standards

### TypeScript

- Use strict TypeScript mode
- Provide explicit return types for public functions
- Avoid `any` type - use `unknown` or proper types
- Use interfaces for object shapes
- Use underscore prefix for intentionally unused parameters (`_context`)

### Component Development

#### Vue Components

- Use Composition API with `<script setup>` syntax
- Use TypeScript with `defineProps`, `defineEmits`, `defineExpose`
- Emit events with kebab-case names
- Use slots for content composition

```vue
<script setup lang="ts">
import { computed } from 'vue';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button @click="emit('click', $event)">
    <slot />
  </button>
</template>
```

#### React Components

- Use functional components with hooks
- Use explicit prop types
- Use camelCase for event handler props
- Use children prop for content composition

```typescript
import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  return (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
```

### Styling

- Use Tailwind CSS utility classes
- Use CSS variables for theme colors
- Follow the theme system: `bg-[var(--tiger-primary,#2563eb)]`
- Support dark mode when applicable

### File Naming

- Component files: `kebab-case.vue`, `kebab-case.tsx`
- Utility files: `kebab-case.ts`
- Component names in code: `PascalCase`

## 🧪 Testing Guidelines

All components must have comprehensive tests covering:

1. **Rendering**: Basic rendering with default and custom props
2. **Props**: All prop combinations and edge cases
3. **Events**: All emitted events/handlers
4. **States**: Different states (disabled, loading, error, etc.)
5. **Theme**: Theme customization via CSS variables
6. **Accessibility**: ARIA attributes, keyboard navigation, no a11y violations
7. **Snapshots**: Major use cases and variants

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      // Test implementation
    });
  });

  describe('Props', () => {
    it('should apply size prop correctly', () => {
      // Test implementation
    });
  });

  describe('Events', () => {
    it('should emit click event', async () => {
      // Test implementation
    });
  });

  describe('Accessibility', () => {
    it('should have no a11y violations', async () => {
      // Test implementation
    });
  });
});
```

For detailed testing guidelines, see:

- [Vue Testing Guide](./tests/TESTING_GUIDE.md)
- [React Testing Guide](./tests/REACT_TESTING_GUIDE.md)

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(vue): add disabled state to Button component"

# Bug fix
git commit -m "fix(react): correct Input validation logic"

# Documentation
git commit -m "docs: update Button component API reference"

# Multiple changes
git commit -m "feat(core): add new theme utility functions

- Add setThemeColors function
- Add getThemeColor function
- Update theme documentation

Closes #123"
```

## 🔍 Pull Request Process

### Before Submitting

1. ✅ Ensure all tests pass: `pnpm test`
2. ✅ Lint your code: `pnpm lint`
3. ✅ Build packages: `pnpm build`
4. ✅ Update documentation if needed
5. ✅ Add tests for new features
6. ✅ Update ROADMAP.md if adding new components

### PR Template

When creating a PR, include:

- **Description**: What changes were made and why
- **Type**: Feature, Bug Fix, Documentation, etc.
- **Related Issues**: Link to related issues
- **Breaking Changes**: List any breaking changes
- **Checklist**:
  - [ ] Tests added/updated
  - [ ] Documentation updated
  - [ ] All tests passing
  - [ ] No linting errors

### Review Process

1. Automated checks will run (tests, linting)
2. Maintainers will review your code
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing opinions and experiences

### Getting Help

- **Documentation**: Check our docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (if available)

### Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Minimal steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node version, browser (if applicable)
6. **Screenshots**: If applicable

### Feature Requests

When requesting features:

1. **Use Case**: Describe the use case
2. **Proposed Solution**: Your proposed implementation
3. **Alternatives**: Alternative solutions you've considered
4. **Impact**: Who will benefit from this feature

## 📚 Additional Resources

- [Development Guide](./DEVELOPMENT.md) - Detailed development documentation
- [Testing Guide](./tests/TESTING_GUIDE.md) - Vue testing documentation
- [React Testing Guide](./tests/REACT_TESTING_GUIDE.md) - React testing documentation
- [Roadmap](./ROADMAP.md) - Project roadmap and progress
- [Component Documentation](./docs/components/) - Individual component docs

## 🙏 Thank You

Your contributions make Tigercat better for everyone. We appreciate your time and effort!

---

**Questions?** Feel free to ask in GitHub Discussions or create an issue.
