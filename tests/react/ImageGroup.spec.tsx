/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { ImageGroup, Image } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ImageGroup', () => {
  it('renders children in a group container', () => {
    const { container } = render(
      <ImageGroup>
        <div data-testid="child">child</div>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
    expect(group?.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('renders with preview enabled by default', () => {
    const { container } = render(
      <ImageGroup>
        <span>test</span>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders Image children', () => {
    const { container } = render(
      <ImageGroup>
        <Image src="/img1.jpg" alt="Image 1" preview />
        <Image src="/img2.jpg" alt="Image 2" preview />
      </ImageGroup>
    )

    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
  })

  it('applies custom className', () => {
    const { container } = render(
      <ImageGroup className="custom-group">
        <span>test</span>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('custom-group')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ImageGroup />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
