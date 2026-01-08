# GitHub Copilot Instructions for Tigercat

<!--
STRUCTURE NAVIGATION TAGS:
#core-utilities #vue-components #react-components #types #theme #testing #documentation #examples
-->

When working on issues:

- Start directly with meaningful implementation work
- Use `report_progress` only when you have actual code changes to commit
- Skip empty planning commits - integrate planning into your first substantial commit
- Your first commit should contain real changes, not just a checklist

## Project Overview

Tigercat is a Tailwind CSS-based UI component library supporting both Vue 3 and React. This is a TypeScript monorepo managed with pnpm workspaces.

## Project Structure Overview

```
tigercat/
├── packages/
│   ├── core/           # Core utilities (@tigercat/core)
│   ├── vue/            # Vue 3 components (@tigercat/vue)
│   └── react/          # React components (@tigercat/react)
├── docs/               # Component documentation
├── examples/           # Usage examples and demos
├── tests/              # Test suites and testing utilities
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Detailed Directory Structure & Functionality

### Core Package Structure (`packages/core/`)

**Purpose**: Framework-agnostic utilities, types, and theme configuration shared by both Vue and React implementations.

| Path                       | Content/Functionality                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| `packages/core/src/utils/` | Shared utility functions (className merging, form validation, grid calculations, input styling) |
| `packages/core/src/types/` | TypeScript type definitions for all component prop interfaces                                   |
| `packages/core/src/theme/` | Theme configuration and CSS variable management                                                 |
| `packages/core/dist/`      | Build output (generated)                                                                        |

**When to modify**: Adding shared utilities, defining component types, modifying theme utilities

### Vue Package Structure (`packages/vue/`)

**Purpose**: Vue 3 component implementations using Composition API with `<script setup>` syntax.

| Path                           | Content/Functionality                                           |
| ------------------------------ | --------------------------------------------------------------- |
| `packages/vue/src/components/` | Vue component files organized by category (Basic, Form, Layout) |
| `packages/vue/src/index.ts`    | Re-exports all Vue components and core utilities                |
| `packages/vue/dist/`           | Build output (generated)                                        |

**When to modify**: Implementing Vue 3 components, fixing Vue-specific bugs, adding Vue-specific features (slots, emits, directives)

### React Package Structure (`packages/react/`)

**Purpose**: React component implementations using functional components with hooks.

| Path                             | Content/Functionality                                             |
| -------------------------------- | ----------------------------------------------------------------- |
| `packages/react/src/components/` | React component files organized by category (Basic, Form, Layout) |
| `packages/react/src/index.tsx`   | Re-exports all React components, types, and core utilities        |
| `packages/react/dist/`           | Build output (generated)                                          |

**When to modify**: Implementing React components, fixing React-specific bugs, adding React-specific features (hooks, context, refs)

### Documentation Structure (`docs/`)

| Path               | Content/Functionality                                              |
| ------------------ | ------------------------------------------------------------------ |
| `docs/components/` | Component API documentation with props, events, and usage examples |
| `docs/theme.md`    | Theme system documentation and customization guide                 |

### Examples & Demos (`examples/`)

| Path                 | Content/Functionality           |
| -------------------- | ------------------------------- |
| `examples/demo/`     | Interactive demo applications   |
| `examples/README.md` | How to run and use the examples |

### Testing Structure (`tests/`)

| Path                                      | Content/Functionality                             |
| ----------------------------------------- | ------------------------------------------------- |
| `tests/vue/`                              | Vue component unit and integration tests          |
| `tests/react/`                            | React component unit and integration tests        |
| `tests/utils/`                            | Shared test utilities and helpers (Vue and React) |
| `tests/utils/render-helpers.ts`           | Vue-specific render helpers                       |
| `tests/utils/render-helpers-react.ts`     | React-specific render helpers                     |
| `tests/utils/a11y-helpers.ts`             | Accessibility testing utilities                   |
| `tests/utils/theme-helpers.ts`            | Theme testing utilities                           |
| `tests/utils/test-fixtures.ts`            | Common test data and fixtures                     |
| `tests/setup.ts`                          | Vitest global configuration                       |
| `tests/TESTING_GUIDE.md`                  | Vue testing guide                                 |
| `tests/REACT_TESTING_GUIDE.md`            | React testing guide                               |
| `tests/COMPONENT_TEST_CHECKLIST.md`       | Vue component test progress                       |
| `tests/REACT_COMPONENT_TEST_CHECKLIST.md` | React component test progress                     |

## Package Responsibilities Summary

### `@tigercat/core` - Core Utilities & Types

- Framework-agnostic utilities, TypeScript type definitions, theme configuration
- No external dependencies (pure TypeScript)
- Re-exported by both `@tigercat/vue` and `@tigercat/react`
- Changes affect both Vue and React packages

### `@tigercat/vue` - Vue 3 Components

- Vue 3 component implementations using Composition API
- Depends on: `@tigercat/core` (workspace), `vue` (peer dependency)
- Component style: `<script setup>`, slots for content, kebab-case events

### `@tigercat/react` - React Components

- React component implementations using functional components and hooks
- Depends on: `@tigercat/core` (workspace), `react` (peer dependency)
- Component style: Functional components, children prop, camelCase event handlers

## Decision Guide: Where to Add/Modify Code

### Adding a New Component

1. **Core** (`packages/core/src/`): Create type definitions, shared utilities, theme config
2. **Vue** (`packages/vue/src/components/`): Implement Vue component using Composition API
3. **React** (`packages/react/src/components/`): Implement React component using hooks
4. **Documentation** (`docs/components/`): Document API, props, events, examples
5. **Tests** (`tests/`): Add component and utility tests

### Modifying Existing Code

- **Framework-agnostic** (types, utilities, theme): Modify `packages/core/src/`
- **Vue-specific**: Modify `packages/vue/src/components/`
- **React-specific**: Modify `packages/react/src/components/`

### Adding Utilities

- **Shared utilities**: Add to `packages/core/src/utils/`
- **Vue-only utilities**: Add to `packages/vue/src/`
- **React-only utilities**: Add to `packages/react/src/`

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
- Pay attention to syntax punctuation when editing code:
  - Correctly add `,` between object properties/array items and in import/export lists.
  - Follow the existing file style for `;` in TS/TSX (this repo generally omits semicolons).
  - Use `;` where the language requires it (e.g., CSS declarations).

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

#### Complex Component Patterns

For components with advanced interactions (file handling, date/time selection, rich text editing, etc.):

**General Guidelines**:

- Extract validation and formatting logic to `@tigercat/core/utils`
- Support keyboard navigation and accessibility
- Implement proper focus management
- Validate input ranges and constraints
- Support different formats and locales where applicable
- Provide clear visual feedback for user interactions

**Best Practices**:

- Break down into smaller sub-components when possible
- Use shared utilities for validation and formatting
- Implement comprehensive TypeScript types
- Provide extensive examples in documentation
- Include edge case handling (empty states, errors, limits)
- Test thoroughly including accessibility

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

#### General Testing Principles

- Write tests for all components (both Vue and React)
- Test component behavior, not implementation details
- Include accessibility tests with jest-axe
- Test edge cases and error states
- Maintain test independence and reproducibility

#### Vue Component Testing

- **Location**: `tests/vue/[ComponentName].spec.ts`
- **Framework**: @testing-library/vue with Vitest
- **Style**: Use `renderWithProps`, `renderWithSlots` helpers
- **Events**: Test emitted events with kebab-case names
- **Guide**: See `tests/TESTING_GUIDE.md`
- **Example**: `tests/vue/Button.spec.ts`

#### React Component Testing

- **Location**: `tests/react/[ComponentName].spec.tsx`
- **Framework**: @testing-library/react with Vitest
- **Style**: Use `renderWithProps`, `renderWithChildren` helpers
- **Events**: Test event handler props (onClick, onChange, etc.)
- **User Interactions**: Prefer `userEvent` over `fireEvent`
- **Guide**: See `tests/REACT_TESTING_GUIDE.md`
- **Example**: `tests/react/Button.spec.tsx`

#### Test Structure (Consistent for Both Frameworks)

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Basic rendering tests
  });

  describe('Props', () => {
    // Props validation tests
  });

  describe('Events', () => {
    // Event/handler tests
  });

  describe('States', () => {
    // Different states (disabled, loading, etc.)
  });

  describe('Theme Support', () => {
    // Theme customization tests
  });

  describe('Accessibility', () => {
    // a11y tests with jest-axe
  });

  describe('Snapshots', () => {
    // Snapshot tests for regression
  });
});
```

