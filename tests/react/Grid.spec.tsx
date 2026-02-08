/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Row, Col } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Grid (React)', () => {
  it('renders Row defaults and forwards div props', () => {
    render(<Row data-testid="row" />)

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('flex', 'w-full', 'flex-wrap', 'items-start', 'justify-start')
  })

  it('applies align/justify classes', () => {
    render(<Row data-testid="row" align="middle" justify="center" />)

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('items-center', 'justify-center')
  })

  it('applies gutter styles to Row and Col', () => {
    render(
      <Row data-testid="row" gutter={16}>
        <Col data-testid="col">Content</Col>
      </Row>
    )

    const row = screen.getByTestId('row')
    const col = screen.getByTestId('col')

    expect(row).toHaveStyle({ marginLeft: '-8px', marginRight: '-8px' })
    expect(col).toHaveStyle({ paddingLeft: '8px', paddingRight: '8px' })
  })

  it('applies span/offset classes', () => {
    render(<Col data-testid="col" span={12} offset={4} />)

    const col = screen.getByTestId('col')
    expect(col.className).toContain('w-[var(--tiger-col-span)]')
    expect(col.className).toContain('ml-[var(--tiger-col-offset)]')

    expect(col.style.getPropertyValue('--tiger-col-span')).toBe('50%')
    expect(col.style.getPropertyValue('--tiger-col-offset')).toBe('16.666667%')
  })

  it('supports flex layout with span=0', () => {
    render(<Col data-testid="col" span={0} flex="0_0_160px" />)

    const col = screen.getByTestId('col')
    expect(col.className).toContain('flex-[var(--tiger-col-flex)]')
    expect(col.className).not.toContain('w-[var(--tiger-col-span)]')
    expect(col.style.getPropertyValue('--tiger-col-flex')).toBe('0 0 160px')
  })

  it('supports order (including responsive)', () => {
    render(<Col data-testid="col" order={{ xs: 3, md: 1 }} />)

    const col = screen.getByTestId('col')
    expect(col.className).toContain('order-[var(--tiger-col-order)]')
    expect(col.style.getPropertyValue('--tiger-col-order')).toBe('3')
    expect(col.style.getPropertyValue('--tiger-col-order-md')).toBe('1')
  })

  it('disables wrapping with wrap={false}', () => {
    render(<Row data-testid="row" wrap={false} />)

    const row = screen.getByTestId('row')
    expect(row).toHaveClass('flex', 'w-full')
    expect(row).not.toHaveClass('flex-wrap')
  })

  it('applies both axes with tuple gutter [horizontal, vertical]', () => {
    render(
      <Row data-testid="row" gutter={[16, 24]}>
        <Col data-testid="col">Content</Col>
      </Row>
    )

    const row = screen.getByTestId('row')
    const col = screen.getByTestId('col')

    expect(row).toHaveStyle({
      marginLeft: '-8px',
      marginRight: '-8px',
      marginTop: '-12px',
      marginBottom: '-12px'
    })
    expect(col).toHaveStyle({
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '12px',
      paddingBottom: '12px'
    })
  })

  it('applies responsive span CSS variables', () => {
    render(<Col data-testid="col" span={{ xs: 24, md: 12, lg: 8 }} />)

    const col = screen.getByTestId('col')
    expect(col.style.getPropertyValue('--tiger-col-span')).toBe('100%')
    expect(col.style.getPropertyValue('--tiger-col-span-md')).toBe('50%')
    expect(col.style.getPropertyValue('--tiger-col-span-lg')).toBe('33.333333%')
  })

  it('forwards custom className and style on Col', () => {
    render(<Col data-testid="col" span={12} className="custom-class" style={{ color: 'red' }} />)

    const col = screen.getByTestId('col')
    expect(col).toHaveClass('custom-class')
    expect(col.style.color).toBe('red')
  })

  it('has no a11y violations for a basic grid', async () => {
    const { container } = render(
      <Row>
        <Col>Content</Col>
      </Row>
    )

    await expectNoA11yViolations(container)
  })
})
