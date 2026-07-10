/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Textarea } from '@expcat/tigercat-react'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils/react'

describe('Textarea', () => {
  const getTextarea = () => screen.getByRole('textbox') as HTMLTextAreaElement

  describe('Rendering', () => {
    it('renders a textbox by default', () => {
      render(<Textarea />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders the placeholder', () => {
      const { getByPlaceholderText } = render(<Textarea placeholder="Enter text" />)
      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('passes through native attributes', () => {
      render(<Textarea data-testid="test-textarea" title="Title" aria-describedby="help" />)
      const textarea = getTextarea()
      expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
      expect(textarea).toHaveAttribute('title', 'Title')
      expect(textarea).toHaveAttribute('aria-describedby', 'help')
    })

    it('applies custom className to the textarea', () => {
      render(<Textarea className="custom-class" />)
      expect(getTextarea()).toHaveClass('custom-class')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('supports size %s', (size) => {
      render(<Textarea size={size} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
    it('defaults rows to 3 and honors a custom rows value', () => {
      const { rerender } = render(<Textarea />)
      expect(getTextarea()).toHaveAttribute('rows', '3')
      rerender(<Textarea rows={10} />)
      expect(getTextarea()).toHaveAttribute('rows', '10')
    })
  })

  describe('States', () => {
    it('is disabled when disabled', () => {
      render(<Textarea disabled />)
      expect(getTextarea()).toBeDisabled()
    })
  })

  describe('Value binding', () => {
    it('works as a controlled component', async () => {
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
      render(<TestComponent />)
      const textarea = getTextarea()
      expect(textarea.value).toBe('initial')
      await user.clear(textarea)
      await user.type(textarea, 'updated')
      expect(textarea.value).toBe('updated')
      expect(handleChange).toHaveBeenCalled()
    })

    it('works as an uncontrolled component from defaultValue', async () => {
      const user = userEvent.setup()
      render(<Textarea defaultValue="initial" />)
      const textarea = getTextarea()
      expect(textarea.value).toBe('initial')
      await user.type(textarea, 'x')
      expect(textarea.value).toBe('initialx')
    })

    it('preserves multiline text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3'
      render(<Textarea value={multiline} />)
      expect(getTextarea().value).toBe(multiline)
    })
  })

  describe('Events', () => {
    it('fires focus, input, change and blur handlers', async () => {
      const user = userEvent.setup()
      const onInput = vi.fn()
      const onChange = vi.fn()
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      render(<Textarea onInput={onInput} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />)
      const textarea = getTextarea()
      await user.click(textarea)
      expect(onFocus).toHaveBeenCalled()
      await user.type(textarea, 'a')
      expect(onInput).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()
      await user.tab()
      expect(onBlur).toHaveBeenCalled()
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Textarea disabled onChange={onChange} />)
      await user.type(getTextarea(), 'test')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not allow typing when readonly', async () => {
      const user = userEvent.setup()
      render(<Textarea readonly value="fixed" />)
      const textarea = getTextarea()
      await user.type(textarea, 'x')
      expect(textarea.value).toBe('fixed')
    })
  })

  describe('AutoResize', () => {
    it.each([
      [false, 'resize-y'],
      [true, 'resize-none']
    ])('applies the resize class for autoResize=%s', (autoResize, className) => {
      render(<Textarea autoResize={autoResize} />)
      expect(getTextarea()).toHaveClass(className)
    })

    it('accepts minRows and maxRows and adjusts on input', async () => {
      const user = userEvent.setup()
      const onInput = vi.fn()
      render(<Textarea autoResize minRows={2} maxRows={10} onInput={onInput} />)
      const textarea = getTextarea()
      expect(textarea).toBeInTheDocument()
      await user.type(textarea, 'New content')
      expect(onInput).toHaveBeenCalled()
    })
  })

  describe('Character count (showCount)', () => {
    it('shows the count with maxLength', () => {
      render(<Textarea defaultValue="abc" showCount maxLength={10} />)
      expect(screen.getByText('3/10')).toBeInTheDocument()
    })
    it('updates the count on input', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState('ab')
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            showCount
            maxLength={10}
          />
        )
      }
      render(<TestComponent />)
      expect(screen.getByText('2/10')).toBeInTheDocument()
      await user.type(getTextarea(), 'cd')
      expect(screen.getByText('4/10')).toBeInTheDocument()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Textarea aria-label="Description" />)
      await expectNoA11yViolationsIsolated(container)
    })

    it('reflects aria-invalid for the error state', () => {
      render(<Textarea aria-invalid="true" />)
      expect(getTextarea()).toHaveAttribute('aria-invalid', 'true')
    })

    it('is keyboard focusable', () => {
      const onFocus = vi.fn()
      render(<Textarea onFocus={onFocus} />)
      const textarea = getTextarea()
      textarea.focus()
      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {})

  describe('Ref Forwarding', () => {
    it('forwards a ref to the textarea and supports imperative focus', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
      ref.current?.focus()
      expect(ref.current).toHaveFocus()
    })
  })
})
