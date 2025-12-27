# Tigercat Vue Component Tests

This directory contains comprehensive test suites for all Vue components in the Tigercat UI library.

## Structure

```
tests/
├── vue/              # Vue component test files
│   ├── Button.spec.ts
│   ├── Input.spec.ts
│   └── ...
├── utils/            # Test utilities and helpers
│   ├── render-helpers.ts
│   ├── a11y-helpers.ts
│   ├── theme-helpers.ts
│   ├── test-fixtures.ts
│   └── index.ts
└── setup.ts          # Global test setup
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Guidelines

### Test Structure

Each component should have its own `.spec.ts` file following this structure:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { ComponentName } from '@tigercat/vue'

describe('ComponentName', () => {
  describe('Rendering', () => {
    // Basic rendering tests
  })

  describe('Props', () => {
    // Props validation tests
  })

  describe('Events', () => {
    // Event emission tests
  })

  describe('States', () => {
    // Different state tests (disabled, loading, etc.)
  })

  describe('Theme Support', () => {
    // Theme customization tests
  })

  describe('Accessibility', () => {
    // a11y tests
  })

  describe('Snapshots', () => {
    // Snapshot tests for major variants
  })
})
```

### Test Coverage

All component tests should cover:

1. **Rendering**: Basic rendering with default and custom props
2. **Props**: All prop combinations and edge cases
3. **Events**: All emitted events and their payloads
4. **Slots**: Default and named slots if applicable
5. **States**: Different states (disabled, loading, error, etc.)
6. **Theme**: Theme customization via CSS variables
7. **Accessibility**: 
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
   - No accessibility violations
8. **Snapshots**: Major use cases and variants

### Writing Tests

#### Basic Rendering Test

```typescript
it('should render with default props', () => {
  const { getByRole } = render(Component, {
    slots: { default: 'Content' }
  })
  
  expect(getByRole('button')).toBeInTheDocument()
})
```

#### Props Testing

```typescript
it('should apply size prop correctly', () => {
  const { container } = renderWithProps(Component, { size: 'lg' })
  expect(container.querySelector('button')).toHaveClass('px-6')
})
```

#### Event Testing

```typescript
it('should emit click event', async () => {
  const handleClick = vi.fn()
  const { getByRole } = render(Component, {
    props: { onClick: handleClick }
  })
  
  await fireEvent.click(getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### Accessibility Testing

```typescript
it('should have no a11y violations', async () => {
  const { container } = render(Component)
  await expectNoA11yViolations(container)
})
```

#### Theme Testing

```typescript
it('should support custom theme', () => {
  setThemeVariables({ '--tiger-primary': '#ff0000' })
  const { container } = render(Component)
  
  // Verify theme is applied
  const styles = getComputedStyles(document.documentElement)
  expect(styles.getPropertyValue('--tiger-primary')).toBe('#ff0000')
})
```

#### Snapshot Testing

```typescript
it('should match snapshot', () => {
  const { container } = render(Component)
  expect(container.firstChild).toMatchSnapshot()
})
```

## Test Utilities

### Render Helpers

- `renderComponent(component, options)` - Render with default setup
- `renderWithProps(component, props, options)` - Render with props
- `renderWithSlots(component, slots, options)` - Render with slots
- `createWrapper(component, wrapper)` - Create wrapped component

### Accessibility Helpers

- `axe(container)` - Run axe accessibility tests
- `expectNoA11yViolations(container)` - Assert no a11y violations
- `expectProperAriaLabels(element, attributes)` - Check ARIA attributes
- `testKeyboardNavigation(element, keys)` - Test keyboard interactions

### Theme Helpers

- `setThemeVariables(variables)` - Set CSS variables
- `clearThemeVariables(variables)` - Clear CSS variables
- `getComputedStyles(element)` - Get computed styles
- `expectThemeColor(element, variable, color)` - Test theme colors
- `themeTestCases` - Common theme test cases

### Test Fixtures

- `buttonVariants` - Common button variants
- `componentSizes` - Common component sizes
- `inputTypes` - Common input types
- `createMockHandlers()` - Create mock event handlers
- `waitForNextTick()` - Wait for next tick
- `waitFor(condition)` - Wait for condition
- `testLabels` - Common test labels
- `commonClasses` - Common CSS classes

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Interactions**: Simulate real user behavior with `fireEvent` from `@testing-library/vue`
4. **Keep Tests Independent**: Each test should run independently
5. **Use Descriptive Names**: Test names should clearly describe what they test
6. **Don't Test Third-Party Code**: Focus on your component logic
7. **Avoid Implementation Details**: Don't test internal state or methods
8. **Test Edge Cases**: Include error states, empty states, boundary values
9. **Maintain Snapshots**: Update snapshots only when changes are intentional

## Debugging Tests

```bash
# Run a specific test file
pnpm test Button.spec.ts

# Run tests matching a pattern
pnpm test --grep "should render"

# Run with verbose output
pnpm test --reporter=verbose

# Run with UI for debugging
pnpm test:ui
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [vitest-axe](https://github.com/chaance/vitest-axe)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

## Contributing

When adding new components:

1. Create a corresponding `.spec.ts` file in `tests/vue/`
2. Follow the test structure outlined above
3. Ensure all test categories are covered
4. Run tests and verify coverage
5. Update this README if adding new utilities or patterns
