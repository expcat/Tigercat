/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
import { Image } from '@expcat/tigercat-vue/Image'
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { QRCode } from '@expcat/tigercat-vue/QRCode'
import { Code } from '@expcat/tigercat-vue/Code'
import { ImageCropper } from '@expcat/tigercat-vue/ImageCropper'
import { ImageCompare } from '@expcat/tigercat-vue/ImageCompare'
import { Watermark } from '@expcat/tigercat-vue/Watermark'
import { Marquee } from '@expcat/tigercat-vue/Marquee'
import { Gallery } from '../../packages/vue/src/components/Gallery'
import { basicLabel } from '@expcat/tigercat-core'

describe('W9 T02 Vue', () => {
  it('flips, downloads the current url, resets scale, and replaces one toolbar item', async () => {
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      expect(this.getAttribute('href')).toBe('/a.jpg')
      expect(this.download).toBe('a.jpg')
    })
    const { emitted } = render(ImagePreview, {
      props: { open: true, images: ['/a.jpg', '/b.jpg'], currentIndex: 0 },
      slots: {
        toolbarItem: (item: { action: string; label: string }) =>
          item.action === 'zoomOut' ? h('button', { type: 'button' }, `custom-${item.label}`) : []
      }
    })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    expect(img).toHaveAttribute('alt')
    expect(screen.getByRole('button', { name: 'custom-Zoom out' })).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: basicLabel('en-US', 'imagePreview', 'flipHorizontal') }))
    expect(img.style.transform).toContain('scaleX(-1)')
    await fireEvent.click(screen.getByRole('button', { name: basicLabel('en-US', 'imagePreview', 'download') }))
    expect(download).toHaveBeenCalled()
    await fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(emitted()['scale-change']?.at(-1)).toEqual([1])
    expect(img.style.transform).not.toContain('scaleX(-1)')
    download.mockRestore()
  })

  it('controls the group lightbox and uses the fallback src', async () => {
    const index = ref(0)
    const open = ref(false)
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ImageGroup,
            {
              open: open.value,
              currentIndex: index.value,
              'onUpdate:open': (value: boolean) => {
                open.value = value
              },
              'onUpdate:currentIndex': (value: number) => {
                index.value = value
              }
            },
            () => [
              h(Image, { src: '/missing.jpg', fallbackSrc: '/fallback.jpg', alt: 'One', preview: true }),
              h(Image, { src: '/two.jpg', alt: 'Two', preview: true })
            ]
          )
      }
    })
    render(Host)
    const first = document.querySelector('img') as HTMLImageElement
    await fireEvent.error(first)
    await fireEvent.click(screen.getAllByRole('button')[0])
    expect(open.value).toBe(true)
    const preview = document.querySelector('[role="dialog"] img') as HTMLImageElement
    expect(preview.getAttribute('src')).toBe('/fallback.jpg')
    preview.focus()
    await fireEvent.keyDown(preview.closest('[role="dialog"]') as HTMLElement, { key: 'ArrowRight' })
    expect(index.value).toBe(1)
  })

  it('opens collapsed avatar names in a popover', async () => {
    render({
      components: { AvatarGroup, Avatar },
      template: `
        <AvatarGroup :max="1">
          <Avatar text="Ann" />
          <Avatar text="Bo" />
          <Avatar alt="Cee" />
        </AvatarGroup>
      `
    })
    await fireEvent.click(screen.getByRole('button', { name: '2 more' }))
    expect(screen.getByText('Bo')).toBeInTheDocument()
    expect(screen.getByText('Cee')).toBeInTheDocument()
  })

  it('shows scanned status text', () => {
    render(QRCode, { props: { value: 'https://tigercat.dev', status: 'scanned' } })
    expect(screen.getByText('Scanned')).toBeInTheDocument()
  })

  it('numbers lines, labels the language, toggles wrap, and copies the raw string', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: write }
    })
    render(Code, {
      props: {
        code: 'alpha\nbeta',
        language: 'ts',
        lineNumbers: true,
        showLanguage: true,
        wrapToggle: true
      }
    })
    expect(screen.getByText('Language: ts')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(document.querySelector('code')?.textContent).toBe('alpha\nbeta')
    await fireEvent.click(screen.getByRole('button', { name: 'Wrap lines' }))
    expect(document.querySelector('pre')?.className).toContain('whitespace-pre-wrap')
    await fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(write).toHaveBeenCalledWith('alpha\nbeta')
  })

  it('applies a crop preset and rotates the stage', async () => {
    const Host = defineComponent({
      setup() {
        return () => h(ImageCropper, { src: '/crop.png', aspectPreset: '1:1' })
      }
    })
    render(Host)
    const img = document.querySelector('[data-image-cropper] img') as HTMLImageElement | null
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 200 })
      Object.defineProperty(img, 'naturalHeight', { value: 100 })
      await fireEvent.load(img)
    }
    const root = document.querySelector('[data-image-cropper]') as HTMLElement
    await fireEvent.click(screen.getByRole('button', { name: 'Rotate' }))
    expect(root.getAttribute('data-crop-rotation')).toBe('90')
    await fireEvent.click(screen.getByRole('button', { name: '4:3' }))
    expect(root.getAttribute('data-crop-aspect')).toBe('4:3')
  })

  it('includes compare titles in the slider value and does not lock the page', () => {
    render(ImageCompare, {
      props: { beforeSrc: '/a.jpg', afterSrc: '/b.jpg', beforeTitle: 'Raw', afterTitle: 'Edited' },
      slots: { beforeTitle: () => 'Raw slot' }
    })
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-valuetext')).toContain('Raw')
    expect(slider.getAttribute('aria-valuetext')).toContain('Edited')
    expect(screen.getByText('Raw slot')).toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('sets watermark style vars and does not create a MutationObserver', () => {
    const Observer = vi.fn()
    vi.stubGlobal('MutationObserver', Observer)
    const { container } = render(Watermark, {
      props: { content: 'Secret', rowGap: 8, density: 2, printVisible: false },
      slots: { default: 'Body' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.getPropertyValue('--tiger-watermark-row-gap')).toBe('8px')
    expect(overlay.style.getPropertyValue('--tiger-watermark-density')).toBe('2')
    expect(overlay.getAttribute('data-watermark-print')).toBe('off')
    expect(Observer).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('fades the marquee edges without making an unnamed landmark', () => {
    const { container } = render(Marquee, {
      props: { edgeFade: true },
      slots: { default: () => 'News' }
    })
    const root = container.querySelector('[data-marquee]') as HTMLElement
    expect(root.className).toContain('tiger-marquee-fade')
    expect(root).not.toHaveAttribute('role')
  })

  it('lists thumbnails, a count, and opens ImagePreview', async () => {
    render(Gallery, {
      props: {
        items: [
          { src: '/g1.jpg', alt: 'One' },
          { src: '/g2.jpg', alt: 'Two' }
        ]
      }
    })
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: 'One' }).length).toBeGreaterThan(0)
    await fireEvent.click(screen.getByRole('button', { name: 'Open preview' }))
    expect(document.querySelector('[data-tiger-image-preview] img')).toHaveAttribute('src', '/g1.jpg')
  })
})
