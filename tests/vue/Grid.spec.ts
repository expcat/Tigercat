/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Row, Col } from '@tigercat/vue'
import { expectNoA11yViolations } from '../utils'

describe('Grid (Vue)', () => {
  it('renders Row defaults and forwards attrs', () => {
    render(Row, { attrs: { 'data-testid': 'row' } })

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('flex', 'w-full', 'flex-wrap', 'items-start', 'justify-start')
  })

  it('applies align/justify classes', () => {
    render(Row, {
      props: { align: 'middle', justify: 'center' },
      attrs: { 'data-testid': 'row' }
    })

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('items-center', 'justify-center')
  })

  it('applies gutter styles to Row and Col', () => {
    render(Row, {
      props: { gutter: 16 },
      attrs: { 'data-testid': 'row' },
      slots: {
        default: () => h(Col, { 'data-testid': 'col' }, () => 'Content')
      }
    })

    const row = screen.getByTestId('row') as HTMLElement
    const col = screen.getByTestId('col') as HTMLElement

    expect(row.style.marginLeft).toBe('-8px')
    expect(row.style.marginRight).toBe('-8px')
    expect(col.style.paddingLeft).toBe('8px')
    expect(col.style.paddingRight).toBe('8px')
  })

  it('applies span/offset classes', () => {
    render(Col, {
      props: { span: 12, offset: 4 },
      attrs: { 'data-testid': 'col' }
    })

    const col = screen.getByTestId('col') as HTMLElement
    expect(col.className).toContain('w-[var(--tiger-col-span)]')
    expect(col.className).toContain('ml-[var(--tiger-col-offset)]')

    expect(col.style.getPropertyValue('--tiger-col-span')).toBe('50%')
    expect(col.style.getPropertyValue('--tiger-col-offset')).toBe('16.666667%')
  })

  it('supports flex layout with span=0', () => {
    render(Col, {
      props: { span: 0, flex: '0_0_160px' },
      attrs: { 'data-testid': 'col' }
    })

    const col = screen.getByTestId('col') as HTMLElement
    expect(col.className).toContain('flex-[var(--tiger-col-flex)]')
    expect(col.className).not.toContain('w-[var(--tiger-col-span)]')
    expect(col.style.getPropertyValue('--tiger-col-flex')).toBe('0 0 160px')
  })

  it('supports order (including responsive)', () => {
    render(Col, {
      props: { order: { xs: 3, md: 1 } },
      attrs: { 'data-testid': 'col' }
    })

    const col = screen.getByTestId('col') as HTMLElement
    expect(col.className).toContain('order-[var(--tiger-col-order)]')
    expect(col.style.getPropertyValue('--tiger-col-order')).toBe('3')
    expect(col.style.getPropertyValue('--tiger-col-order-md')).toBe('1')
  })

  it('has no a11y violations for a basic grid', async () => {
    const { container } = render(Row, {
      slots: {
        default: () => h(Col, () => 'Content')
      }
    })

    await expectNoA11yViolations(container)
  })
})
