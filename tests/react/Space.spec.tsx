/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Space } from '@expcat/tigercat-react/Space'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-space]') as HTMLElement
}

describe('Space (React)', () => {
  it('renders defaults and children', () => {
    const { container } = render(
      <Space>
        <span>Item</span>
      </Space>
    )

    const el = getRoot(container)
    expect(getComputedStyle(el).display).toBe('inline-flex')
    expect(getComputedStyle(el).flexDirection).toBe('row')
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('forwards the ref to the root', () => {
    const ref = React.createRef<HTMLDivElement>()
    const { container } = render(<Space ref={ref}>Item</Space>)
    expect(ref.current).toBe(getRoot(container))
  })

  it('supports vertical direction', () => {
    const { container } = render(
      <Space direction="vertical">
        <span>Item</span>
      </Space>
    )
    expect(getComputedStyle(getRoot(container)).flexDirection).toBe('column')
  })

  it('reverses the inline axis under rtl', () => {
    const { container } = render(
      <div dir="rtl">
        <Space>
          <span>A</span>
          <span>B</span>
        </Space>
      </div>
    )
    expect(getComputedStyle(getRoot(container)).flexDirection).toBe('row-reverse')
  })

  it('supports numeric size via inline gap', () => {
    const { container } = render(
      <Space size={16}>
        <span>Item</span>
      </Space>
    )
    expect(getRoot(container).style.gap).toBe('16px')
  })

  it('wraps items in a narrow container', () => {
    const { container } = render(
      <div style={{ width: 80 }}>
        <Space wrap size={4}>
          <span style={{ display: 'inline-block', width: 50 }}>A</span>
          <span style={{ display: 'inline-block', width: 50 }}>B</span>
          <span style={{ display: 'inline-block', width: 50 }}>C</span>
        </Space>
      </div>
    )
    const root = getRoot(container)
    expect(getComputedStyle(root).flexWrap).toBe('wrap')
    const items = root.querySelectorAll('span')
    if (items.length === 3 && items[0].offsetHeight > 0) {
      expect(items[2].offsetTop).toBeGreaterThan(items[0].offsetTop)
    }
  })

  it('merges className and style (style wins over size gap)', () => {
    const { container } = render(
      <Space size={16} className="custom" style={{ gap: '20px', backgroundColor: 'red' }}>
        <span>Item</span>
      </Space>
    )

    const el = getRoot(container)
    expect(el.className).toContain('custom')
    expect(el.className).toContain('tiger-space')
    expect(el.style.backgroundColor).toBe('red')
    expect(el.style.gap).toBe('20px')
  })

  it('passes through div attributes and fires onClick once', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<Space id="my-space" aria-label="space" onClick={onClick} />)
    const el = getRoot(container)
    expect(el).toHaveAttribute('id', 'my-space')
    expect(el).toHaveAttribute('aria-label', 'space')
    await user.click(el)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Space />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
