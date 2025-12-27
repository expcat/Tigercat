# Vue Component Testing Guide

## Overview

This document provides comprehensive guidelines for testing Vue components in the Tigercat UI library.

## Test Infrastructure

The testing infrastructure includes:

- **Test Runner**: Vitest with happy-dom environment
- **Testing Library**: @testing-library/vue for component testing
- **Accessibility**: jest-axe for automated a11y testing
- **DOM Assertions**: @testing-library/jest-dom for enhanced matchers

## Test Structure Template

Every component test file should follow this structure:

```typescript
/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ComponentName } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  // Import other utilities as needed
} from '../utils'

describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      // Test basic rendering
    })
  })

  describe('Props', () => {
    // Test all props combinations
  })

  describe('Events', () => {
    // Test event emissions
  })

  describe('States', () => {
    // Test different states (disabled, loading, error, etc.)
  })

  describe('Theme Support', () => {
    // Test theme customization
  })

  describe('Accessibility', () => {
    // Test accessibility features
  })

  describe('Snapshots', () => {
    // Snapshot tests for major variants
  })
})
```

## Test Categories

### 1. Rendering Tests

Verify that the component renders correctly with default and custom configurations.

```typescript
describe('Rendering', () => {
  it('should render with default props', () => {
    const { getByRole } = render(Component, {
      slots: { default: 'Content' }
    })
    
    expect(getByRole('button')).toBeInTheDocument()
  })

  it('should render with custom slot content', () => {
    const { getByText } = renderWithSlots(Component, {
      default: 'Custom Content'
    })
    
    expect(getByText('Custom Content')).toBeInTheDocument()
  })
})
```

### 2. Props Tests

Test all prop combinations, including edge cases and boundary values.

```typescript
describe('Props', () => {
  it.each(['sm', 'md', 'lg'])('should apply %s size correctly', (size) => {
    const { container } = renderWithProps(Component, { size })
    const element = container.querySelector('[role="button"]')
    expect(element).toBeInTheDocument()
  })

  it('should handle invalid props gracefully', () => {
    // Test with invalid prop values
  })
})
```

### 3. Events Tests

Verify that all events are emitted correctly with proper payloads.

```typescript
describe('Events', () => {
  it('should emit click event when clicked', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(Component, {
      props: { onClick: handleClick },
      slots: { default: 'Click me' }
    })
    
    await fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should emit event with correct payload', async () => {
    const handleChange = vi.fn()
    // Test event payload structure
  })
})
```

### 4. States Tests

Test different component states like disabled, loading, error, etc.

```typescript
describe('States', () => {
  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = renderWithProps(
      Component,
      { disabled: true },
      { slots: { default: 'Disabled' } }
    )
    
    expect(getByRole('button')).toBeDisabled()
  })

  it('should show loading state', () => {
    const { container } = renderWithProps(
      Component,
      { loading: true }
    )
    
    const spinner = container.querySelector('svg')
    expect(spinner).toHaveClass('animate-spin')
  })
})
```

### 5. Theme Support Tests

Test that components support theme customization via CSS variables.

```typescript
describe('Theme Support', () => {
  afterEach(() => {
    clearThemeVariables(['--tiger-primary', '--tiger-primary-hover'])
  })

  it('should support custom theme colors', () => {
    setThemeVariables({
      '--tiger-primary': '#ff0000',
      '--tiger-primary-hover': '#cc0000',
    })

    const { container } = renderWithProps(Component, { variant: 'primary' })
    
    const rootStyles = window.getComputedStyle(document.documentElement)
    expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
  })
})
```

### 6. Accessibility Tests

Ensure components meet WCAG accessibility guidelines.

```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(Component, {
      slots: { default: 'Accessible Component' }
    })
    
    await expectNoA11yViolations(container)
  })

  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(Component)
    const element = getByRole('button')
    
    expectProperAriaLabels(element, {
      'aria-label': 'Expected label',
      'aria-pressed': null, // Should not have this attribute
    })
  })

  it('should be keyboard accessible', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(Component, {
      props: { onClick: handleClick }
    })
    
    const button = getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
  })
})
```

### 7. Snapshot Tests

Capture snapshots of major component variants for regression testing.

```typescript
describe('Snapshots', () => {
  it('should match snapshot for default state', () => {
    const { container } = render(Component, {
      slots: { default: 'Default' }
    })
    
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot for each variant', () => {
    const variants = ['primary', 'secondary', 'outline']
    
    variants.forEach(variant => {
      const { container } = renderWithProps(Component, { variant })
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
```

## Testing Best Practices

### 1. Use Semantic Queries

Prefer queries that reflect how users interact with your app:

```typescript
// ✅ Good - Uses accessible queries
const button = getByRole('button', { name: 'Submit' })
const input = getByLabelText('Email')

// ❌ Avoid - Uses implementation details
const button = getByTestId('submit-button')
const input = container.querySelector('input')
```

### 2. Test User Behavior

Focus on testing what users see and do:

