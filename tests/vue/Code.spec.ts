/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { Code } from '@expcat/tigercat-vue/Code'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
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

    it('renders default copy label as Copy', () => {
      render(Code, { props: { code: 'x = 1' } })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '复制' })).not.toBeInTheDocument()
    })

    it('renders custom copyFailedLabel', () => {
      render(Code, { props: { code: 'x = 1', copyFailedLabel: 'Nope' } })
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('lets labels.copyLabel override the idle text', () => {
      render(Code, { props: { code: 'x = 1', labels: { copyLabel: 'Clone' } } })
      expect(screen.getByRole('button', { name: 'Clone' })).toBeInTheDocument()
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
      const button = screen.getByRole('button', { name: 'Copy' })
      await fireEvent.click(button)

      expect(writeText).toHaveBeenCalledWith("console.log('copy')")
      expect(emitted().copy?.[0]).toEqual(["console.log('copy')"])
      expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
    })

    it('resets copied state after timeout', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      render(Code, { props: { code: 'abc' } })
      await fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
      })

      vi.advanceTimersByTime(1500)
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      })
      vi.useRealTimers()
    })

    it('shows Copy failed and does not emit copy when clipboard fails', async () => {
      vi.useFakeTimers()
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      const { emitted } = render(Code, { props: { code: 'fail' } })
      await fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument()
      })
      expect(emitted().copy).toBeUndefined()
      expect(screen.getByRole('button').className).toContain('--tiger-error')
      expect(screen.getByRole('button').className).not.toContain('--tiger-primary')

      vi.advanceTimersByTime(1500)
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      })
      vi.useRealTimers()
    })

    it('lets custom copyFailedLabel win on failure', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })

      const { emitted } = render(Code, {
        props: { code: 'fail', copyFailedLabel: 'Nope' }
      })
      await fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
      expect(await screen.findByRole('button', { name: 'Nope' })).toBeInTheDocument()
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
      const button = screen.getByRole('button', { name: 'Copy' })
      await fireEvent.click(button)
      await fireEvent.click(button)
      await fireEvent.click(button)

      expect(writeText).toHaveBeenCalledTimes(3)
      vi.advanceTimersByTime(1500)
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
      })
      vi.useRealTimers()
    })
  })

  describe('locale', () => {
    it('uses ConfigProvider zh-CN for Copy / Copied / Copy failed', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: zhCN }, () => h(Code, { code: 'x = 1' }))
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: '复制' })).toBeInTheDocument()
      await fireEvent.click(screen.getByRole('button', { name: '复制' }))
      expect(await screen.findByRole('button', { name: '已复制' })).toBeInTheDocument()
    })

    it('uses ConfigProvider en-US for Copy', () => {
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: enUS }, () => h(Code, { code: 'x = 1' }))
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    })

    it('lets explicit copyLabel win under zh-CN', () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () =>
              h(Code, { code: 'x = 1', copyLabel: 'Clone' })
            )
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: 'Clone' })).toBeInTheDocument()
    })

    it('shows 复制失败 under ConfigProvider zh-CN when clipboard fails', async () => {
      const writeText = vi.fn().mockRejectedValue(new Error('fail'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true
      })
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: zhCN }, () => h(Code, { code: 'fail' }))
        }
      })
      render(Wrapper)
      await fireEvent.click(screen.getByRole('button', { name: '复制' }))
      expect(await screen.findByRole('button', { name: '复制失败' })).toBeInTheDocument()
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
  })
})
