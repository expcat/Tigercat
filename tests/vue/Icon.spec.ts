/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { Icon } from '@expcat/tigercat-vue'
import { h } from 'vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolations } from '../utils'

describe('Icon (Vue)', () => {
  const SimpleSVG = () =>
    h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M5 12h14', stroke: 'currentColor', 'stroke-width': '2' })
    ])

  it('renders SVG with default size classes', () => {
    const { container } = renderWithSlots(Icon, { default: SimpleSVG })
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('inline-block', 'w-5', 'h-5')
  })

  it('applies each size correctly', () => {
    const sizes = {
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6'],
      xl: ['w-8', 'h-8']
    } as const
    for (const [size, classes] of Object.entries(sizes)) {
      const { container } = renderWithProps(Icon, { size }, { slots: { default: SimpleSVG } })
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass(...classes)
    }
  })

  it('sets wrapper color via color prop', () => {
    const { container } = renderWithProps(
      Icon,
      { color: '#ff0000' },
      { slots: { default: SimpleSVG } }
    )
    const wrapper = container.querySelector('span')
    const svg = container.querySelector('svg')
    expect(wrapper).toHaveStyle({ color: '#ff0000' })
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('applies SVG default attributes to bare SVG', () => {
    const BareSVG = () => h('svg', {}, [h('path', { d: 'M5 12h14' })])
    const { container } = renderWithSlots(Icon, { default: BareSVG })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '2')
    expect(svg).toHaveAttribute('stroke-linecap', 'round')
    expect(svg).toHaveAttribute('stroke-linejoin', 'round')
  })

  it('preserves custom SVG attributes', () => {
    const CustomSVG = () =>
      h('svg', { viewBox: '0 0 20 20', fill: 'currentColor', stroke: 'none' }, [
        h('path', { d: 'M10 10z' })
      ])
    const { container } = renderWithSlots(Icon, { default: CustomSVG })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('stroke', 'none')
  })

  it('forwards attrs to wrapper', () => {
    const { container } = render(Icon, {
      attrs: { 'data-testid': 'icon' },
      slots: { default: SimpleSVG }
    })
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
  })

  it('is aria-hidden by default (decorative)', () => {
    const { container } = renderWithSlots(Icon, { default: SimpleSVG })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper).not.toHaveAttribute('role')
  })

  it('uses role="img" when aria-label is provided', () => {
    const { container } = render(Icon, {
      attrs: { 'aria-label': 'Search' },
      slots: { default: SimpleSVG }
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('uses role="img" when aria-labelledby is provided', () => {
    const { container } = render(Icon, {
      attrs: { 'aria-labelledby': 'label-id' },
      slots: { default: SimpleSVG }
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('respects custom role', () => {
    const { container } = render(Icon, {
      attrs: { role: 'button' },
      slots: { default: SimpleSVG }
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'button')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('passes through non-SVG children unchanged', () => {
    const TextChild = () => h('span', { class: 'label' }, 'Hello')
    const { container } = renderWithSlots(Icon, { default: TextChild })
    expect(container.querySelector('.label')).toBeInTheDocument()
    expect(container.querySelector('.label')?.textContent).toBe('Hello')
  })

  it('handles missing children gracefully', () => {
    const { container } = render(Icon)
    expect(container.querySelector('svg')).toBeFalsy()
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Icon, { default: SimpleSVG })
      await expectNoA11yViolations(container)
    })
  })
})
