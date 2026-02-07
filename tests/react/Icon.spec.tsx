/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Icon } from '@expcat/tigercat-react'
import { renderWithProps, renderWithChildren } from '../utils/render-helpers-react'
import { expectNoA11yViolations } from '../utils/react'

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
    expect(wrapper).not.toHaveAttribute('aria-hidden')
  })

  it('uses role="img" when aria-labelledby is provided', () => {
    const { container } = renderWithProps(Icon, {
      'aria-labelledby': 'label-id',
      children: SimpleSVG
    })
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('role', 'img')
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
      await expectNoA11yViolations(container)
    })
  })
})
