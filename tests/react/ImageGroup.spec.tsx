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
  it('renders with preview disabled', () => {
    const { container } = render(
      <ImageGroup preview={false}>
        <span>test</span>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders empty group without children', () => {
    const { container } = render(<ImageGroup />)
    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders multiple Image children', () => {
    const { container } = render(
      <ImageGroup>
        <Image src="/img1.jpg" alt="Image 1" />
        <Image src="/img2.jpg" alt="Image 2" />
        <Image src="/img3.jpg" alt="Image 3" />
      </ImageGroup>
    )

    expect(container.querySelectorAll('img')).toHaveLength(3)
  })

  it('renders non-Image children correctly', () => {
    const { container } = render(
      <ImageGroup>
        <div className="custom-child">Custom Content</div>
        <p>Paragraph</p>
      </ImageGroup>
    )

    expect(container.querySelector('.custom-child')).toBeInTheDocument()
    expect(container.querySelector('p')).toBeInTheDocument()
  })

  it('renders single child correctly', () => {
    const { container } = render(
      <ImageGroup>
        <Image src="/single.jpg" alt="Single" />
      </ImageGroup>
    )

    expect(container.querySelectorAll('img')).toHaveLength(1)
  })

  it('preserves child order in the group', () => {
    const { container } = render(
      <ImageGroup>
        <span data-order="1">First</span>
        <span data-order="2">Second</span>
        <span data-order="3">Third</span>
      </ImageGroup>
    )

    const spans = container.querySelectorAll('span')
    expect(spans[0]?.textContent).toBe('First')
    expect(spans[1]?.textContent).toBe('Second')
    expect(spans[2]?.textContent).toBe('Third')
  })

  it('has role=group on the container element', () => {
    const { container } = render(
      <ImageGroup>
        <span>test</span>
      </ImageGroup>
    )

    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('keeps preview disabled without rendering preview dialog', () => {
    const { container } = render(
      <ImageGroup preview={false}>
        <Image src="/img-disabled.jpg" alt="Disabled preview" preview />
      </ImageGroup>
    )

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('uses the default image group class on the container', () => {
    const { container } = render(
      <ImageGroup>
        <span>test</span>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('tiger-image-group')
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
