# React Component Testing Guide

## Overview

This document provides comprehensive guidelines for testing React components in the Tigercat UI library.

## Test Infrastructure

The testing infrastructure includes:

- **Test Runner**: Vitest with happy-dom environment
- **Testing Library**: @testing-library/react for component testing
- **User Interactions**: @testing-library/user-event for realistic user interactions
- **Accessibility**: jest-axe for automated a11y testing
- **DOM Assertions**: @testing-library/jest-dom for enhanced matchers

## Test Structure Template

Every component test file should follow this structure:

```typescript
/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ComponentName } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
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
    // Test event handlers
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
    const { getByRole } = render(<Button>Click me</Button>)
    
    expect(getByRole('button')).toBeInTheDocument()
  })

  it('should render with custom content', () => {
    const { getByText } = render(<Button>Custom Content</Button>)
    
    expect(getByText('Custom Content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Button className="custom-class">Button</Button>)
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
```

### 2. Props Tests

Test all prop combinations, including edge cases and boundary values.

```typescript
describe('Props', () => {
  it.each(['sm', 'md', 'lg'] as const)('should apply %s size correctly', (size) => {
    const { container } = renderWithProps(Button, { size, children: 'Button' })
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
  })

  it('should handle disabled prop', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>)
    expect(getByRole('button')).toBeDisabled()
  })

  it('should handle loading prop', () => {
    const { container } = render(<Button loading>Loading</Button>)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
```

### 3. Events Tests

Verify that all event handlers are called correctly with proper payloads.

