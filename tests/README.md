# Tigercat Component Tests

This directory contains comprehensive test suites for all Vue and React components in the Tigercat UI library.

## Structure

```
tests/
├── vue/                # Vue component test files
│   ├── Button.spec.ts
│   ├── Input.spec.ts
│   └── ...
├── react/              # React component test files
│   ├── Button.spec.tsx
│   ├── Input.spec.tsx
│   └── ...
├── utils/              # Shared test utilities and helpers
│   ├── render-helpers.ts        # Vue render helpers
│   ├── render-helpers-react.ts  # React render helpers
│   ├── a11y-helpers.ts
│   ├── theme-helpers.ts
│   ├── test-fixtures.ts
│   └── index.ts
├── setup.ts            # Global test setup
├── TESTING_GUIDE.md    # Vue testing guide
├── REACT_TESTING_GUIDE.md  # React testing guide
├── COMPONENT_TEST_CHECKLIST.md  # Vue test progress
└── REACT_COMPONENT_TEST_CHECKLIST.md  # React test progress
```

## Running Tests

```bash
# Run all tests (Vue and React)
pnpm test

# Run Vue tests only
pnpm test tests/vue

# Run React tests only
pnpm test tests/react

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Button.spec
```

## Framework-Specific Guides

### Vue Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive Vue testing guidelines.

**Quick Start:**
- Test template: `vue/ComponentTemplate.spec.ts.template`
- Example test: `vue/Button.spec.ts`
- Progress tracker: `COMPONENT_TEST_CHECKLIST.md`

### React Testing
See [REACT_TESTING_GUIDE.md](./REACT_TESTING_GUIDE.md) for comprehensive React testing guidelines.

**Quick Start:**
- Test template: `react/ComponentTemplate.spec.tsx.template`
- Example test: `react/Button.spec.tsx`
- Progress tracker: `REACT_COMPONENT_TEST_CHECKLIST.md`

## Test Structure

Both Vue and React tests follow a similar structure:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Basic rendering tests
  })

  describe('Props', () => {
    // Props validation tests
  })

  describe('Events', () => {
    // Event/handler tests
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

## Test Coverage Requirements

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

## Testing Workflow

### For New Contributors

1. **Read the Testing Guide**:
   - Vue: [TESTING_GUIDE.md](./TESTING_GUIDE.md) or [QUICK_START.md](./QUICK_START.md)
   - React: [REACT_TESTING_GUIDE.md](./REACT_TESTING_GUIDE.md) or [REACT_QUICK_START.md](./REACT_QUICK_START.md)

2. **Look at Examples**:
   - Vue: `vue/Button.spec.ts`
   - React: `react/Button.spec.tsx`

3. **Run Tests in Watch Mode**:
   ```bash
   pnpm test
   ```

4. **Use Test UI for Debugging**:
   ```bash
   pnpm test:ui
   ```

### Writing Tests for New Components

1. Create test file in appropriate directory:
   - Vue: `tests/vue/YourComponent.spec.ts`
   - React: `tests/react/YourComponent.spec.tsx`

2. Follow the standard test structure:
   ```typescript
   describe('YourComponent', () => {
     describe('Rendering', () => { /* ... */ })
     describe('Props', () => { /* ... */ })
     describe('Events', () => { /* ... */ })
     describe('States', () => { /* ... */ })
     describe('Theme Support', () => { /* ... */ })
     describe('Accessibility', () => { /* ... */ })
     describe('Snapshots', () => { /* ... */ })
   })
   ```

3. Use helper functions from `tests/utils/`:
   - `renderWithProps(component, props)`
   - `expectNoA11yViolations(container)`
   - `setThemeVariables(variables)`

4. Run your tests:
   ```bash
   pnpm test YourComponent
   ```

5. Update the test checklist:
   - Vue: [COMPONENT_TEST_CHECKLIST.md](./COMPONENT_TEST_CHECKLIST.md)
   - React: [REACT_COMPONENT_TEST_CHECKLIST.md](./REACT_COMPONENT_TEST_CHECKLIST.md)

## Troubleshooting Tests

### Common Issues

#### 1. Tests Failing After Changes

**Problem**: Tests fail after updating dependencies or making changes.

**Solution**:
```bash
# Clear Vitest cache
rm -rf node_modules/.vitest

# Rebuild packages
pnpm build

# Rerun tests
pnpm test
```

#### 2. Accessibility Tests Failing

**Problem**: `jest-axe` reports violations you can't see.

**Solution**:
- Run tests with UI: `pnpm test:ui`
- Check the detailed violation messages
- Use browser dev tools to inspect the rendered component
- Refer to [WCAG guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

#### 3. Snapshot Mismatches

**Problem**: Snapshot tests fail after intentional changes.

**Solution**:
```bash
# Review the snapshot diff carefully
pnpm test -- -u  # Update snapshots (only if changes are intentional)
```

#### 4. Flaky Tests

**Problem**: Tests pass/fail inconsistently.

**Solution**:
- Use `waitFor` for async operations
- Avoid relying on timing (use proper async utilities)
- Ensure tests are independent (no shared state)
- Use `beforeEach`/`afterEach` for setup/cleanup

#### 5. Component Not Rendering

**Problem**: Test can't find rendered component.

**Solution**:
```typescript
// Debug by logging the rendered output
const { container } = render(Component)
console.log(container.innerHTML)

// Use screen.debug() for better formatting
import { screen } from '@testing-library/vue'
screen.debug()
```

### Getting Help

- Check existing test files for examples
- Read [Vue Testing Library docs](https://testing-library.com/docs/vue-testing-library/intro/)
- Read [React Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/)
- Search [GitHub Issues](https://github.com/expcats/Tigercat/issues)
- Ask in [GitHub Discussions](https://github.com/expcats/Tigercat/discussions)

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
