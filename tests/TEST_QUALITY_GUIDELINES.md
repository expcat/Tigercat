# Test Quality Guidelines

This document defines the quality standards and best practices for writing tests in the Tigercat UI library.

## Table of Contents

- [Overview](#overview)
- [Test Quality Metrics](#test-quality-metrics)
- [Test Categories](#test-categories)
- [Quality Standards](#quality-standards)
- [Code Quality](#code-quality)
- [Edge Case Testing](#edge-case-testing)
- [Boundary Testing](#boundary-testing)
- [Negative Testing](#negative-testing)
- [Test Coverage Requirements](#test-coverage-requirements)
- [Test Naming Conventions](#test-naming-conventions)
- [Common Anti-Patterns](#common-anti-patterns)
- [Review Checklist](#review-checklist)

## Overview

High-quality tests are essential for maintaining a reliable component library. This document provides guidelines to ensure our tests are:

- **Comprehensive**: Cover all functionality, edge cases, and error scenarios
- **Maintainable**: Easy to read, understand, and modify
- **Reliable**: Consistent results without flakiness
- **Fast**: Run quickly to support rapid development
- **Valuable**: Catch real bugs and prevent regressions

## Test Quality Metrics

### Quantitative Metrics

- **Line Coverage**: Minimum 80% for each component
- **Branch Coverage**: Minimum 75% for each component
- **Function Coverage**: Minimum 80% for each component
- **Test Count**: Minimum thresholds per component type:
  - Simple components (Button, Text): 30+ tests
  - Medium complexity (Input, Select): 40+ tests
  - Complex components (DatePicker, Upload): 50+ tests

### Qualitative Metrics

- All prop combinations tested
- All event handlers tested
- Accessibility validated
- Edge cases covered
- Negative scenarios tested
- Boundary conditions verified

## Test Categories

Every component test suite must include these categories:

### 1. Rendering Tests

Test basic rendering and visual output.

```typescript
describe('Rendering', () => {
  it('should render with default props', () => {
    // Test default state
  })

  it('should render with custom props', () => {
    // Test customization
  })

  it('should apply custom className', () => {
    // Test className override
  })
})
```

### 2. Props Tests

Test all prop combinations and variations.

```typescript
describe('Props', () => {
  it.each(variants)('should handle %s variant', (variant) => {
    // Test each variant
  })

  it.each(sizes)('should handle %s size', (size) => {
    // Test each size
  })

  it('should handle invalid props gracefully', () => {
    // Test with unexpected values
  })
})
```

### 3. Events Tests

Test all event handlers and emissions.

```typescript
describe('Events', () => {
  it('should call onClick when clicked', async () => {
    // Test event handler
  })

  it('should not call onClick when disabled', async () => {
    // Test event prevention
  })

  it('should emit event with correct payload', async () => {
    // Test event data
  })
})
```

### 4. States Tests

Test different component states.

```typescript
describe('States', () => {
  it('should show disabled state', () => {
    // Test disabled
  })

  it('should show loading state', () => {
    // Test loading
  })

  it('should show error state', () => {
    // Test error
  })
})
```

### 5. Theme Support Tests

Test theme customization.

```typescript
describe('Theme Support', () => {
  afterEach(() => {
    clearThemeVariables([...])
  })

  it('should support custom theme colors', () => {
    // Test theme variables
  })
})
```

### 6. Accessibility Tests

Test WCAG compliance and a11y features.

```typescript
describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    await expectNoA11yViolations(container)
  })

  it('should have proper ARIA attributes', () => {
    // Test ARIA
  })

  it('should be keyboard accessible', async () => {
    // Test keyboard navigation
  })
})
```

### 7. Edge Cases Tests

Test boundary and extreme scenarios.

```typescript
describe('Edge Cases', () => {
  it('should handle empty content', () => {
    // Test empty state
  })

  it('should handle very long text', () => {
    // Test with extreme input
  })

  it('should handle special characters', () => {
    // Test with special chars
  })
})
```

### 8. Snapshot Tests

Test for visual regressions.

```typescript
describe('Snapshots', () => {
  it('should match snapshot for default state', () => {
    expect(container.firstChild).toMatchSnapshot()
  })
})
```

## Quality Standards

### Test Structure

✅ **Good Test Structure**:
```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      // Arrange
      const props = { /* ... */ }
      
      // Act
      const { getByRole } = render(<Component {...props} />)
      
      // Assert
      expect(getByRole('button')).toBeInTheDocument()
    })
  })
})
```

❌ **Poor Test Structure**:
```typescript
describe('tests', () => {
  it('test 1', () => {
    // Everything mixed together
    const { container } = render(<Component />)
    expect(container.querySelector('.button')).toBeTruthy()
    fireEvent.click(container.querySelector('.button'))
    expect(something).toBe(true)
  })
})
```

### Test Independence

✅ **Good - Independent Tests**:
```typescript
describe('Component', () => {
  it('test 1', () => {
    const { getByRole } = render(<Component />)
    // Test is self-contained
  })

  it('test 2', () => {
    const { getByRole } = render(<Component />)
    // Independent of test 1
  })
})
```

❌ **Poor - Tests Depend on Each Other**:
```typescript
describe('Component', () => {
  let container

  it('test 1', () => {
    container = render(<Component />).container
  })

  it('test 2', () => {
    // Depends on test 1
    expect(container).toBeTruthy()
  })
})
```

### Descriptive Test Names

✅ **Good Names**:
```typescript
it('should disable button when loading prop is true')
it('should call onChange handler with correct value')
it('should prevent form submission when validation fails')
```

❌ **Poor Names**:
```typescript
it('works')
it('test 1')
it('button test')
```

## Code Quality

### Type Safety

✅ **Good - Strong Types**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick?: (event: MouseEvent) => void
}

const mockHandler: ButtonProps['onClick'] = vi.fn()
```

❌ **Poor - Weak Types**:
```typescript
const props: any = { variant: 'primary' }
const mockHandler: any = vi.fn()
```

### Avoid Magic Values

✅ **Good - Named Constants**:
```typescript
const LONG_TEXT = 'a'.repeat(1000)
const SPECIAL_CHARS = '<>&"\'\`§±!@#$%^&*()'
const UNICODE_TEXT = '你好世界 🌍 مرحبا'

it('should handle long text', () => {
  render(<Text>{LONG_TEXT}</Text>)
})
```

❌ **Poor - Magic Values**:
```typescript
it('should handle long text', () => {
  render(<Text>{'a'.repeat(1000)}</Text>)
})
```

### DRY Principle

✅ **Good - Reusable Helpers**:
```typescript
const renderButton = (props = {}) => {
  return render(<Button {...props}>Click me</Button>)
}

it('test 1', () => {
  const { getByRole } = renderButton({ variant: 'primary' })
})

it('test 2', () => {
  const { getByRole } = renderButton({ disabled: true })
})
```

❌ **Poor - Repeated Code**:
```typescript
it('test 1', () => {
  const { getByRole } = render(<Button variant="primary">Click me</Button>)
})

it('test 2', () => {
  const { getByRole } = render(<Button disabled>Click me</Button>)
})
```

## Edge Case Testing

### Required Edge Cases

Every component must test these edge cases:

1. **Empty/Null Values**
   ```typescript
   it('should handle empty children', () => {
     render(<Button />)
   })
   
   it('should handle null children', () => {
     render(<Button>{null}</Button>)
   })
   ```

2. **Extreme Values**
   ```typescript
   it('should handle very long text', () => {
     const longText = 'a'.repeat(10000)
     render(<Text>{longText}</Text>)
   })
   
   it('should handle maximum file size', () => {
     const largeFile = createTestFile('large.txt', '', '', Number.MAX_SAFE_INTEGER)
   })
   ```

3. **Special Characters**
   ```typescript
   it('should handle HTML special characters', () => {
     render(<Text>{'<script>alert("XSS")</script>'}</Text>)
   })
   
   it('should handle unicode characters', () => {
     render(<Text>{'你好世界 🌍'}</Text>)
   })
   ```

4. **Rapid Interactions**
   ```typescript
   it('should handle rapid clicks', async () => {
     const onClick = vi.fn()
     const { getByRole } = render(<Button onClick={onClick}>Click</Button>)
     
     await userEvent.click(button)
     await userEvent.click(button)
     await userEvent.click(button)
     
     expect(onClick).toHaveBeenCalledTimes(3)
   })
   ```

## Boundary Testing

### Testing Boundaries

Test values at the edges of valid ranges:

```typescript
describe('Boundary Conditions', () => {
  it('should accept minimum valid value', () => {
    render(<Slider value={0} min={0} max={100} />)
  })

  it('should accept maximum valid value', () => {
    render(<Slider value={100} min={0} max={100} />)
  })

  it('should handle value below minimum', () => {
    // Test how component handles invalid input
    render(<Slider value={-1} min={0} max={100} />)
  })

  it('should handle value above maximum', () => {
    // Test how component handles invalid input
    render(<Slider value={101} min={0} max={100} />)
  })
})
```

### State Combinations

Test all meaningful combinations:

```typescript
it('should handle all size-variant combinations', () => {
  componentSizes.forEach(size => {
    buttonVariants.forEach(variant => {
      const { getByRole, unmount } = render(
        <Button size={size} variant={variant}>Button</Button>
      )
      expect(getByRole('button')).toBeInTheDocument()
      unmount()
    })
  })
})
```

## Negative Testing

### Testing Failure Scenarios

Ensure components handle errors gracefully:

```typescript
describe('Negative Scenarios', () => {
  it('should handle missing required props', () => {
    // @ts-expect-error Testing error handling
    render(<Component />)
    // Component should not crash
  })

  it('should handle invalid prop values', () => {
    // @ts-expect-error Testing error handling
    render(<Button variant="invalid">Button</Button>)
    // Component should use default
  })

  it('should handle failed async operations', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('Upload failed'))
    render(<Upload onUpload={onUpload} />)
    // Component should show error state
  })
})
```

## Test Coverage Requirements

### Minimum Coverage

- **Line Coverage**: 80%
- **Branch Coverage**: 75%
- **Function Coverage**: 80%

### Coverage Exemptions

Some code may be excluded from coverage requirements:

1. Type definitions and interfaces
2. Console logging (development only)
3. Impossible error states (defensive programming)
4. Third-party library wrappers (thin wrappers only)

### Running Coverage

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
pnpm test:coverage --ui
```

## Test Naming Conventions

### File Naming

- Test files: `ComponentName.spec.ts` or `ComponentName.spec.tsx`
- Test utilities: `helper-name.ts` (no .spec suffix)
- Test fixtures: `test-fixtures.ts`

### Describe Blocks

- Component name: `describe('ComponentName', () => {})`
- Feature category: `describe('Rendering', () => {})`
- Sub-feature: `describe('Props', () => {})`

### Test Names

Use "should" statements that describe behavior:

```typescript
// ✅ Good
it('should render with default props')
it('should call onClick when clicked')
it('should disable button when loading')

// ❌ Poor
it('renders')
it('click test')
it('disabled')
```

## Common Anti-Patterns

### 1. Testing Implementation Details

❌ **Don't Test Internal State**:
```typescript
it('should set isOpen to true', () => {
  const { container } = render(<Dropdown />)
  // Testing internal state
  expect(component.state.isOpen).toBe(true)
})
```

✅ **Test User-Visible Behavior**:
```typescript
it('should show dropdown menu when clicked', async () => {
  const { getByRole, getByText } = render(<Dropdown />)
  await userEvent.click(getByRole('button'))
  expect(getByText('Option 1')).toBeVisible()
})
```

### 2. Brittle Selectors

❌ **Don't Use Brittle Selectors**:
```typescript
it('test', () => {
  const button = container.querySelector('.btn-primary.btn-lg')
  expect(button).toBeTruthy()
})
```

✅ **Use Semantic Queries**:
```typescript
it('test', () => {
  const button = getByRole('button', { name: 'Submit' })
  expect(button).toBeInTheDocument()
})
```

### 3. Flaky Tests

❌ **Don't Use Arbitrary Timeouts**:
```typescript
it('test', async () => {
  fireEvent.click(button)
  await new Promise(resolve => setTimeout(resolve, 100))
  expect(element).toBeInTheDocument()
})
```

✅ **Use waitFor or findBy**:
```typescript
it('test', async () => {
  fireEvent.click(button)
  expect(await findByText('Loaded')).toBeInTheDocument()
})
```

### 4. Unclear Assertions

❌ **Don't Use Vague Assertions**:
```typescript
it('test', () => {
  const { container } = render(<Component />)
  expect(container).toBeTruthy()
})
```

✅ **Use Specific Assertions**:
```typescript
it('should render button with correct text', () => {
  const { getByRole } = render(<Button>Click me</Button>)
  expect(getByRole('button')).toHaveTextContent('Click me')
})
```

## Review Checklist

Use this checklist when reviewing test PRs:

### Structure
- [ ] Tests are organized into logical describe blocks
- [ ] All required test categories are present
- [ ] Test names clearly describe what they test

### Coverage
- [ ] All props are tested
- [ ] All events are tested
- [ ] All states are tested
- [ ] Edge cases are covered
- [ ] Boundary conditions are tested
- [ ] Coverage meets minimum thresholds

### Quality
- [ ] Tests are independent (no shared state)
- [ ] No magic values (use named constants)
- [ ] No testing implementation details
- [ ] No brittle selectors (use semantic queries)
- [ ] No flaky tests (proper async handling)

### Type Safety
- [ ] No use of `any` type
- [ ] Proper TypeScript types for mocks
- [ ] Type assertions only when necessary

### Accessibility
- [ ] No accessibility violations
- [ ] Keyboard navigation tested
- [ ] ARIA attributes verified
- [ ] Screen reader compatibility considered

### Documentation
- [ ] Complex test logic has comments
- [ ] Test utilities are documented
- [ ] Test checklist is updated

## Resources

- [Vue Testing Guide](./TESTING_GUIDE.md)
- [React Testing Guide](./REACT_TESTING_GUIDE.md)
- [Vue Component Checklist](./COMPONENT_TEST_CHECKLIST.md)
- [React Component Checklist](./REACT_COMPONENT_TEST_CHECKLIST.md)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2024-12-30
**Version**: 1.0.0
