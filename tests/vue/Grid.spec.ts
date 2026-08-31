/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Col } from '@expcat/tigercat-vue/Col'
import { Row } from '@expcat/tigercat-vue/Row'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Grid (Vue)', () => {
  it('renders Row defaults and forwards attrs', () => {
    render(Row, { attrs: { 'data-testid': 'row' } })
    const row = screen.getByTestId('row')
    expect(row).toHaveClass('tiger-row')
    expect(getComputedStyle(row).flexWrap).toBe('wrap')
  })

  it('keeps a numeric gutter on the row without negative margin', () => {
    render(Row, {
      props: { gutter: 16 },
      attrs: { 'data-testid': 'row' },
      slots: {
        default: () => h(Col, { 'data-testid': 'col' }, () => 'Content')
      }
    })
    const row = screen.getByTestId('row') as HTMLElement
    expect(row.style.getPropertyValue('--tiger-row-gutter-x')).toBe('16px')
    expect(row.style.getPropertyValue('--tiger-row-gutter-y')).toBe('')
    expect(getComputedStyle(row).columnGap).toBe('16px')
    expect(getComputedStyle(row).rowGap).toBe('0px')
  })

  it('uses flex when flex is passed without span=0', () => {
    render(Col, {
      props: { flex: '0_0_160px' },
      attrs: { 'data-testid': 'col' }
    })
    const col = screen.getByTestId('col') as HTMLElement
    expect(col.className).toContain('tiger-col-flex')
    expect(col.style.getPropertyValue('--tiger-col-flex')).toBe('0 0 160px')
    expect(col.style.getPropertyValue('--tiger-col-span')).toBe('')
  })

  it('hides span=0 and writes an explicit 0 offset', () => {
    render(Col, {
      props: { span: 0 },
      attrs: { 'data-testid': 'hidden' }
    })
    expect(screen.getByTestId('hidden').style.getPropertyValue('--tiger-col-display-base')).toBe(
      'none'
    )

    render(Col, {
      props: { offset: { xs: 4, md: 0 } },
      attrs: { 'data-testid': 'offset' }
    })
    const col = screen.getByTestId('offset') as HTMLElement
    expect(col.style.getPropertyValue('--tiger-col-offset')).toBe('4')
    expect(col.style.getPropertyValue('--tiger-col-offset-md')).toBe('0')
  })

  it('supports order (including responsive)', () => {
    render(Col, {
      props: { order: { xs: 3, md: 1 } },
      attrs: { 'data-testid': 'col' }
    })
    const col = screen.getByTestId('col') as HTMLElement
    expect(col.style.getPropertyValue('--tiger-col-order')).toBe('3')
    expect(col.style.getPropertyValue('--tiger-col-order-md')).toBe('1')
  })

  it('disables wrapping with wrap=false', () => {
    render(Row, {
      props: { wrap: false },
      attrs: { 'data-testid': 'row' }
    })
    expect(screen.getByTestId('row')).toHaveClass('tiger-row-nowrap')
  })

  it('applies both axes with tuple gutter [horizontal, vertical]', () => {
    render(Row, {
      props: { gutter: [16, 24] },
      attrs: { 'data-testid': 'row' },
      slots: {
        default: () => h(Col, { 'data-testid': 'col' }, () => 'Content')
      }
    })
    const row = screen.getByTestId('row') as HTMLElement
    expect(row.style.getPropertyValue('--tiger-row-gutter-x')).toBe('16px')
    expect(row.style.getPropertyValue('--tiger-row-gutter-y')).toBe('24px')
    expect(getComputedStyle(row).columnGap).toBe('16px')
    expect(getComputedStyle(row).rowGap).toBe('24px')
  })

  it('merges className without replacing the row/col base class and clicks once', async () => {
    const onClick = vi.fn()
    render(Row, {
      props: { className: 'custom' },
      attrs: { 'data-testid': 'row', onClick },
      slots: {
        default: () =>
          h(Col, { className: 'custom-col', 'data-testid': 'col', span: 12 }, () => 'Content')
      }
    })
    const row = screen.getByTestId('row')
    const col = screen.getByTestId('col')
    expect(row.className).toContain('tiger-row')
    expect(row.className).toContain('custom')
    expect(col.className).toContain('tiger-col')
    expect(col.className).toContain('custom-col')
    await fireEvent.click(row)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has no a11y violations for a basic grid', async () => {
    const { container } = render(Row, {
      slots: {
        default: () => h(Col, () => 'Content')
      }
    })
    await expectNoA11yViolationsIsolated(container)
  })
})
