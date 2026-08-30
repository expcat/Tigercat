/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from '@expcat/tigercat-react/Icon'
import type { IconDefinition } from '@expcat/tigercat-core'
import { resetDevWarnCache } from '@expcat/tigercat-core'
import { renderWithProps, renderWithChildren } from '../utils/render-helpers-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Icon (React)', () => {
  const SimpleSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  )

  it('renders SVG with default size classes', () => {
    const { container } = renderWithChildren(Icon, SimpleSVG)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('inline-block', 'w-5', 'h-5')
  })

  it('renders a built-in icon by name', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg?.querySelector('path')).toHaveAttribute('d', 'm4.5 12.75 6 6 9-13.5')
  })

  it('prefers custom children over the name prop', () => {
    const { container } = render(<Icon name="check">{SimpleSVG}</Icon>)
    expect(container.querySelector('svg path')).toHaveAttribute('d', 'M5 12h14')
  })

  const logo: IconDefinition = { viewBox: '0 0 32 32', paths: ['M16 2 2 30h28Z'], mode: 'fill' }

  it('renders a custom definition via the icon prop, preferring it over name', () => {
    const { container } = render(<Icon icon={logo} name="check" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 32 32')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('stroke', 'none')
    expect(svg).not.toHaveAttribute('stroke-width')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg?.querySelector('path')).toHaveAttribute('d', 'M16 2 2 30h28Z')
  })

  it('treats a definition without mode as a stroke icon', () => {
    const outline = { viewBox: '0 0 24 24', paths: ['M5 12h14'] } as IconDefinition
    const { container } = render(<Icon icon={outline} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveAttribute('stroke-width', '1.5')
  })

  it('forwards ref to the wrapper span', () => {
    const ref = React.createRef<HTMLSpanElement>()
    const { container } = render(<Icon name="check" ref={ref} />)
    expect(ref.current).toBe(container.querySelector('span'))
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
  })

  it('keeps style.color when color is omitted', () => {
    const { container } = render(<Icon name="check" style={{ color: 'red' }} />)
    expect(container.querySelector('span')).toHaveStyle({ color: 'red' })
  })

  it('falls back to md size classes for an unknown size', () => {
    const { container } = render(<Icon name="check" size={'xxl' as 'md'} />)
    expect(container.querySelector('svg')).toHaveClass('w-5', 'h-5')
  })

  it('warns for an unknown built-in name and renders an empty decorative span', () => {
    resetDevWarnCache()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Icon name={'not-a-real-icon' as 'check'} />)
    expect(container.querySelector('svg')).toBeFalsy()
    expect(container.querySelector('span')).toHaveAttribute('aria-hidden', 'true')
    expect(warnSpy).toHaveBeenCalledWith(
      '[Tigercat] Icon name "not-a-real-icon" is not registered.'
    )
    warnSpy.mockRestore()
  })

  it('prefers custom children over the icon prop', () => {
    const { container } = render(<Icon icon={logo}>{SimpleSVG}</Icon>)
    expect(container.querySelector('svg path')).toHaveAttribute('d', 'M5 12h14')
  })

  it('applies each size correctly', () => {
    const sizes = {
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6'],
      xl: ['w-8', 'h-8']
    } as const
    for (const [size, classes] of Object.entries(sizes)) {
      const { container } = renderWithProps(Icon, {
        size: size as 'sm' | 'md' | 'lg' | 'xl',
        children: SimpleSVG
      })
      const svg = container.querySelector('svg')
      expect(svg).toHaveClass(...classes)
    }
  })

  it('sets wrapper color style and keeps SVG stroke default', () => {
    const { container } = renderWithProps(Icon, {
      color: '#ff0000',
      children: (
        <svg>
          <path d="M5 12h14" />
        </svg>
      )
    })
    const wrapper = container.querySelector('span')
    const svg = container.querySelector('svg')
    expect(wrapper).toHaveStyle({ color: '#ff0000' })
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('applies SVG default attributes to bare SVG', () => {
    const { container } = renderWithChildren(
      Icon,
      <svg>
        <path d="M5 12h14" />
      </svg>
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
  })

  it('preserves custom SVG attributes', () => {
    const { container } = renderWithChildren(
      Icon,
      <svg viewBox="0 0 20 20" fill="currentColor" stroke="none">
        <path d="M10 10z" />
      </svg>
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 20 20')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg).toHaveAttribute('stroke', 'none')
  })

  it('forwards DOM props to wrapper', () => {
    const { container } = renderWithProps(Icon, {
      'data-testid': 'icon',
      children: SimpleSVG
    })
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
  })

  it('is aria-hidden by default (decorative)', () => {
    const { container } = renderWithChildren(Icon, SimpleSVG)
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper).not.toHaveAttribute('role')
  })

  it('uses role="img" when aria-label is provided', () => {
    const { container } = renderWithProps(Icon, {
      'aria-label': 'Search',
      children: SimpleSVG
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).toHaveAttribute('aria-label', 'Search')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('uses role="img" when aria-labelledby is provided', () => {
    const { container } = renderWithProps(Icon, {
      'aria-labelledby': 'label-id',
      children: SimpleSVG
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).toHaveAttribute('aria-labelledby', 'label-id')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('respects custom role', () => {
    const { container } = renderWithProps(Icon, {
      role: 'button',
      children: SimpleSVG
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'button')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('passes through non-SVG children unchanged', () => {
    const { container } = renderWithChildren(Icon, <span className="label">Hello</span>)
    expect(container.querySelector('.label')).toBeInTheDocument()
    expect(container.querySelector('.label')?.textContent).toBe('Hello')
  })

  it('handles missing children gracefully', () => {
    const { container } = render(<Icon />)
    expect(container.querySelector('svg')).toBeFalsy()
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithChildren(Icon, SimpleSVG)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  it('sets role="img" when both aria-label and aria-labelledby are provided', () => {
    const { container } = renderWithProps(Icon, {
      'aria-label': 'Search',
      'aria-labelledby': 'label-id',
      children: SimpleSVG
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
    expect(wrapper).toHaveAttribute('aria-label', 'Search')
    expect(wrapper).toHaveAttribute('aria-labelledby', 'label-id')
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })
})