#### Shared Test Utilities

- **Accessibility**: `expectNoA11yViolations`, `expectProperAriaLabels`
- **Theme**: `setThemeVariables`, `clearThemeVariables`
- **Fixtures**: `buttonVariants`, `componentSizes`, `inputTypes`

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

#### Documentation for Complex Components

For components with advanced features, documentation should include:

- **Multiple usage examples**: Basic usage and advanced features
- **Feature-specific guidance**: Special behaviors, constraints, and limitations
- **Event patterns**: Change handlers with relevant parameters
- **v-model binding**: For Vue components with two-way data binding
- **Controlled/uncontrolled modes**: For React components with state management examples
- **Validation examples**: Input validation, constraints, and error handling

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

1. **Core utilities** (`@tigercat/core`): Create shared utilities, types, and helpers

   - Add TypeScript types in `packages/core/src/types/[component].ts`
   - Add utilities in `packages/core/src/utils/[component]-utils.ts` (if needed)
   - Export from `packages/core/src/index.ts`

2. **Vue component** (`packages/vue/src/components/`):

   - Create component file: `[ComponentName].ts` (using `<script setup>`)
   - Use v-model for two-way binding where appropriate
   - Emit kebab-case events
   - Export from `packages/vue/src/index.ts`

3. **React component** (`packages/react/src/components/`):

   - Create component file: `[ComponentName].tsx`
   - Use controlled/uncontrolled patterns
   - Use camelCase event handlers
   - Export from `packages/react/src/index.tsx`

