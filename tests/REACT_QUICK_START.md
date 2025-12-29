# React Component Testing - Quick Start

This guide will help you quickly set up and start writing tests for React components in the Tigercat UI library.

## 🚀 Getting Started

### Prerequisites
All dependencies are already installed. The testing infrastructure includes:
- ✅ Vitest as test runner
- ✅ @testing-library/react for component testing
- ✅ @testing-library/user-event for user interactions
- ✅ jest-axe for accessibility testing
- ✅ @testing-library/jest-dom for DOM matchers

### Creating Your First Test

1. **Copy the template**:
   ```bash
   cp tests/react/ComponentTemplate.spec.tsx.template tests/react/YourComponent.spec.tsx
   ```

2. **Update the imports**:
   ```typescript
   import { YourComponent } from '@tigercat/react'
   ```

3. **Fill in the test cases** based on your component's features

4. **Run your tests**:
   ```bash
   pnpm test YourComponent.spec.tsx
   ```

## 📝 Example Test

Here's a minimal example for a Button component:

```typescript
/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Button } from '@tigercat/react'

describe('Button', () => {
  it('should render with text', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    expect(getByRole('button')).toHaveTextContent('Click me')
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(
      <Button onClick={handleClick}>Click me</Button>
    )
    
    await userEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>)
    expect(getByRole('button')).toBeDisabled()
  })
})
```

## 🧪 Running Tests

```bash
# Run all React tests
pnpm test tests/react

# Run a specific test file
pnpm test Button.spec.tsx

# Run tests in watch mode
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Update snapshots
pnpm test -u
```

## 📚 Common Testing Patterns

### Testing Props

```typescript
it('should apply variant prop', () => {
  const { getByRole } = render(<Button variant="primary">Button</Button>)
  // Assert that the correct styles are applied
})
```

### Testing User Interactions

```typescript
it('should handle user input', async () => {
  const handleChange = vi.fn()
  const { getByRole } = render(<Input onChange={handleChange} />)
  
  const input = getByRole('textbox')
  await userEvent.type(input, 'test')
  
  expect(handleChange).toHaveBeenCalled()
})
```

### Testing Accessibility

```typescript
import { expectNoA11yViolations } from '../utils'

it('should have no a11y violations', async () => {
  const { container } = render(<Button>Accessible</Button>)
  await expectNoA11yViolations(container)
})
```

### Testing Conditional Rendering

```typescript
it('should show error message when error prop is provided', () => {
  const { getByText } = render(<Input error="Invalid input" />)
  expect(getByText('Invalid input')).toBeInTheDocument()
})
```

### Testing Snapshots

```typescript
it('should match snapshot', () => {
  const { container } = render(<Button>Button</Button>)
  expect(container.firstChild).toMatchSnapshot()
})
```

## 🎯 Test Structure

Every test file should follow this structure:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    // Basic rendering tests
  })

  describe('Props', () => {
    // Props validation
  })

  describe('Events', () => {
    // Event handlers
  })

  describe('States', () => {
    // Different states (disabled, loading, etc.)
  })

  describe('Accessibility', () => {
    // a11y tests
  })

  describe('Snapshots', () => {
    // Snapshot tests
  })
})
```

## 🔧 Available Utilities

### Render Helpers
```typescript
import { 
  renderWithProps, 
  renderWithChildren 
} from '../utils'

// Render with specific props
const { getByRole } = renderWithProps(Button, { variant: 'primary' })

// Render with children
const { getByText } = renderWithChildren(Button, 'Click me', { disabled: true })
```

### Test Fixtures
```typescript
import { 
  buttonVariants, 
  componentSizes 
} from '../utils'

// Test all variants
buttonVariants.forEach(variant => {
  // test each variant
})
```

### Theme Testing
```typescript
import { 
  setThemeVariables, 
  clearThemeVariables 
} from '../utils'

afterEach(() => {
  clearThemeVariables(['--tiger-primary'])
})

it('should support custom theme', () => {
  setThemeVariables({ '--tiger-primary': '#ff0000' })
  // Test theme application
})
```

## 📖 Resources

- **Full Guide**: [REACT_TESTING_GUIDE.md](./REACT_TESTING_GUIDE.md)
- **Test Template**: [ComponentTemplate.spec.tsx.template](./react/ComponentTemplate.spec.tsx.template)
- **Example Test**: [Button.spec.tsx](./react/Button.spec.tsx)
- **Progress Tracker**: [REACT_COMPONENT_TEST_CHECKLIST.md](./REACT_COMPONENT_TEST_CHECKLIST.md)

## 💡 Tips

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Focus on what users see and do, not implementation
3. **Use userEvent**: More realistic than `fireEvent` for user interactions
4. **Keep tests independent**: Each test should run in isolation
5. **Test edge cases**: Include empty states, long text, special characters
6. **Update snapshots carefully**: Only when changes are intentional

## 🎓 Next Steps

1. Choose a component from the checklist
2. Copy the template
3. Write comprehensive tests
4. Run and verify
5. Update the checklist
6. Submit for review

## ❓ Getting Help

- Review the [REACT_TESTING_GUIDE.md](./REACT_TESTING_GUIDE.md) for detailed examples
- Check [Button.spec.tsx](./react/Button.spec.tsx) for a complete reference
- Look at Vue tests in `tests/vue/` for additional patterns
- Consult [Testing Library docs](https://testing-library.com/docs/react-testing-library/intro/)

Happy Testing! 🎉
