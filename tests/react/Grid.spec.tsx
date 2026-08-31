/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Col } from '@expcat/tigercat-react/Col'
import { Row } from '@expcat/tigercat-react/Row'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function box(el: Element) {
  return (el as HTMLElement).getBoundingClientRect()
}

describe('Grid (React)', () => {
  it('renders Row defaults and forwards div props', () => {
    render(<Row data-testid="row" />)
    const row = screen.getByTestId('row')
    expect(row).toHaveClass('tiger-row')
    expect(getComputedStyle(row).flexWrap).toBe('wrap')
  })

  it('keeps a numeric gutter on the row and does not overflow the parent', () => {
    const { container } = render(
      <div data-testid="parent" style={{ width: 480 }}>
        <Row data-testid="row" gutter={16}>
          <Col data-testid="a" span={12}>
            A
          </Col>
          <Col data-testid="b" span={12}>
            B
          </Col>
        </Row>
      </div>
    )
    const parent = screen.getByTestId('parent')
    const row = screen.getByTestId('row')
    expect(row.style.getPropertyValue('--tiger-row-gutter-x')).toBe('16px')
    expect(row.style.getPropertyValue('--tiger-row-gutter-y')).toBe('')
    expect(getComputedStyle(row).columnGap).toBe('16px')
    expect(getComputedStyle(row).rowGap).toBe('0px')
    const parentBox = box(parent)
    const rowBox = box(row)
    if (parentBox.width > 0) {
      expect(rowBox.left).toBeGreaterThanOrEqual(parentBox.left - 0.5)
      expect(rowBox.right).toBeLessThanOrEqual(parentBox.right + 0.5)
    }
    expect(container.querySelector('.tiger-col')).toBeTruthy()
  })

  it('uses flex when flex is passed without span=0', () => {
    render(<Col data-testid="col" flex="120px" />)
    const col = screen.getByTestId('col')
    expect(col.className).toContain('tiger-col-flex')
    expect(col.style.getPropertyValue('--tiger-col-flex')).toBe('120px')
    expect(col.style.getPropertyValue('--tiger-col-span')).toBe('')
  })

  it('hides span={0} and keeps offset 0 at a larger breakpoint', () => {
    const hidden = render(<Col data-testid="hidden" span={0} />)
    expect(hidden.getByTestId('hidden').style.getPropertyValue('--tiger-col-display-base')).toBe(
      'none'
    )
    expect(getComputedStyle(hidden.getByTestId('hidden')).display).toBe('none')

    render(<Col data-testid="offset" offset={{ xs: 4, md: 0 }} />)
    const col = screen.getByTestId('offset')
    expect(col.style.getPropertyValue('--tiger-col-offset')).toBe('4')
    expect(col.style.getPropertyValue('--tiger-col-offset-md')).toBe('0')
  })

  it('order only changes visual flex order', () => {
    render(
      <Row data-testid="row">
        <Col data-testid="first" order={2}>
          <button>first</button>
        </Col>
        <Col data-testid="second" order={1}>
          <button>second</button>
        </Col>
      </Row>
    )
    expect(screen.getByTestId('first').style.getPropertyValue('--tiger-col-order')).toBe('2')
    expect(screen.getByTestId('second').style.getPropertyValue('--tiger-col-order')).toBe('1')
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('first')
    expect(buttons[1]).toHaveTextContent('second')
  })

  it('disables wrapping with wrap={false}', () => {
    render(<Row data-testid="row" wrap={false} />)
    expect(screen.getByTestId('row')).toHaveClass('tiger-row-nowrap')
    expect(getComputedStyle(screen.getByTestId('row')).flexWrap).toBe('nowrap')
  })

  it('applies both axes with tuple gutter [horizontal, vertical]', () => {
    render(
      <Row data-testid="row" gutter={[16, 24]}>
        <Col data-testid="col">Content</Col>
      </Row>
    )
    const row = screen.getByTestId('row')
    expect(row.style.getPropertyValue('--tiger-row-gutter-x')).toBe('16px')
    expect(row.style.getPropertyValue('--tiger-row-gutter-y')).toBe('24px')
    expect(getComputedStyle(row).columnGap).toBe('16px')
    expect(getComputedStyle(row).rowGap).toBe('24px')
  })

  it('forwards ref, className, and a single click on Row and Col', () => {
    const rowRef = React.createRef<HTMLDivElement>()
    const colRef = React.createRef<HTMLDivElement>()
    const onRowClick = vi.fn()
    const onColClick = vi.fn()
    render(
      <Row ref={rowRef} data-testid="row" className="custom-row" onClick={onRowClick}>
        <Col
          ref={colRef}
          data-testid="col"
          span={12}
          className="custom-class"
          style={{ color: 'red' }}
          onClick={onColClick}>
          Content
        </Col>
      </Row>
    )
    const row = screen.getByTestId('row')
    const col = screen.getByTestId('col')
    expect(rowRef.current).toBe(row)
    expect(colRef.current).toBe(col)
    expect(row.className).toContain('tiger-row')
    expect(row.className).toContain('custom-row')
    expect(col).toHaveClass('custom-class')
    expect(col).toHaveClass('tiger-col')
    expect(col.style.color).toBe('red')
    fireEvent.click(col)
    expect(onColClick).toHaveBeenCalledTimes(1)
  })

  it('has no a11y violations for a basic grid', async () => {
    const { container } = render(
      <Row>
        <Col>Content</Col>
      </Row>
    )
    await expectNoA11yViolationsIsolated(container)
  })
})
