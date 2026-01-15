/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Space } from '@expcat/tigercat-vue'
import { h } from 'vue'
import { renderWithProps, renderWithSlots } from '../utils'

describe('Space (Vue)', () => {
  const ItemSlot = () => h('span', 'Item')

  it('renders defaults and children', () => {
    const { container } = renderWithSlots(Space, { default: ItemSlot })

    const el = container.querySelector('div')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('inline-flex', 'flex-row', 'items-start', 'gap-4')
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('supports vertical direction', () => {
    const { container } = renderWithProps(
      Space,
      { direction: 'vertical' },
      { slots: { default: ItemSlot } }
    )

    expect(container.querySelector('div')).toHaveClass('flex-col')
  })

  it('supports numeric size via inline gap', () => {
    const { container } = renderWithProps(Space, { size: 16 }, { slots: { default: ItemSlot } })

    expect((container.querySelector('div') as HTMLElement).style.gap).toBe('16px')
  })

  it('supports wrap', () => {
    const { container } = renderWithProps(Space, { wrap: true }, { slots: { default: ItemSlot } })

    expect(container.querySelector('div')).toHaveClass('flex-wrap')
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

    const el = container.querySelector('div') as HTMLElement
    expect(el).toHaveClass('inline-flex', 'custom')
    expect(el.style.backgroundColor).toBe('red')
    expect(el.style.gap).toBe('20px')
  })
})
