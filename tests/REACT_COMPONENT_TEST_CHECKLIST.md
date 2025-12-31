# React Component Test Checklist

This document tracks the testing progress for all React components in the Tigercat UI library.

## Progress Overview

- **Total Components**: 28
- **Components Tested**: 5
- **Components Remaining**: 23
- **Progress**: 18%
- **Total Tests**: 198
- **Average Tests per Component**: 39.6

## Quality Metrics

### Test Coverage Goals
- **Line Coverage**: ≥80% per component
- **Branch Coverage**: ≥75% per component
- **Function Coverage**: ≥80% per component

### Test Quality Standards
- Minimum 30 tests for simple components
- Minimum 40 tests for medium complexity components
- Minimum 50 tests for complex components
- All test categories covered (Rendering, Props, Events, States, Theme, A11y, Children, Snapshots, Edge Cases)

## Testing Status

### Basic Components (4 total, 1 tested)

- [x] Button - ✅ Completed (48 tests, all passing)
  - **Test File**: `tests/react/Button.spec.tsx`
  - **Test Count**: 48 (+8 edge cases from baseline)
  - **Test Categories**: ✅ All 9 categories covered
  - **Edge Cases**: ✅ Comprehensive (empty, null, long text, special chars, unicode)
  - **Boundary Tests**: ✅ Complete (rapid state changes, prop preservation, combinations)
  - **Quality**: ⭐⭐⭐⭐⭐ Excellent
- [ ] Link
  - **Priority**: High
  - **Estimated Tests**: 35+
  - **Special Considerations**: href behavior, external links, navigation, onClick
- [ ] Icon
  - **Priority**: High
  - **Estimated Tests**: 30+
  - **Special Considerations**: SVG rendering, sizing, custom icons via children
- [ ] Text
  - **Priority**: High
  - **Estimated Tests**: 35+
  - **Special Considerations**: sizes, weights, alignment, decorations

### Form Components (14 total, 3 tested)

- [ ] Form
- [ ] FormItem
- [ ] Input
- [ ] Textarea
- [ ] Radio
- [ ] RadioGroup
- [ ] Checkbox
- [ ] CheckboxGroup
- [ ] Select
- [ ] Switch
- [ ] Slider
- [x] DatePicker - ✅ Completed (All passing)
- [x] TimePicker - ✅ Completed (All passing)
- [x] Upload - ✅ Completed (All passing)

### Data Display Components (1 total, 1 tested)

- [x] Skeleton - ✅ Completed (37 tests, all passing)
  - **Test File**: `tests/react/Skeleton.spec.tsx`
  - **Test Count**: 37
  - **Test Categories**: ✅ All 9 categories covered
  - **Quality**: ⭐⭐⭐⭐⭐ Excellent
  - **Notes**: 
    - Comprehensive coverage of all variants (text, avatar, image, button, custom)
    - All animations tested (pulse, wave, none)
    - Multiple rows and paragraph mode tested
    - Custom dimensions and shapes tested
    - Accessibility complete
    - Proper React patterns (hooks, JSX)

### Layout Components (10 total, 0 tested)

- [ ] Container
- [ ] Header
- [ ] Footer
- [ ] Sidebar
- [ ] Content
- [ ] Layout
- [ ] Row
- [ ] Col
- [ ] Divider
- [ ] Space

## Test Quality Guidelines

See **[TEST_QUALITY_GUIDELINES.md](./TEST_QUALITY_GUIDELINES.md)** for comprehensive testing standards.

### Required Test Categories
- ✅ Rendering, Props, Events, States, Theme Support, Accessibility, Children, Edge Cases, Snapshots

### Quick Checklist Per Component
- [ ] All props and edge cases tested
- [ ] Event handlers tested (including when disabled)
- [ ] Theme colors apply correctly
- [ ] No accessibility violations
- [ ] Controlled/uncontrolled modes work

## Component-Specific Notes

### Button
- **Priority**: High (Basic Component)
- **Status**: ✅ Completed (40 tests, all passing)
- **Special Considerations**: 
  - Test all variants (primary, secondary, outline, ghost)
  - Test all sizes (sm, md, lg)
  - Test loading state with spinner
  - Test disabled state
  - Test onClick handler
  - Test type prop (button, submit, reset)

### TimePicker
- **Priority**: High (Form Component)
- **Status**: ✅ Completed (All passing)
- **Special Considerations**:
  - Test time selection and input
  - Test hour/minute/second controls
  - Test onChange handler
  - Test disabled state
  - Test time format validation
  - Test accessibility

### DatePicker
- **Priority**: High (Form Component)
- **Status**: ✅ Completed (All passing)
- **Special Considerations**:
  - Test date selection
  - Test calendar navigation
  - Test onChange handler
  - Test disabled dates
  - Test date format
  - Test accessibility

### Upload
- **Priority**: High (Form Component)
- **Status**: ✅ Completed (All passing)
- **Special Considerations**:
  - Test file selection
  - Test drag and drop
  - Test file validation (size, type)
  - Test multiple file upload
  - Test onChange handler
  - Test file list display
  - Test file removal
  - Test accessibility

### Link
- **Priority**: High (Basic Component)
- **Special Considerations**: 
  - Test href attribute
  - Test external link behavior
  - Test disabled link state
  - Test different link variants
  - Test onClick handler
  - Test navigation behavior

