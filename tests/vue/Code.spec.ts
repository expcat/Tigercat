/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Code } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Code (Vue)', () => {
  describe('Rendering', () => {
    it('renders code content', () => {
      render(Code, { props: { code: 'const a = 1' } })
      expect(screen.getByText('const a = 1')).toBeInTheDocument()
    })

    it('renders a pre element containing a code element', () => {
      const { container } = render(Code, { props: { code: 'hello' } })
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      const code = pre!.querySelector('code')
      expect(code).toBeInTheDocument()
      expect(code!.textContent).toBe('hello')
    })

    it('renders multiline code preserving line breaks', () => {
      const multiline = 'line1\nline2\nline3'
      const { container } = render(Code, { props: { code: multiline } })
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe(multiline)
    })

    it('renders code with special HTML characters safely', () => {
      const code = '<script>alert("xss")</script>'
      const { container } = render(Code, { props: { code } })
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe(code)
      expect(codeEl!.innerHTML).not.toContain('<script>')
    })

    it('shows copy button by default', () => {
      render(Code, { props: { code: 'x = 1' } })
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('hides copy button when copyable is false', () => {
      render(Code, { props: { code: 'let x = 1', copyable: false } })
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders custom copy labels', () => {
      render(Code, { props: { code: 'x = 1', copyLabel: 'Copy', copiedLabel: 'Done' } })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('renders default copy label as 复制', () => {
      render(Code, { props: { code: 'x = 1' } })
      expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument()
    })

    it('merges class attribute onto container', () => {
      const { container } = render(Code, {
        props: { code: 'x = 1' },
        attrs: { class: 'custom-class' }
      })
      expect(container.firstElementChild).toHaveClass('custom-class')
    })

    it('applies style prop to container', () => {
      const { container } = render(Code, {
        props: { code: 'x = 1', style: { color: 'red' } }
      })
      expect(container.firstElementChild).toHaveStyle({ color: 'red' })
    })
  })

  describe('Copy Functionality', () => {
    it('copies code and emits copy', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      const { emitted } = render(Code, { props: { code: "console.log('copy')" } })
      const button = screen.getByRole('button', { name: '复制' })
      await fireEvent.click(button)

      expect(writeText).toHaveBeenCalledWith("console.log('copy')")
      expect(emitted().copy?.[0]).toEqual(["console.log('copy')"])
      expect(await screen.findByRole('button', { name: '已复制' })).toBeInTheDocument()
    })

    it('resets copied state after timeout', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(Code, { props: { code: 'abc' } })
      await fireEvent.click(screen.getByRole('button', { name: '复制' }))
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: '已复制' })).toBeInTheDocument()
      })

      vi.advanceTimersByTime(1500)
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument()
      })
      vi.useRealTimers()
    })

    it('does not emit copy when clipboard fails', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      const { emitted } = render(Code, { props: { code: 'fail' } })
      await fireEvent.click(screen.getByRole('button', { name: '复制' }))
      expect(emitted().copy).toBeUndefined()
    })

    it('does not copy when copyable is false', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(Code, { props: { code: 'x', copyable: false } })
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(writeText).not.toHaveBeenCalled()
    })

    it('handles rapid consecutive clicks', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(Code, { props: { code: 'rapid' } })
      const button = screen.getByRole('button', { name: '复制' })
      await fireEvent.click(button)
      await fireEvent.click(button)
      await fireEvent.click(button)

      expect(writeText).toHaveBeenCalledTimes(3)
      vi.advanceTimersByTime(1500)
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument()
      })
      vi.useRealTimers()
    })
  })

  describe('Accessibility', () => {
    it('copy button has aria-label matching copyLabel', () => {
      render(Code, { props: { code: 'test', copyLabel: 'Copy code' } })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy code')
    })

    it('aria-label changes to copiedLabel after copy', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(Code, { props: { code: 'test', copyLabel: 'Copy', copiedLabel: 'Copied!' } })
      await fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument()
    })

    it('copy button has type="button"', () => {
      render(Code, { props: { code: 'test' } })
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('has no obvious a11y violations', async () => {
      const { container } = renderWithProps(Code, { code: 'const sum = 1 + 2' })
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no a11y violations when copyable is false', async () => {
      const { container } = renderWithProps(Code, { code: 'const a = 1', copyable: false })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty code string', () => {
      const { container } = render(Code, { props: { code: '' } })
      const codeEl = container.querySelector('code')
      expect(codeEl).toBeInTheDocument()
      expect(codeEl!.textContent).toBe('')
    })

    it('renders code with only whitespace', () => {
      const { container } = render(Code, { props: { code: '   ' } })
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe('   ')
    })

    it('handles very long single-line code', () => {
      const longCode = 'x'.repeat(10000)
      const { container } = render(Code, { props: { code: longCode } })
      expect(container.querySelector('code')!.textContent).toBe(longCode)
    })

    it('renders code with unicode characters', () => {
      const code = 'const emoji = "🎉"; // 注释'
      render(Code, { props: { code } })
      expect(screen.getByText(code)).toBeInTheDocument()
    })
  })
})
