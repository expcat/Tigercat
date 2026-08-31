/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { useState } from 'react'
import { Image } from '@expcat/tigercat-react/Image'
import { ImageGroup } from '@expcat/tigercat-react/ImageGroup'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ImageGroup', () => {
  it('renders children in a named group container', () => {
    const { container } = render(
      <ImageGroup>
        <div data-testid="child">child</div>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
    expect(group).toHaveAttribute('aria-label')
    expect(group?.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('keeps the base class when a custom class is passed', () => {
    const { container } = render(
      <ImageGroup className="custom-group" id="gallery" data-demo="yes">
        <span>test</span>
      </ImageGroup>
    )

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('tiger-image-group')
    expect(group?.className).toContain('custom-group')
    expect(group).toHaveAttribute('id', 'gallery')
    expect(group).toHaveAttribute('data-demo', 'yes')
  })

  it('renders Image children', () => {
    const { container } = render(
      <ImageGroup>
        <Image src="/img1.jpg" alt="Image 1" />
        <Image src="/img2.jpg" alt="Image 2" />
      </ImageGroup>
    )

    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('calls onPreviewOpenChange when group preview opens', () => {
    const onPreviewOpenChange = vi.fn()
    render(
      <ImageGroup onPreviewOpenChange={onPreviewOpenChange}>
        <Image src="/img1.jpg" alt="Image 1" />
      </ImageGroup>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onPreviewOpenChange).toHaveBeenCalledWith(true)
  })

  it('does not turn child images into buttons when group preview is off', () => {
    render(
      <ImageGroup preview={false}>
        <Image src="/img-disabled.jpg" alt="Disabled preview" preview />
      </ImageGroup>
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByAltText('Disabled preview'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps both copies when two images share a src and one unmounts', async () => {
    function Harness() {
      const [showFirst, setShowFirst] = useState(true)
      return (
        <>
          <button type="button" onClick={() => setShowFirst(false)}>
            remove-first
          </button>
          <ImageGroup>
            {showFirst ? <Image src="/same.jpg" alt="First" /> : null}
            <Image src="/same.jpg" alt="Second" />
          </ImageGroup>
        </>
      )
    }

    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'remove-first' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview Second' }))

    await waitFor(() => {
      const dialogImgs = document.querySelectorAll('[role="dialog"] img')
      expect(dialogImgs).toHaveLength(1)
      expect(dialogImgs[0]).toHaveAttribute('src', '/same.jpg')
    })
  })

  it('updates an open preview list when another image mounts', async () => {
    function Harness() {
      const [showThird, setShowThird] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setShowThird(true)}>
            add-third
          </button>
          <ImageGroup>
            <Image src="/img1.jpg" alt="One" />
            <Image src="/img2.jpg" alt="Two" />
            {showThird ? <Image src="/img3.jpg" alt="Three" /> : null}
          </ImageGroup>
        </>
      )
    }

    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Preview One' }))
    fireEvent.click(screen.getByRole('button', { name: 'add-third' }))

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
    })
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

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ImageGroup>
          <Image src="/img1.jpg" alt="Image 1" />
        </ImageGroup>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