4. **Tests**:

   - Vue tests in `tests/vue/[ComponentName].spec.ts`
   - React tests in `tests/react/[ComponentName].spec.tsx`
   - Update test checklists with completion status

5. **Documentation** (`docs/components/`):

   - Create `[component].md` with API docs and examples
   - Include both Vue and React usage examples
   - Document all props, events, and special behaviors

6. **Update progress**:
   - Mark component status in `ROADMAP.md`
   - Update test checklists when tests are complete
   - Add demo pages in `examples/demo/vue3/` and `examples/demo/react/`

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
bg: 'bg-[var(--tiger-primary,#2563eb)]';

// Good: Hover state
bgHover: 'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]';

// Good: Multiple states
disabled: 'disabled:bg-[var(--tiger-primary-disabled,#93c5fd)]';
```

### Theme Utilities

Use the provided theme utilities from `@tigercat/core`:

```typescript
import { setThemeColors, getThemeColor, THEME_CSS_VARS } from '@tigercat/core';

// Set theme colors programmatically
setThemeColors({
  primary: '#10b981',
  primaryHover: '#059669',
  primaryDisabled: '#6ee7b7',
});

// Get current theme color
const currentPrimary = getThemeColor('primary');
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
export function classNames(
  ...classes: (string | undefined | null | false)[]
): string {
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
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}>
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

## Maintaining Documentation

### When to Update copilot-instructions.md

This file should be updated when:

1. **New component patterns emerge**: If a new component introduces a pattern that should be followed by future components

2. **New utilities or helpers are added**: When adding shared utilities in `@tigercat/core` that establish new patterns

3. **Testing conventions change**: When new testing utilities, patterns, or requirements are introduced

4. **Project structure changes**: When directories are reorganized or new packages are added

5. **Development workflow updates**: When new commands, tools, or processes are introduced

6. **Best practices evolve**: When the team establishes new coding standards or conventions

**What NOT to include**:

- Specific component implementations (use component docs instead)
- Temporary workarounds
- Personal preferences that aren't team standards
- Overly specific details that may change frequently

### Updating Other Documentation

**ROADMAP.md**: Update when components are completed (Vue ✅, React ✅, Docs ✅, Tests ✅)

**README.md**: Update for:

- Major feature additions
- Changes to setup/installation process
- New testing documentation
- Project structure changes

**Test Checklists**: Update when:

- Tests are completed for a component
- Test count changes
- Progress percentages need recalculation
- New test patterns are established
