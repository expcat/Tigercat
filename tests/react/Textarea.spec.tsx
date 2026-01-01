/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Textarea } from '@tigercat/react'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Textarea />)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('block')
    })

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <Textarea placeholder="Enter text" />
      )
      
      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value (controlled)', () => {
      const { getByRole } = render(<Textarea value="Initial value" />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Initial value')
    })

    it('should render with defaultValue (uncontrolled)', () => {
      const { getByRole } = render(<Textarea defaultValue="Default value" />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Default value')
    })

    it('should render with custom rows', () => {
      const { getByRole } = render(<Textarea rows={5} />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })

    it('should apply custom className', () => {
      const { container } = render(<Textarea className="custom-class" />)
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = render(<Textarea size={size} />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should apply maxLength attribute', () => {
      const { getByRole } = render(<Textarea maxLength={100} />)
      
      expect(getByRole('textbox')).toHaveAttribute('maxlength', '100')
    })

    it('should apply minLength attribute', () => {
      const { getByRole } = render(<Textarea minLength={10} />)
      
      expect(getByRole('textbox')).toHaveAttribute('minlength', '10')
    })

    it('should apply name attribute', () => {
      const { getByRole } = render(<Textarea name="description" />)
      
      expect(getByRole('textbox')).toHaveAttribute('name', 'description')
    })

    it('should apply id attribute', () => {
      const { container } = render(<Textarea id="textarea-id" />)
      
      expect(container.querySelector('#textarea-id')).toBeInTheDocument()
    })

    it('should apply autocomplete attribute', () => {
      const { getByRole } = render(<Textarea autoComplete="off" />)
      
      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'off')
    })

    it('should autofocus when autoFocus is true', () => {
      const { getByRole } = render(<Textarea autoFocus />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveFocus()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = render(<Textarea disabled />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea.className).toContain('disabled:')
    })

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = render(<Textarea readonly />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('should show required state', () => {
      const { getByRole } = render(<Textarea required />)
      
      expect(getByRole('textbox')).toBeRequired()
    })
  })

  describe('Events', () => {
    it('should call onChange handler on input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(<Textarea onChange={handleChange} />)
      
      const textarea = getByRole('textbox')
      await user.type(textarea, 't')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onInput handler', async () => {
      const user = userEvent.setup()
      const handleInput = vi.fn()
      const { getByRole } = render(<Textarea onInput={handleInput} />)
      
      const textarea = getByRole('textbox')
      await user.type(textarea, 'test')
      
      expect(handleInput).toHaveBeenCalled()
    })

    it('should call onFocus handler', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const { getByRole } = render(<Textarea onFocus={handleFocus} />)
      
      const textarea = getByRole('textbox')
      await user.click(textarea)
      
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur handler', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()
      const { getByRole } = render(<Textarea onBlur={handleBlur} />)
      
      const textarea = getByRole('textbox')
      await user.click(textarea)
      await user.tab()
      
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(<Textarea disabled onChange={handleChange} />)
      
      const textarea = getByRole('textbox')
      await user.type(textarea, 'test')
      
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Textarea readonly value="initial" />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      await user.type(textarea, 'test')
      
      expect(textarea.value).toBe('initial')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial')
        
        return (
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }
      
      const { getByRole } = render(<TestComponent />)
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      
      expect(textarea.value).toBe('initial')
      
      await user.clear(textarea)
      await user.type(textarea, 'updated')
      
      expect(textarea.value).toBe('updated')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Textarea defaultValue="initial" />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('initial')
      
      await user.clear(textarea)
      await user.type(textarea, 'updated')
      
      expect(textarea.value).toBe('updated')
    })

    it('should handle multiline text', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const { getByRole } = render(<Textarea value={multilineText} />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
      })

      const { getByRole } = render(<Textarea placeholder="Themed textarea" />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Textarea placeholder="Accessible textarea" />)
      
      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const { getByRole } = render(<Textarea onFocus={handleFocus} />)
      
      const textarea = getByRole('textbox')
      await user.tab()
      
      expect(textarea).toHaveFocus()
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should have proper role', () => {
      const { getByRole } = render(<Textarea />)
      
      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      const { getByLabelText } = render(
        <Textarea aria-label="Description textarea" />
      )
      
      expect(getByLabelText('Description textarea')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      const { getByRole } = render(
        <Textarea aria-describedby="textarea-help" />
      )
      
      expect(getByRole('textbox')).toHaveAttribute('aria-describedby', 'textarea-help')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const { getByRole } = render(<Textarea value="" />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle very long text', async () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100)
      const { getByRole } = render(<Textarea value={longText} />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(longText)
    })

    it('should handle special characters', async () => {
      const specialText = '<>&"\'\`§±!@#$%^&*()'
      const { getByRole } = render(<Textarea value={specialText} />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(specialText)
    })

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا'
      const { getByRole } = render(<Textarea value={unicodeText} />)
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(unicodeText)
    })

    it('should handle rapid input changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(<Textarea onChange={handleChange} />)
      
      const textarea = getByRole('textbox')
      
      await user.type(textarea, 'abc')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('should respect maxLength constraint', async () => {
      const { getByRole } = render(<Textarea maxLength={50} />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('maxlength', '50')
    })

    it('should handle rows changes', () => {
      const { getByRole, rerender } = render(<Textarea rows={3} />)
      
      let textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
      
      rerender(<Textarea rows={10} />)
      textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should handle multiple size changes', () => {
      const { getByRole, rerender } = render(<Textarea size="sm" />)
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      
      componentSizes.forEach((size) => {
        rerender(<Textarea size={size} />)
        expect(textarea).toBeInTheDocument()
      })
    })

    it('should pass through additional HTML attributes', () => {
      const { getByRole } = render(
        <Textarea data-testid="test-textarea" title="Textarea title" />
      )
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
      expect(textarea).toHaveAttribute('title', 'Textarea title')
    })

    it('should handle undefined and null values gracefully', () => {
      const { getByRole, rerender } = render(<Textarea value={undefined} />)
      
      let textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
      
      rerender(<Textarea value={null as any} />)
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default textarea', () => {
      const { container } = render(<Textarea />)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with placeholder', () => {
      const { container } = render(<Textarea placeholder="Enter description" />)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(<Textarea disabled />)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for readonly state', () => {
      const { container } = render(<Textarea readonly />)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with custom rows', () => {
      const { container } = render(<Textarea rows={10} />)
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
