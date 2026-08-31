/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'
import { getImageViewerLabels } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const labels = getImageViewerLabels()
const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg'
]

describe('ImageViewer', () => {
  it('is the ImagePreview dialog with zoom aliases', async () => {
    const { emitted } = render(ImageViewer, {
      props: { open: true, images, minZoom: 1, maxZoom: 1, showNav: false }
    })
    expect(document.querySelector('[data-tiger-image-preview]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: labels.zoomInAriaLabel })).toBeDisabled()
    await fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(emitted()['update:open']?.[0]).toEqual([false])
    expect(emitted().close?.[0]).toEqual([])
  })

  it('has no axe violations when open', async () => {
    render(ImageViewer, { props: { open: true, images } })
    await expectNoA11yViolationsIsolated(document.body)
  })
})
