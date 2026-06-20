/**
 * @vitest-environment node
 *
 * SSR safety for ImagePreview's body portal (C-3): with no DOM available,
 * `renderBodyPortal` must short-circuit via `isBrowser()` and render nothing
 * instead of touching `document.body`.
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { ImagePreview } from '@expcat/tigercat-react'

describe('ImagePreview (SSR)', () => {
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  it('renders nothing and does not throw when open without a DOM', () => {
    expect(typeof document).toBe('undefined')
    expect(() => renderToStaticMarkup(<ImagePreview open images={images} />)).not.toThrow()
    expect(renderToStaticMarkup(<ImagePreview open images={images} />)).toBe('')
  })

  it('renders nothing when closed without a DOM', () => {
    expect(renderToStaticMarkup(<ImagePreview open={false} images={images} />)).toBe('')
  })

  it('renders nothing for an empty image list without a DOM', () => {
    expect(renderToStaticMarkup(<ImagePreview open images={[]} />)).toBe('')
  })
})