```typescript
// ✅ Good - Tests user interaction
it('should disable submit when form is invalid', async () => {
  const { getByRole } = render(Form)
  const submit = getByRole('button', { name: 'Submit' })
  expect(submit).toBeDisabled()
})

// ❌ Avoid - Tests implementation
it('should have isValid state as false', () => {
  const wrapper = render(Form)
  expect(wrapper.vm.isValid).toBe(false)
})
```

### 3. Keep Tests Independent

Each test should be able to run independently:

```typescript
describe('Component', () => {
  // ✅ Good - Each test is independent
  it('test 1', () => {
    const { getByRole } = render(Component)
    // Test logic
  })

  it('test 2', () => {
    const { getByRole } = render(Component)
    // Test logic
  })
})
```

### 4. Use beforeEach/afterEach for Cleanup

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Setup code
  })

  afterEach(() => {
    // Cleanup code
    clearThemeVariables(['--tiger-primary'])
  })
})
```

### 5. Test Edge Cases

Always test boundary conditions and error states:

```typescript
it('should handle empty state', () => {
  const { container } = renderWithProps(List, { items: [] })
  expect(container.querySelector('.empty-state')).toBeInTheDocument()
})

it('should handle very long text', () => {
  const longText = 'a'.repeat(1000)
  const { getByText } = render(Component, {
    slots: { default: longText }
  })
  // Verify truncation or overflow handling
})
```

## Available Test Utilities

### Render Helpers

- **renderComponent(component, options)**: Basic render with default setup
- **renderWithProps(component, props, options)**: Render with specific props
- **renderWithSlots(component, slots, options)**: Render with slot content
- **createWrapper(component, wrapper)**: Create a wrapped component

### Accessibility Helpers

- **axe(container)**: Run axe accessibility tests
- **expectNoA11yViolations(container)**: Assert no a11y violations  
- **expectProperAriaLabels(element, attributes)**: Check ARIA attributes
- **testKeyboardNavigation(element, keys)**: Test keyboard interactions

### Theme Helpers

- **setThemeVariables(variables)**: Set CSS variables for testing
- **clearThemeVariables(variables)**: Clear CSS variables
- **getComputedStyles(element)**: Get element's computed styles
- **expectThemeColor(element, variable, color)**: Test theme colors
- **themeTestCases**: Predefined theme test cases

### Test Fixtures

- **buttonVariants**: Array of button variant names
- **componentSizes**: Array of component sizes
- **inputTypes**: Array of input types
- **createMockHandlers()**: Create mock event handlers
- **waitForNextTick()**: Wait for next event loop tick
- **waitFor(condition)**: Wait for a condition to be true
- **testLabels**: Common test labels
- **commonClasses**: Common CSS classes to check

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (default for `pnpm test`)
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test Button.spec.ts

# Run tests matching pattern
pnpm test --grep "should render"

# Update snapshots
pnpm test -u
```

## Debugging Tests

### Using Vitest UI

```bash
pnpm test:ui
```

This opens a web interface where you can:
- View test results
- Debug failed tests
- Inspect component output
- Re-run specific tests

### Console Debugging

```typescript
it('should render correctly', () => {
  const { container, debug } = render(Component)
  
  // Print DOM tree to console
  debug()
  
  // Print specific element
  debug(container.querySelector('button'))
})
```

### Breakpoint Debugging

```typescript
it('should handle click', async () => {
  const handleClick = vi.fn()
  const { getByRole } = render(Component, {
    props: { onClick: handleClick }
  })
  
  debugger // Pauses execution when running with --inspect
  
  await fireEvent.click(getByRole('button'))
})
```

## Common Patterns

### Testing Form Components

```typescript
describe('Input', () => {
  it('should update value on user input', async () => {
    const handleInput = vi.fn()
    const { getByRole } = render(Input, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': handleInput
      }
    })
    
    const input = getByRole('textbox')
    await fireEvent.update(input, 'new value')
    
    expect(handleInput).toHaveBeenCalledWith('new value')
  })
})
```

### Testing Conditional Rendering

```typescript
it('should show error message when invalid', () => {
  const { getByText, rerender } = render(Input, {
    props: { error: '' }
  })
  
  expect(() => getByText('Error')).toThrow()
  
  rerender({ error: 'Invalid input' })
  expect(getByText('Invalid input')).toBeInTheDocument()
})
```

### Testing Async Behavior

```typescript
it('should load data asynchronously', async () => {
  const { getByText } = render(AsyncComponent)
  
  expect(getByText('Loading...')).toBeInTheDocument()
  
  await waitFor(() => {
    expect(getByText('Data loaded')).toBeInTheDocument()
  })
})
```

## Coverage Goals

Aim for:
- **Line Coverage**: >80%
- **Branch Coverage**: >75%
- **Function Coverage**: >80%

Focus on meaningful coverage rather than 100% coverage. Some code paths (like error handling for impossible states) may not need tests.

## Updating Tests

When updating component behavior:

1. Run existing tests to identify failures
2. Update tests to match new behavior
3. Add new tests for new features
4. Update snapshots if UI changes: `pnpm test -u`
5. Verify all tests pass
6. Check coverage hasn't decreased

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