```typescript
describe('Events', () => {
  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(
      <Button onClick={handleClick}>Click me</Button>
    )
    
    await userEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should call onChange handler with correct value', async () => {
    const handleChange = vi.fn()
    const { getByRole } = render(
      <Input onChange={handleChange} />
    )
    
    const input = getByRole('textbox')
    await userEvent.type(input, 'test')
    expect(handleChange).toHaveBeenCalled()
  })

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(
      <Button onClick={handleClick} disabled>Disabled</Button>
    )
    
    await userEvent.click(getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### 4. States Tests

Test different component states like disabled, loading, error, etc.

```typescript
describe('States', () => {
  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>)
    
    expect(getByRole('button')).toBeDisabled()
  })

  it('should show loading state', () => {
    const { container, getByRole } = render(<Button loading>Loading</Button>)
    
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should handle focus state', async () => {
    const { getByRole } = render(<Button>Focus me</Button>)
    const button = getByRole('button')
    
    button.focus()
    expect(button).toHaveFocus()
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

    const { container } = render(<Button variant="primary">Button</Button>)
    
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
    const { container } = render(<Button>Accessible Button</Button>)
    
    await expectNoA11yViolations(container)
  })

  it('should have proper ARIA attributes', () => {
    const { getByRole } = render(<Button aria-label="Close">×</Button>)
    const button = getByRole('button', { name: 'Close' })
    
    expect(button).toHaveAttribute('aria-label', 'Close')
  })

  it('should be keyboard accessible', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(<Button onClick={handleClick}>Button</Button>)
    
    const button = getByRole('button')
    button.focus()
    expect(button).toHaveFocus()
    
    await userEvent.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### 7. Snapshot Tests

Capture snapshots of major component variants for regression testing.

```typescript
describe('Snapshots', () => {
  it('should match snapshot for default state', () => {
    const { container } = render(<Button>Default</Button>)
    
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot for each variant', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const
    
    variants.forEach(variant => {
      const { container } = render(<Button variant={variant}>Button</Button>)
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
it('should disable submit when form is invalid', () => {
  const { getByRole } = render(<Form />)
  const submit = getByRole('button', { name: 'Submit' })
  expect(submit).toBeDisabled()
})

// ❌ Avoid - Tests implementation
it('should have isValid state as false', () => {
  // Testing internal state is an anti-pattern in React Testing Library
})
```

### 3. Use userEvent over fireEvent

Prefer `userEvent` for more realistic user interactions:

```typescript
// ✅ Good - More realistic
await userEvent.click(button)
await userEvent.type(input, 'text')

// ⚠️ Less ideal - Less realistic
await fireEvent.click(button)
await fireEvent.change(input, { target: { value: 'text' } })
```

### 4. Keep Tests Independent

Each test should be able to run independently:

```typescript
describe('Component', () => {
  // ✅ Good - Each test is independent
  it('test 1', () => {
    const { getByRole } = render(<Component />)
    // Test logic
  })

  it('test 2', () => {
    const { getByRole } = render(<Component />)
    // Test logic
  })
})
```

### 5. Use beforeEach/afterEach for Cleanup

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

### 6. Test Edge Cases

Always test boundary conditions and error states:

```typescript
it('should handle empty children', () => {
  const { container } = render(<List />)
  expect(container.querySelector('.empty-state')).toBeInTheDocument()
})

it('should handle very long text', () => {
  const longText = 'a'.repeat(1000)
  const { getByText } = render(<Text>{longText}</Text>)
  // Verify truncation or overflow handling
})
```

## Available Test Utilities

### Render Helpers

- **renderWithProps(Component, props, options)**: Render component with specific props
- **renderWithChildren(Component, children, props, options)**: Render component with children
- **createReactWrapper(WrapperComponent)**: Create a wrapper component for context testing

For basic rendering, use `render()` directly from @testing-library/react.

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
pnpm test Button.spec.tsx

# Run React tests only
pnpm test tests/react

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
  const { container, debug } = render(<Component />)
  
  // Print DOM tree to console
  debug()
  
  // Print specific element
  debug(container.querySelector('button'))
})
```

### Using screen.logTestingPlaygroundURL()

```typescript
it('should render correctly', () => {
  render(<Component />)
  
  // Get a URL to test your queries
  screen.logTestingPlaygroundURL()
})
```

## Common Patterns

### Testing Form Components

```typescript
describe('Input', () => {
  it('should update value on user input', async () => {
    const handleChange = vi.fn()
    const { getByRole } = render(<Input onChange={handleChange} />)
    
    const input = getByRole('textbox')
    await userEvent.type(input, 'new value')
    
    expect(handleChange).toHaveBeenCalled()
  })
})
```

### Testing Controlled Components

```typescript
it('should work as controlled component', async () => {
  const TestComponent = () => {
    const [value, setValue] = React.useState('')
    return (
      <Input 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
      />
    )
  }
  
  const { getByRole } = render(<TestComponent />)
  const input = getByRole('textbox') as HTMLInputElement
  
  await userEvent.type(input, 'test')
  expect(input.value).toBe('test')
})
```

### Testing Conditional Rendering

```typescript
it('should show error message when invalid', () => {
  const { getByText, rerender } = render(<Input error="" />)
  
  expect(() => getByText('Error')).toThrow()
  
  rerender(<Input error="Invalid input" />)
  expect(getByText('Invalid input')).toBeInTheDocument()
})
```

### Testing Async Behavior

```typescript
it('should load data asynchronously', async () => {
  const { getByText, findByText } = render(<AsyncComponent />)
  
  expect(getByText('Loading...')).toBeInTheDocument()
  
  // Use findBy for async elements
  expect(await findByText('Data loaded')).toBeInTheDocument()
})
```

### Testing with Context

```typescript
it('should consume context values', () => {
  const wrapper = createReactWrapper(ThemeProvider)
  
  const { getByRole } = render(
    <ThemeProvider theme="dark">
      <Button>Button</Button>
    </ThemeProvider>
  )
  
  // Test component behavior with context
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

## Differences from Vue Testing

### Event Handling

```typescript
// Vue - Events are emitted
it('should emit click event', async () => {
  const handleClick = vi.fn()
  const { getByRole } = render(Button, {
    props: { onClick: handleClick }
  })
})

// React - Props are called
it('should call onClick handler', async () => {
  const handleClick = vi.fn()
  const { getByRole } = render(
    <Button onClick={handleClick}>Button</Button>
  )
})
```

### Content Rendering

```typescript
// Vue - Uses slots
const { getByText } = renderWithSlots(Button, {
  default: 'Button Text'
})

// React - Uses children prop
const { getByText } = render(<Button>Button Text</Button>)
```

### Prop Updates

```typescript
// Vue - Use rerender with new props
const { rerender } = render(Button, { props: { disabled: false } })
rerender({ disabled: true })

// React - Use rerender with new element
const { rerender } = render(<Button disabled={false} />)
rerender(<Button disabled={true} />)
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [User Event Documentation](https://testing-library.com/docs/user-event/intro)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
