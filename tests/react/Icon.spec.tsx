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
    expect(svg).toHaveClass('inline-block')
    expect(svg).toHaveClass('w-5', 'h-5')
  })

  it('applies custom size to SVG', () => {
    const { container } = renderWithProps(Icon, {
      size: 'xl',
      children: SimpleSVG
    })
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('w-8', 'h-8')
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

  it('has no obvious accessibility violations', async () => {
    const { container } = renderWithChildren(Icon, SimpleSVG)
    await expectNoA11yViolations(container)
  })
})
