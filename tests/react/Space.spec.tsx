/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Space } from '@expcat/tigercat-react'

describe('Space (React)', () => {
  it('renders defaults and children', () => {
    render(
      <Space data-testid="space">
        <span>Item</span>
      </Space>
    )

    const el = screen.getByTestId('space')
    expect(el).toHaveClass('inline-flex', 'flex-row', 'items-start', 'gap-4')
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('supports vertical direction', () => {
    render(
      <Space data-testid="space" direction="vertical">
        <span>Item</span>
      </Space>
    )

    expect(screen.getByTestId('space')).toHaveClass('flex-col')
  })

  it('supports numeric size via inline gap', () => {
    render(
      <Space data-testid="space" size={16}>
        <span>Item</span>
      </Space>
    )

    expect((screen.getByTestId('space') as HTMLElement).style.gap).toBe('16px')
  })

  it('supports wrap', () => {
    render(
      <Space data-testid="space" wrap>
        <span>Item</span>
      </Space>
    )

    expect(screen.getByTestId('space')).toHaveClass('flex-wrap')
  })

  it('merges className and style (style wins over size gap)', () => {
    render(
      <Space
        data-testid="space"
        size={16}
        className="custom"
        style={{ gap: '20px', backgroundColor: 'red' }}>
        <span>Item</span>
      </Space>
    )

    const el = screen.getByTestId('space') as HTMLElement
    expect(el).toHaveClass('inline-flex', 'custom')
    expect(el.style.backgroundColor).toBe('red')
    expect(el.style.gap).toBe('20px')
  })

  it('passes through div attributes', () => {
    render(<Space data-testid="space" id="my-space" aria-label="space" />)

    const el = screen.getByTestId('space')
    expect(el).toHaveAttribute('id', 'my-space')
    expect(el).toHaveAttribute('aria-label', 'space')
  })
})
