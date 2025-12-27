# GitHub Copilot Instructions for Tigercat

## ⚠️ Important: No "Initial Plan" Commits

When working on issues:
- Start directly with meaningful implementation work
- Use `report_progress` only when you have actual code changes to commit
- Skip empty planning commits - integrate planning into your first substantial commit
- Your first commit should contain real changes, not just a checklist

## Project Overview

Tigercat is a Tailwind CSS-based UI component library supporting both Vue 3 and React. This is a TypeScript monorepo managed with pnpm workspaces.

## Project Structure

```
tigercat/
├── packages/
│   ├── core/           # Core utilities (@tigercat/core)
│   ├── vue/            # Vue 3 components (@tigercat/vue)
│   └── react/          # React components (@tigercat/react)
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Technology Stack

- **Language**: TypeScript (strict mode enabled)
- **Package Manager**: pnpm (>=8.0.0)
- **Node Version**: >=18.0.0
- **UI Framework**: Vue 3 and React
- **Styling**: Tailwind CSS
- **Build Tool**: tsup
- **Linting**: ESLint with TypeScript plugin

## Code Style & Conventions

### TypeScript

- Use strict TypeScript mode
- Target ES2020
- Use ESNext modules
- Enable all strict type-checking options
- Prefer interfaces over types when defining object shapes
- Use explicit return types for public functions
- Avoid using `any` - use `unknown` or proper types instead (warnings enabled)
- Use underscore prefix for intentionally unused parameters (e.g., `_context`)

### Imports & Exports

- Use ES modules (`import`/`export`)
- Use named exports for utilities and components
- Default exports are acceptable for main component files in Vue/React packages
- Import order: external dependencies, then internal modules
- Use path aliases when configured

### File Naming

- Use kebab-case for component files: `button.vue`, `input.tsx`
- Use kebab-case for utility files: `class-utils.ts`, `dom-helpers.ts`
- Use PascalCase for component names in code
- Use `.ts` for TypeScript files, `.tsx` for React components, `.vue` for Vue components

### Component Development

#### General Principles

- Each component should be framework-agnostic in core logic when possible
- Share utilities and types through `@tigercat/core` package
- Follow composition over inheritance pattern
- Keep components small and focused on single responsibility
- Support both controlled and uncontrolled modes where applicable

#### Vue 3 Components

- Use Composition API with `<script setup>` syntax
- Use TypeScript with `defineProps`, `defineEmits`, `defineExpose`
- Use `ref` and `reactive` appropriately
- Prefer `computed` for derived state
- Use `v-bind="$attrs"` for transparent wrapper components
- Emit events with kebab-case names
- Use slots for content composition

#### React Components

- Use functional components with hooks
- Use TypeScript for prop types
- Prefer named exports for components
- Use `React.FC` or explicit prop types
- Implement proper prop spreading for wrapper components
- Use camelCase for event handler props (e.g., `onClick`, `onChange`)
- Use children prop for content composition

### Styling

- Use Tailwind CSS utility classes
- Follow Tailwind's responsive design patterns
- Use Tailwind's color system with CSS variables for theme support
- Avoid inline styles unless absolutely necessary
- Keep component-specific styles minimal
- Use consistent spacing scale from Tailwind
- Support theme customization through CSS variables (e.g., `--tiger-primary`, `--tiger-primary-hover`)
- Use arbitrary values with CSS variables for theming: `bg-[var(--tiger-primary,#2563eb)]`

### Testing

- Write tests for all components
- Test both Vue and React implementations
- Test component behavior, not implementation details
- Include accessibility tests
- Test edge cases and error states

### Documentation

Each component must include:

- API documentation (props, events, slots/children)
- Usage examples
- Code snippets for both Vue and React
- TypeScript type definitions
- Props/parameters description
- Events documentation (if applicable)
- Styling customization guide
- Accessibility notes

### Error Handling

- Validate props with TypeScript
- Provide helpful error messages
- Handle edge cases gracefully
- Use console warnings for development guidance
- Don't crash on invalid props, use sensible defaults

### Accessibility

- Follow ARIA best practices
- Support keyboard navigation
- Provide appropriate ARIA labels and roles
- Test with screen readers
- Ensure proper color contrast
- Support focus management

## Development Workflow

### Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (watch mode)
pnpm dev

# Lint code
pnpm lint

# Clean build artifacts
pnpm clean
```

### Adding New Components

1. Start with core utilities in `@tigercat/core` if needed
2. Implement Vue component in `packages/vue/src/`
3. Implement React component in `packages/react/src/`
4. Add TypeScript types and interfaces
5. Write tests for both frameworks
6. Document the component
7. Update ROADMAP.md progress

### Monorepo Guidelines

- Changes to `@tigercat/core` affect both Vue and React packages
- Each package has its own build process
- Use pnpm workspace protocol for internal dependencies: `workspace:*`
- Build packages in dependency order (core → vue/react)

## Component Priority

Follow the development roadmap in ROADMAP.md:

1. **Phase 1 (High Priority)**: Basic components, Form components, Layout components
2. **Phase 2 (Medium Priority)**: Data display components, Navigation components
3. **Phase 3 (Low Priority)**: Feedback components, Other components

## Theme System

Tigercat uses a CSS variable-based theme system that allows real-time color customization without recompilation.

### CSS Variables

Theme colors are defined using CSS variables with fallback values:

- `--tiger-primary` - Primary color (default: #2563eb)
- `--tiger-primary-hover` - Primary hover color (default: #1d4ed8)
- `--tiger-primary-disabled` - Primary disabled color (default: #93c5fd)
- `--tiger-secondary` - Secondary color (default: #4b5563)
- `--tiger-secondary-hover` - Secondary hover color (default: #374151)
- `--tiger-secondary-disabled` - Secondary disabled color (default: #9ca3af)
- `--tiger-outline-bg-hover` - Outline variant hover background (default: #eff6ff)
- `--tiger-ghost-bg-hover` - Ghost variant hover background (default: #eff6ff)

### Using CSS Variables in Components

Use Tailwind's arbitrary value syntax with CSS variables:

```typescript
// Good: CSS variable with fallback
bg: 'bg-[var(--tiger-primary,#2563eb)]'

// Good: Hover state
bgHover: 'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]'

// Good: Multiple states
disabled: 'disabled:bg-[var(--tiger-primary-disabled,#93c5fd)]'
```

### Theme Utilities

Use the provided theme utilities from `@tigercat/core`:

```typescript
import { setThemeColors, getThemeColor, THEME_CSS_VARS } from '@tigercat/core'

// Set theme colors programmatically
setThemeColors({
  primary: '#10b981',
  primaryHover: '#059669',
  primaryDisabled: '#6ee7b7',
})

// Get current theme color
const currentPrimary = getThemeColor('primary')
```

## Best Practices

- Write self-documenting code with clear variable and function names
- Keep functions small and focused
- Avoid deep nesting
- Use early returns to reduce complexity
- Comment only when necessary to explain "why", not "what"
- Follow DRY (Don't Repeat Yourself) principle
- Optimize for readability over cleverness
- Consider performance for frequently used components
- Support tree-shaking for optimal bundle size
- Use semantic versioning for releases
- Always use CSS variables for colors to support theme customization
- Provide sensible fallback values for all CSS variables
- Export theme-related utilities from `@tigercat/core` for use in both Vue and React packages

## Common Patterns

### Utility Functions (in @tigercat/core)

```typescript
// Export utilities as named exports
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

### Vue Component Template

```vue
<script setup lang="ts">
import { computed } from 'vue';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  // Component logic
});
</script>

<template>
  <button :class="buttonClasses" @click="emit('click', $event)">
    <slot />
  </button>
</template>
```

### React Component Template

```typescript
import React from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  ...props
}) => {
  // Component logic
  const buttonClasses = ''; // computed classes

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
```

## Git Conventions

- Use conventional commits format
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issues in commit messages when applicable
- When using report_progress for the first time, include actual changes rather than just a planning checklist
- Skip creating empty planning commits - go directly to implementation

## Questions or Clarifications

When unsure about implementation details:

- Check existing component implementations for patterns
- Refer to ROADMAP.md for project scope
- Follow established conventions in the codebase
- Maintain consistency with existing code style
