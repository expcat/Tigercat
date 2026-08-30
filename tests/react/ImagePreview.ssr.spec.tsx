/**
 * @vitest-environment node
 *
 * SSR safety for ImagePreview's body portal (C-3): with no DOM available,
 * `renderBodyPortal` must not touch `document.body` outside the browser.
 * An open overlay still serializes a stable layer placeholder for hydration.
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'

describe('ImagePreview (SSR)', () => {
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  it('renders a stable overlay placeholder when open without a DOM', () => {
    expect(typeof document).toBe('undefined')
    expect(() => renderToStaticMarkup(<ImagePreview open images={images} />)).not.toThrow()
    const html = renderToStaticMarkup(<ImagePreview open images={images} />)
    expect(html).toContain('data-tiger-overlay-layer')
    expect(html).toContain('data-tiger-overlay-host')
  })

  it('renders nothing when closed without a DOM', () => {
    expect(renderToStaticMarkup(<ImagePreview open={false} images={images} />)).toBe('')
  })

  it('renders nothing for an empty image list without a DOM', () => {
    expect(renderToStaticMarkup(<ImagePreview open images={[]} />)).toBe('')
  })
})
