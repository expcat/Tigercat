/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Badge } from '@expcat/tigercat-vue/Badge'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { resetDevWarnCache } from '@expcat/tigercat-core'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Badge', () => {
  it('renders string content as visible text without a live region', () => {
    const { container } = render(Badge, { props: { type: 'text', content: 'NEW' } })
    expect(screen.getByText('NEW')).toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('applies className on the standalone badge', () => {
    const { container } = renderWithProps(Badge, { content: 5, className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders a decorative dot unless the caller names it', () => {
    const { container } = renderWithProps(Badge, { type: 'dot' })
    const badge = container.firstElementChild
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([false, 'false'] as const)('preserves aria-hidden=%s on a count', (ariaHidden) => {
    render(Badge, {
      props: { content: 5 },
      attrs: { 'aria-hidden': ariaHidden, 'aria-label': 'Unread messages' }
    })
    expect(screen.getByText('5')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText('5')).toHaveAttribute('aria-label', 'Unread messages')
  })

  it('formats overlay counts with the component locale override', () => {
    const { container } = render({
      components: { Badge, ConfigProvider },
      setup: () => ({
        locale: { locale: 'ar-SA', status: { badgeCountLabel: '{count} إشعارات' } }
      }),
      template: `
        <ConfigProvider :locale="{ locale: 'en-US' }">
          <Badge :content="1234" :standalone="false" :locale="locale">
            <button>Host</button>
          </Badge>
        </ConfigProvider>
      `
    })
    expect(container.querySelector('.sr-only')).toHaveTextContent('١٬٢٣٤ إشعارات')
  })

  it('keeps a named dot when its locale label is empty', () => {
    const { container } = render(Badge, {
      props: { type: 'dot', locale: { status: { badgeLabel: '' } } },
      attrs: { 'aria-label': 'New message' }
    })
    expect(container.firstElementChild).toHaveClass('w-2.5', 'h-2.5')
    expect(container.firstElementChild).toHaveAttribute('aria-label', 'New message')
    expect(container.firstElementChild).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('caps number content and leaves text content uncapped', () => {
    const { unmount } = render(Badge, { props: { content: 150, max: 99 } })
    expect(screen.getByText('99+')).toBeInTheDocument()
    unmount()
    render(Badge, { props: { type: 'text', content: 150, max: 99 } })
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('hides when content is 0 and showZero is false', () => {
    const { container } = renderWithProps(Badge, { content: 0, showZero: false })
    expect(screen.queryByText('0')).not.toBeInTheDocument()
    expect(container.querySelector('span')).toBeNull()
  })

  it('shows standalone zero counts by default', () => {
    renderWithProps(Badge, { content: 0 })
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('keeps the overlay wrapper when the count hides', async () => {
    const Host = defineComponent({
      setup() {
        const count = ref(5)
        return () => [
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                count.value = 0
              }
            },
            'clear'
          ),
          h(
            Badge,
            { content: count.value, standalone: false },
            {
              default: () =>
                h(Button, { 'aria-label': `消息 ${count.value} 条` }, { default: () => '消息' })
            }
          )
        ]
      }
    })

    const { container } = render(Host)
    expect(screen.getByRole('button', { name: '消息 5 条' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'clear' }))
    expect(screen.getByRole('button', { name: '消息 0 条' })).toBeInTheDocument()
    expect(container.querySelector('.relative')).toBeInTheDocument()
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('puts overlay className on the wrapper', () => {
    const { container } = renderWithProps(
      Badge,
      { content: 5, standalone: false, className: 'host-class' },
      { slots: { default: '<button>消息</button>' } }
    )
    expect(container.firstElementChild).toHaveClass('host-class')
  })

  it('warns when children are passed in standalone mode', () => {
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    renderWithProps(Badge, { content: 1 }, { slots: { default: '<button>Ignored</button>' } })
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith(
      '[Tigercat] Badge received children while standalone. Pass standalone={false} to overlay the badge on the host.'
    )
    warn.mockRestore()
  })

  it('passes accessibility checks for number, text, dot, and overlay', async () => {
    const { container } = render({
      components: { Badge, Button },
      template: `
        <div>
          <Badge :content="5" />
          <Badge type="text" content="NEW" />
          <Badge type="dot" />
          <Badge :content="5" :standalone="false">
            <Button aria-label="消息 5 条">消息</Button>
          </Badge>
        </div>
      `
    })
    await expectNoA11yViolationsIsolated(container)
  })
})
