/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Space } from '@expcat/tigercat-vue/Space'
import { h } from 'vue'
import { renderWithProps, renderWithSlots } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-tiger-space]') as HTMLElement
}

describe('Space (Vue)', () => {
  const ItemSlot = () => h('span', 'Item')

  it('renders defaults and children', () => {
    const { container } = renderWithSlots(Space, { default: ItemSlot })
    const el = getRoot(container)
    expect(getComputedStyle(el).display).toBe('inline-flex')
    expect(getComputedStyle(el).flexDirection).toBe('row')
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('supports vertical direction', () => {
    const { container } = renderWithProps(
      Space,
      { direction: 'vertical' },
      { slots: { default: ItemSlot } }
    )
    expect(getComputedStyle(getRoot(container)).flexDirection).toBe('column')
  })

  it('reverses the inline axis under rtl', () => {
    const { container } = render({
      template: '<div dir="rtl"><Space><span>A</span><span>B</span></Space></div>',
      components: { Space }
    })
    expect(getComputedStyle(getRoot(container)).flexDirection).toBe('row-reverse')
  })

  it('supports numeric size via inline gap', () => {
    const { container } = renderWithProps(Space, { size: 16 }, { slots: { default: ItemSlot } })
    expect(getRoot(container).style.gap).toBe('16px')
  })

  it('wraps items in a narrow container', () => {
    const { container } = render({
      template:
        '<div style="width:80px"><Space wrap :size="4"><span style="display:inline-block;width:50px">A</span><span style="display:inline-block;width:50px">B</span><span style="display:inline-block;width:50px">C</span></Space></div>',
      components: { Space }
    })
    const root = getRoot(container)
    expect(getComputedStyle(root).flexWrap).toBe('wrap')
  })

  it('merges className without replacing base classes', () => {
    const { container } = render(Space, {
      props: { className: 'custom' },
      slots: { default: ItemSlot }
    })
    const el = getRoot(container)
    expect(el.className).toContain('custom')
    expect(el.className.match(/custom/g)?.length).toBe(1)
  })

  it('fires onClick once', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    const { container } = render(Space, {
      attrs: { onClick },
      slots: { default: ItemSlot }
    })
    await user.click(getRoot(container))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('merges attrs class/style (attrs style wins over size gap)', () => {
    const { container } = renderWithProps(
      Space,
      { size: 16 },
      {
        attrs: {
          class: 'custom',
          style: { gap: '20px', backgroundColor: 'red' }
        },
        slots: { default: ItemSlot }
      }
    )

    const el = getRoot(container)
    expect(el.className).toContain('custom')
    expect(el.style.backgroundColor).toBe('red')
    expect(el.style.gap).toBe('20px')
  })

  it('passes through div attributes', () => {
    const { container } = renderWithProps(
      Space,
      {},
      {
        attrs: { id: 'my-space', 'aria-label': 'space' },
        slots: { default: ItemSlot }
      }
    )

    const el = getRoot(container)
    expect(el).toHaveAttribute('id', 'my-space')
    expect(el).toHaveAttribute('aria-label', 'space')
  })
})
