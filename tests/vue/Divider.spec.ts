/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { Divider } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('Divider (Vue)', () => {
  it('renders a separator with default orientation', () => {
    const { container } = render(Divider)

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

  it('applies spacing classes for each orientation', () => {
    const { container: horizontal } = renderWithProps(Divider, {
      spacing: 'lg',
      orientation: 'horizontal'
    })
    expect(horizontal.querySelector('[role="separator"]')?.className).toContain('my-6')

    const { container: vertical } = renderWithProps(Divider, {
      spacing: 'lg',
      orientation: 'vertical'
    })
    expect(vertical.querySelector('[role="separator"]')?.className).toContain('mx-6')
  })

  it('applies no spacing classes when spacing is none', () => {
    const { container } = renderWithProps(Divider, { spacing: 'none' })
    const cls = container.querySelector('[role="separator"]')?.className ?? ''
    expect(cls).not.toMatch(/my-|mx-/)
  })

  it('merges custom class via attrs', () => {
    const { container } = render(Divider, { attrs: { class: 'custom-divider-class' } })
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
    const { container } = render(Divider)
    const divider = container.querySelector('[role="separator"]') as HTMLElement
    expect(divider.style.borderColor).toBe('')
    expect(divider.style.borderTopWidth).toBe('')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Divider)
    await expectNoA11yViolations(container)
  })
})
