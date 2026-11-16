/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef, useState } from 'react'
import { Badge } from '@expcat/tigercat-react/Badge'
import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { resetDevWarnCache } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Badge', () => {
  it('renders string content as visible text without a live region', () => {
    const { container } = render(<Badge type="text" content="NEW" />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('applies className on the standalone badge', () => {
    const { container } = render(<Badge content={5} className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('forwards ref to the standalone badge', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref} content={5} />)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.textContent).toBe('5')
  })

  it('renders a decorative dot unless the caller names it', () => {
    const { container } = render(<Badge type="dot" />)
    const badge = container.firstElementChild
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-hidden', 'true')
  })

  it.each([false, 'false'] as const)('preserves aria-hidden=%s on a count', (ariaHidden) => {
    render(<Badge content={5} aria-hidden={ariaHidden} aria-label="Unread messages" />)
    expect(screen.getByText('5')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByText('5')).toHaveAttribute('aria-label', 'Unread messages')
  })

  it('formats overlay counts with the component locale override', () => {
    const { container } = render(
      <ConfigProvider locale={{ locale: 'en-US' }}>
        <Badge
          content={1234}
          standalone={false}
          locale={{ locale: 'ar-SA', status: { badgeCountLabel: '{count} إشعارات' } }}>
          <button>Host</button>
        </Badge>
      </ConfigProvider>
    )
    expect(container.querySelector('.sr-only')).toHaveTextContent('١٬٢٣٤ إشعارات')
  })

  it('keeps a named dot when its locale label is empty', () => {
    const { container } = render(
      <Badge type="dot" locale={{ status: { badgeLabel: '' } }} aria-label="New message" />
    )
    expect(container.firstElementChild).toHaveClass('w-2.5', 'h-2.5')
    expect(container.firstElementChild).toHaveAttribute('aria-label', 'New message')
    expect(container.firstElementChild).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('caps number content and leaves text content uncapped', () => {
    const { rerender } = render(<Badge content={150} max={99} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
    rerender(<Badge type="text" content={150} max={99} />)
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('hides when content is 0 and showZero is false', () => {
    const { container } = render(<Badge content={0} showZero={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows standalone zero counts by default', () => {
    render(<Badge content={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('keeps the overlay wrapper when the count hides', async () => {
    const user = userEvent.setup()

    function Host() {
      const [count, setCount] = useState(5)
      return (
        <>
          <button type="button" onClick={() => setCount(0)}>
            clear
          </button>
          <Badge content={count} standalone={false}>
            <Button aria-label={`消息 ${count} 条`}>消息</Button>
          </Badge>
        </>
      )
    }

    const { container } = render(<Host />)
    expect(screen.getByRole('button', { name: '消息 5 条' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'clear' }))
    expect(screen.getByRole('button', { name: '消息 0 条' })).toBeInTheDocument()
    expect(container.querySelector('.relative')).toBeInTheDocument()
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('puts overlay className and ref on the wrapper', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(
      <Badge ref={ref} content={5} standalone={false} className="host-class">
        <button>消息</button>
      </Badge>
    )
    expect(ref.current).toBe(container.firstElementChild)
    expect(container.firstElementChild).toHaveClass('host-class')
  })

  it('warns when children are passed in standalone mode', () => {
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <Badge content={1}>
        <button>Ignored</button>
      </Badge>
    )
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith(
      '[Tigercat] Badge received children while standalone. Pass standalone={false} to overlay the badge on the host.'
    )
    warn.mockRestore()
  })

  it('passes accessibility checks for number, text, dot, and overlay', async () => {
    const { container } = render(
      <>
        <Badge content={5} />
        <Badge type="text" content="NEW" />
        <Badge type="dot" />
        <Badge content={5} standalone={false}>
          <Button aria-label="消息 5 条">消息</Button>
        </Badge>
      </>
    )
    await expectNoA11yViolationsIsolated(container)
  })
})
