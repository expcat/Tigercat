/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'
import { Image } from '@expcat/tigercat-react/Image'
import { ImageGroup } from '@expcat/tigercat-react/ImageGroup'
import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { QRCode } from '@expcat/tigercat-react/QRCode'
import { Code } from '@expcat/tigercat-react/Code'
import { ImageCropper } from '@expcat/tigercat-react/ImageCropper'
import { ImageCompare } from '@expcat/tigercat-react/ImageCompare'
import { Watermark } from '@expcat/tigercat-react/Watermark'
import { Marquee } from '@expcat/tigercat-react/Marquee'
import { Gallery } from '../../packages/react/src/components/Gallery'
import { basicLabel } from '@expcat/tigercat-core'

describe('W9 T02 React', () => {
  it('replaces a toolbar item and flips the current image', () => {
    render(
      <ImagePreview
        open
        images={['/a.jpg']}
        renderToolbarItem={(item) =>
          item.action === 'zoomOut' ? <button type="button">zoom-slot</button> : null
        }
      />
    )
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    expect(img).toHaveAttribute('alt')
    expect(screen.getByRole('button', { name: 'zoom-slot' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: basicLabel('en-US', 'imagePreview', 'flipHorizontal') }))
    expect(img.style.transform).toContain('scaleX(-1)')
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      expect(this.getAttribute('href')).toBe('/a.jpg')
    })
    fireEvent.click(screen.getByRole('button', { name: basicLabel('en-US', 'imagePreview', 'download') }))
    expect(download).toHaveBeenCalled()
    download.mockRestore()
  })

  it('moves a controlled group with arrow keys after a fallback', () => {
    function Host() {
      const [open, setOpen] = useState(false)
      const [index, setIndex] = useState(0)
      return (
        <ImageGroup open={open} currentIndex={index} onOpenChange={setOpen} onCurrentIndexChange={setIndex}>
          <Image src="/missing.jpg" fallbackSrc="/fallback.jpg" alt="One" preview />
          <Image src="/two.jpg" alt="Two" preview />
        </ImageGroup>
      )
    }
    render(<Host />)
    fireEvent.error(document.querySelector('img') as HTMLImageElement)
    fireEvent.click(screen.getAllByRole('button')[0])
    const preview = document.querySelector('[role="dialog"] img') as HTMLImageElement
    expect(preview.getAttribute('src')).toBe('/fallback.jpg')
    fireEvent.keyDown(preview.closest('[role="dialog"]') as HTMLElement, { key: 'ArrowRight' })
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute('src', '/two.jpg')
  })

  it('lists collapsed avatar names', () => {
    render(
      <AvatarGroup max={1}>
        <Avatar text="Ann" />
        <Avatar text="Bo" />
      </AvatarGroup>
    )
    fireEvent.click(screen.getByRole('button', { name: '1 more' }))
    expect(screen.getByText('Bo')).toBeInTheDocument()
  })

  it('shows scanned status and a center icon path without dropping modules', () => {
    const { container } = render(
      <QRCode value="https://tigercat.dev" status="scanned" icon="M2 2h4v4H2z" />
    )
    expect(screen.getByText('Scanned')).toBeInTheDocument()
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(2)
  })

  it('keeps copy on the raw code when line numbers are on', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: write }
    })
    render(<Code code={'one\ntwo'} language="js" lineNumbers showLanguage wrapToggle />)
    expect(screen.getByText('Language: js')).toBeInTheDocument()
    expect(document.querySelector('code')?.textContent).toBe('one\ntwo')
    fireEvent.click(screen.getByRole('button', { name: 'Wrap lines' }))
    expect(document.querySelector('pre')?.className).toContain('whitespace-pre-wrap')
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(write).toHaveBeenCalledWith('one\ntwo')
  })

  it('rotates the cropper', () => {
    render(<ImageCropper src="/crop.png" aspectPreset="16:9" />)
    const root = document.querySelector('[data-image-cropper]') as HTMLElement
    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }))
    expect(root.getAttribute('data-crop-rotation')).toBe('90')
    expect(root.getAttribute('data-crop-aspect')).toBe('16:9')
  })

  it('puts titles on the compare slider and leaves the page scrollable', () => {
    render(
      <ImageCompare beforeSrc="/a.jpg" afterSrc="/b.jpg" beforeTitle="Raw" afterTitle="Edited" />
    )
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuetext')).toContain('Raw')
    expect(slider.getAttribute('aria-valuetext')).toContain('Edited')
    fireEvent.wheel(slider)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('updates watermark vars without a MutationObserver', () => {
    const Observer = vi.fn()
    vi.stubGlobal('MutationObserver', Observer)
    const { container } = render(
      <Watermark content="Secret" rowGap={6} density={2} printVisible={false}>
        Body
      </Watermark>
    )
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.getPropertyValue('--tiger-watermark-density')).toBe('2')
    expect(overlay.getAttribute('data-watermark-print')).toBe('off')
    expect(Observer).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('does not landmark an unnamed faded marquee', () => {
    const { container } = render(<Marquee edgeFade>News</Marquee>)
    const root = container.querySelector('[data-marquee]') as HTMLElement
    expect(root.className).toContain('tiger-marquee-fade')
    expect(root).not.toHaveAttribute('role')
  })

  it('opens the shared preview from a thumbnail gallery', () => {
    render(
      <Gallery
        items={[
          { src: '/g1.jpg', alt: 'One' },
          { src: '/g2.jpg', alt: 'Two' }
        ]}
      />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open preview' }))
    expect(document.querySelector('[data-tiger-image-preview] img')).toHaveAttribute('src', '/g1.jpg')
  })
})
