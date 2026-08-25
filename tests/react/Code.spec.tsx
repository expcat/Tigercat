/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Code } from '@expcat/tigercat-react/Code'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Code (React)', () => {
  describe('Rendering', () => {
    it('renders code content', () => {
      render(<Code code="const a = 1" />)
      expect(screen.getByText('const a = 1')).toBeInTheDocument()
    })

    it('renders a pre element containing a code element', () => {
      const { container } = render(<Code code="hello" />)
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      const code = pre!.querySelector('code')
      expect(code).toBeInTheDocument()
      expect(code!.textContent).toBe('hello')
    })

    it('renders multiline code preserving line breaks', () => {
      const multiline = 'line1\nline2\nline3'
      const { container } = render(<Code code={multiline} />)
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe(multiline)
    })

    it('renders code with special HTML characters safely', () => {
      const code = '<script>alert("xss")</script>'
      const { container } = render(<Code code={code} />)
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe(code)
      expect(codeEl!.innerHTML).not.toContain('<script>')
    })

    it('shows copy button by default', () => {
      render(<Code code="x = 1" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('hides copy button when copyable is false', () => {
      render(<Code code="let x = 1" copyable={false} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders custom copy labels', () => {
      render(<Code code="x = 1" copyLabel="Copy" copiedLabel="Done" />)
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('renders default copy label as Copy', () => {
      render(<Code code="x = 1" />)
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '复制' })).not.toBeInTheDocument()
    })

    it('lets labels.copyLabel override the idle text', () => {
      render(<Code code="x = 1" labels={{ copyLabel: 'Clone' }} />)
      expect(screen.getByRole('button', { name: 'Clone' })).toBeInTheDocument()
    })

    it('merges className onto container', () => {
      const { container } = render(<Code code="x = 1" className="custom-class" />)
      expect(container.firstElementChild).toHaveClass('custom-class')
    })

    it('passes extra HTML attributes to container', () => {
      const { container } = render(<Code code="x = 1" data-testid="my-code" />)
      expect(container.querySelector('[data-testid="my-code"]')).toBeInTheDocument()
    })
  })

  describe('Copy Functionality', () => {
    it('copies code and fires onCopy', async () => {
      const user = userEvent.setup()
      const onCopy = vi.fn()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="console.log('copy')" onCopy={onCopy} />)
      const button = screen.getByRole('button', { name: 'Copy' })
      await user.click(button)

      expect(writeText).toHaveBeenCalledWith("console.log('copy')")
      expect(onCopy).toHaveBeenCalledWith("console.log('copy')")
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
    })

    it('resets copied state after timeout', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="abc" />)
      const button = screen.getByRole('button', { name: 'Copy' })

      await act(async () => {
        button.click()
        await Promise.resolve()
      })
      expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()

      await act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('shows Copy failed and does not fire onCopy when clipboard fails', async () => {
      vi.useFakeTimers()
      const onCopy = vi.fn()
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="fail" onCopy={onCopy} />)
      const button = screen.getByRole('button', { name: 'Copy' })
      await act(async () => {
        button.click()
        await Promise.resolve()
      })
      expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument()
      expect(onCopy).not.toHaveBeenCalled()
      expect(screen.getByRole('button').className).toContain('--tiger-error')
      expect(screen.getByRole('button').className).not.toContain('--tiger-primary')

      await act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('lets custom copyFailedLabel win on failure', async () => {
      const user = userEvent.setup()
      const onCopy = vi.fn()
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="fail" copyFailedLabel="Nope" onCopy={onCopy} />)
      await user.click(screen.getByRole('button', { name: 'Copy' }))
      expect(screen.getByRole('button', { name: 'Nope' })).toBeInTheDocument()
      expect(onCopy).not.toHaveBeenCalled()
    })

    it('does not copy when copyable is false', () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="x" copyable={false} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(writeText).not.toHaveBeenCalled()
    })

    it('handles rapid consecutive clicks', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const onCopy = vi.fn()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="rapid" onCopy={onCopy} />)
      const button = screen.getByRole('button', { name: 'Copy' })
      await user.click(button)
      await user.click(button)
      await user.click(button)

      expect(writeText).toHaveBeenCalledTimes(3)
      await act(() => {
        vi.advanceTimersByTime(1500)
      })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      vi.useRealTimers()
    })
  })

  describe('locale', () => {
    it('uses ConfigProvider zh-CN for Copy / Copied', async () => {
      const user = userEvent.setup()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })
      render(
        <ConfigProvider locale={zhCN}>
          <Code code="x = 1" />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '复制' }))
      expect(screen.getByRole('button', { name: '已复制' })).toBeInTheDocument()
    })

    it('uses ConfigProvider en-US for Copy', () => {
      render(
        <ConfigProvider locale={enUS}>
          <Code code="x = 1" />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('lets explicit copyLabel win under zh-CN', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <Code code="x = 1" copyLabel="Clone" />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: 'Clone' })).toBeInTheDocument()
    })

    it('shows 复制失败 under ConfigProvider zh-CN when clipboard fails', async () => {
      const user = userEvent.setup()
      const onCopy = vi.fn()
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })
      render(
        <ConfigProvider locale={zhCN}>
          <Code code="fail" onCopy={onCopy} />
        </ConfigProvider>
      )
      await user.click(screen.getByRole('button', { name: '复制' }))
      expect(screen.getByRole('button', { name: '复制失败' })).toBeInTheDocument()
      expect(onCopy).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('copy button has aria-label matching copyLabel', () => {
      render(<Code code="test" copyLabel="Copy code" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy code')
    })

    it('aria-label changes to copiedLabel after copy', async () => {
      const user = userEvent.setup()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(<Code code="test" copyLabel="Copy" copiedLabel="Copied!" />)
      await user.click(screen.getByRole('button', { name: 'Copy' }))
      expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
    })

    it('copy button has type="button"', () => {
      render(<Code code="test" />)
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
      const { container } = render(<Code code="" />)
      const codeEl = container.querySelector('code')
      expect(codeEl).toBeInTheDocument()
      expect(codeEl!.textContent).toBe('')
    })

    it('renders code with only whitespace', () => {
      const { container } = render(<Code code="   " />)
      const codeEl = container.querySelector('code')
      expect(codeEl!.textContent).toBe('   ')
    })

    it('handles very long single-line code', () => {
      const longCode = 'x'.repeat(10000)
      const { container } = render(<Code code={longCode} />)
      expect(container.querySelector('code')!.textContent).toBe(longCode)
    })
  })
})
