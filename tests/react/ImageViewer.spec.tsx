/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'
import { getImageViewerLabels } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const labels = getImageViewerLabels()
const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg'
]

describe('ImageViewer', () => {
  it('is the ImagePreview dialog with zoom aliases', () => {
    const onClose = vi.fn()
    render(
      <ImageViewer open images={images} minZoom={1} maxZoom={1} showNav={false} onClose={onClose} />
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('data-tiger-image-preview')
    expect(screen.getByRole('button', { name: labels.zoomInAriaLabel })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has no axe violations when open', async () => {
    render(<ImageViewer open images={images} />)
    await expectNoA11yViolationsIsolated(document.body)
  })
})
