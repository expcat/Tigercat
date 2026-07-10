/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { Divider } from '@expcat/tigercat-react'
import { renderWithProps } from '../utils/render-helpers-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Divider (React)', () => {
  it('renders a separator with default orientation', () => {
    const { container } = render(<Divider />)

    const divider = container.querySelector('[role="separator"]')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
    expect(divider?.className).toContain('border-solid')
    expect(divider?.className).toContain('my-4')
  })

  it('supports vertical orientation', () => {
    const { container } = renderWithProps(Divider, { orientation: 'vertical' })
    const divider = container.querySelector('[role="separator"]')

    expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    expect(divider?.className).toContain('border-l')
    expect(divider?.className).toContain('mx-4')
  })

  it('applies line style classes', () => {
    const { container: dashed } = renderWithProps(Divider, { lineStyle: 'dashed' })
    expect(dashed.querySelector('[role="separator"]')?.className).toContain('border-dashed')

    const { container: dotted } = renderWithProps(Divider, { lineStyle: 'dotted' })
    expect(dotted.querySelector('[role="separator"]')?.className).toContain('border-dotted')
  })
  it('merges custom className', () => {
    const { container } = renderWithProps(Divider, { className: 'custom-divider-class' })
    expect(container.querySelector('[role="separator"]')).toHaveClass('custom-divider-class')
  })

  it('supports custom color and thickness (vertical)', () => {
    const { container } = renderWithProps(Divider, {
      orientation: 'vertical',
      color: '#00ff00',
      thickness: '3px'
    })

    const divider = container.querySelector('[role="separator"]') as HTMLElement
    expect(divider.style.borderColor).toBe('#00ff00')
    expect(divider.style.borderLeftWidth).toBe('3px')
  })

  it('supports custom thickness (horizontal)', () => {
    const { container } = renderWithProps(Divider, { thickness: '2px' })
    const divider = container.querySelector('[role="separator"]') as HTMLElement
    expect(divider.style.borderTopWidth).toBe('2px')
  })

  it('does not set inline style when no custom color/thickness', () => {
    const { container } = render(<Divider />)
    const divider = container.querySelector('[role="separator"]') as HTMLElement
    expect(divider.style.borderColor).toBe('')
    expect(divider.style.borderTopWidth).toBe('')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Divider />)
    await expectNoA11yViolationsIsolated(container)
  })
})
