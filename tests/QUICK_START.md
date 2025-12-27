# Quick Start: Writing Tests for Vue Components

This guide will help you quickly get started writing tests for Tigercat Vue components.

## Step 1: Copy the Template

```bash
cp tests/vue/ComponentTemplate.spec.ts.template tests/vue/YourComponent.spec.ts
```

## Step 2: Set Up Your Test File

1. Replace all occurrences of `ComponentName` with your actual component name
2. Import your component:
   ```typescript
   import { YourComponent } from '@tigercat/vue'
   ```

## Step 3: Write Basic Tests

Start with the rendering tests:

```typescript
describe('Rendering', () => {
  it('should render with default props', () => {
    const { getByRole } = render(YourComponent, {
      slots: { default: 'Content' }
    })
    
    expect(getByRole('button')).toBeInTheDocument()
  })
})
```

## Step 4: Test Props

```typescript
describe('Props', () => {
  it.each(['sm', 'md', 'lg'])('should render %s size', (size) => {
    const { container } = renderWithProps(YourComponent, { size })
    expect(container.querySelector('button')).toBeInTheDocument()
  })
})
```

## Step 5: Test Events

```typescript
describe('Events', () => {
  it('should emit click event', async () => {
    const handleClick = vi.fn()
    const { getByRole } = render(YourComponent, {
      props: { onClick: handleClick }
    })
    
    await fireEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Step 6: Test Accessibility

```typescript
describe('Accessibility', () => {
  it('should have no violations', async () => {
    const { container } = render(YourComponent)
    await expectNoA11yViolations(container)
  })
})
```

## Step 7: Add Snapshots

```typescript
describe('Snapshots', () => {
  it('should match snapshot', () => {
    const { container } = render(YourComponent)
    expect(container.firstChild).toMatchSnapshot()
  })
})
```

## Step 8: Run Your Tests

```bash
# Run your specific test file
pnpm test YourComponent.spec.ts

# Create snapshots (first time)
pnpm test -u YourComponent.spec.ts

# Run all tests
pnpm test
```

## Step 9: Check Coverage

```bash
pnpm test:coverage YourComponent.spec.ts
```

Aim for:
- Line coverage > 80%
- Branch coverage > 75%

## Common Patterns

### Testing with Props
```typescript
const { container } = renderWithProps(Component, { 
  size: 'lg',
  variant: 'primary' 
})
```

### Testing with Slots
```typescript
const { getByText } = renderWithSlots(Component, {
  default: 'Content',
  header: 'Header'
})
```

### Testing Events
```typescript
const handleClick = vi.fn()
const { getByRole } = render(Component, {
  props: { onClick: handleClick }
})
await fireEvent.click(getByRole('button'))
expect(handleClick).toHaveBeenCalled()
```

### Testing Theme
```typescript
setThemeVariables({ '--tiger-primary': '#ff0000' })
// ... test component ...
clearThemeVariables(['--tiger-primary'])
```

## Tips

1. **Start Simple**: Begin with basic rendering, then add complexity
2. **Test User Behavior**: Focus on what users see and do
3. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Check the Example**: Look at `Button.spec.ts` for reference
5. **Run Tests Often**: Test after each change to catch issues early

## Resources

- 📄 Full Testing Guide: `tests/TESTING_GUIDE.md`
- 📋 Template File: `tests/vue/ComponentTemplate.spec.ts.template`
- ✅ Example Tests: `tests/vue/Button.spec.ts`
- 🛠️ Test Utilities: `tests/utils/`

## Need Help?

- Check the example Button tests: `tests/vue/Button.spec.ts`
- Read the full testing guide: `tests/TESTING_GUIDE.md`
- Review available utilities: `tests/utils/`

## Checklist Before Submitting

- [ ] All test categories covered (Rendering, Props, Events, States, Theme, Accessibility, Snapshots)
- [ ] No accessibility violations
- [ ] All tests passing
- [ ] Coverage > 80%
- [ ] Snapshots created (with -u flag)
- [ ] Edge cases tested
- [ ] Documentation updated if needed