### Icon
- **Priority**: High (Basic Component)
- **Special Considerations**:
  - Test SVG rendering
  - Test icon sizing
  - Test custom icons via children
  - Test color variations

### Text
- **Priority**: High (Basic Component)
- **Special Considerations**:
  - Test text sizes
  - Test text weights
  - Test text alignment
  - Test text colors
  - Test text decorations (truncate, italic, etc.)

### Input
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test controlled and uncontrolled modes
  - Test value and defaultValue props
  - Test onChange and onInput handlers
  - Test onFocus and onBlur handlers
  - Test disabled and readonly states
  - Test different input types
  - Test maxLength and minLength
  - Test autoFocus and autoComplete

### Textarea
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test controlled and uncontrolled modes
  - Test rows prop
  - Test resize behavior
  - Test onChange handler
  - Test maxLength

### Radio & RadioGroup
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test Radio in isolation
  - Test RadioGroup with multiple Radio components
  - Test controlled and uncontrolled modes
  - Test onChange handler
  - Test disabled state
  - Test name attribute grouping

### Checkbox & CheckboxGroup
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test Checkbox in isolation
  - Test CheckboxGroup with multiple Checkbox components
  - Test controlled and uncontrolled modes
  - Test onChange handler
  - Test indeterminate state
  - Test disabled state

### Select
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test option rendering
  - Test onChange handler
  - Test controlled and uncontrolled modes
  - Test disabled state
  - Test placeholder

### Switch
- **Priority**: Medium (Form Component)
- **Special Considerations**:
  - Test checked state
  - Test onChange handler
  - Test disabled state
  - Test different sizes

### Slider
- **Priority**: Medium (Form Component)
- **Special Considerations**:
  - Test value changes
  - Test onChange handler
  - Test min, max, and step props
  - Test disabled state

### Form & FormItem
- **Priority**: High (Form Component)
- **Special Considerations**:
  - Test form submission
  - Test validation
  - Test error states
  - Test required fields
  - Test label and error message rendering

### Container, Header, Footer, Sidebar, Content, Layout
- **Priority**: Medium (Layout Components)
- **Special Considerations**:
  - Test children rendering
  - Test className application
  - Test layout composition
  - Test responsive behavior if applicable

### Row & Col
- **Priority**: Medium (Layout Components)
- **Special Considerations**:
  - Test grid system
  - Test span, offset, and gutter props
  - Test responsive props
  - Test alignment

### Divider
- **Priority**: Low (Layout Component)
- **Special Considerations**:
  - Test orientation (horizontal, vertical)
  - Test custom styles

### Space
- **Priority**: Medium (Layout Component)
- **Special Considerations**:
  - Test spacing between children
  - Test direction (horizontal, vertical)
  - Test size prop
  - Test align prop

## Testing Workflow

### For Each Component:

1. **Create test file**: `tests/react/[ComponentName].spec.tsx`
2. **Copy template**: Use `ComponentTemplate.spec.tsx.template` as starting point
3. **Import component**: From `@tigercat/react`
4. **Implement tests**: Follow the test categories in the template
5. **Run tests**: `pnpm test [ComponentName].spec.tsx`
6. **Check coverage**: Ensure >80% line coverage
7. **Update snapshots**: `pnpm test -u` if UI changes
8. **Update checklist**: Mark component as tested

### Test Development Order:

**Phase 1: Basic Components** (Recommended first)
1. Button - Most commonly used, good reference
2. Text - Simple component, good for learning
3. Link - Similar to Button
4. Icon - Test SVG rendering

**Phase 2: Form Components** (High priority)
1. Input - Foundation for other inputs
2. Textarea - Similar to Input
3. Checkbox - Simple form control
4. Radio - Similar to Checkbox
5. Switch - Toggle component
6. Select - Dropdown component
7. Slider - Range input
8. CheckboxGroup - Group component
9. RadioGroup - Group component
10. FormItem - Form field wrapper
11. Form - Form container

**Phase 3: Layout Components** (Medium priority)
1. Container - Basic layout
2. Row & Col - Grid system
3. Space - Spacing utility
4. Divider - Visual separator
5. Layout, Header, Footer, Sidebar, Content - Layout composition

## Next Steps

1. ✅ Set up React testing infrastructure
2. ✅ Create test utilities and helpers
3. ✅ Create component template
4. ✅ Create testing guide
5. ⬜ Create individual issues for each component test (optional)
6. ⬜ Begin testing components in priority order

## Testing Resources

- Test Template: `tests/react/ComponentTemplate.spec.tsx.template`
- Testing Guide: `tests/REACT_TESTING_GUIDE.md`
- Test Utilities: `tests/utils/`
- Vue Example Tests: `tests/vue/Button.spec.ts` (for reference)

## Notes

- All tests should follow the React Testing Library principles
- Use the ComponentTemplate.spec.tsx.template as a starting point
- Ensure accessibility tests pass for all components
- Update this checklist as tests are completed
- Maintain consistent test structure across all components
- Use userEvent for user interactions instead of fireEvent when possible
- Test both controlled and uncontrolled modes for form components
- Focus on testing user behavior, not implementation details
