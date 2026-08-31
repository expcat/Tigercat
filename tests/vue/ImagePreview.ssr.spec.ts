/**
 * @vitest-environment node
 *
 * Open ImagePreview must serialize the overlay layer placeholder without
 * touching `document` outside the browser.
 */

import { describe, it, expect } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'

const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

describe('ImagePreview (SSR)', () => {
  it('renders a stable overlay placeholder when open without a DOM', async () => {
    expect(typeof document).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () => h(ImagePreview, { open: true, images })
      })
    )
    expect(html).toContain('data-tiger-overlay-layer')
    expect(html).toContain('data-tiger-overlay-host')
  })

  it('renders nothing when closed without a DOM', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ImagePreview, { open: false, images })
      })
    )
    expect(html === '' || html === '<!---->').toBe(true)
  })
})
