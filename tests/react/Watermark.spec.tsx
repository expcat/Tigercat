/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { Watermark } from '@expcat/tigercat-react/Watermark'
import { expectNoA11yViolationsIsolated } from '../utils/react'
import { installFrameScheduler } from '../utils/frame-scheduler'

describe('Watermark', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function mockPainting() {
    const frames = installFrameScheduler()
    const ctx = {
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn()
    }
    vi.stubGlobal('OffscreenCanvas', undefined)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,tile')
    const images = new Map<string, ImageMock>()
    class ImageMock {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(value: string) {
        images.set(value, this)
      }
    }
    vi.stubGlobal('Image', ImageMock)
    return { frames, ctx, images }
  }

  it('paints fallback content when the watermark image fails', async () => {
    const { frames, ctx, images } = mockPainting()
    const { container } = render(
      <Watermark content="Fallback" image="/missing.png" width={120} height={64} />
    )
    await act(async () => frames.flush())
    await act(async () => images.get('/missing.png')!.onerror?.())

    expect(ctx.fillText.mock.calls).toEqual([['Fallback', 60, 32]])
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.getPropertyValue('--tiger-watermark-image')).toContain(
      'data:image/png;base64,tile'
    )
  })

  it('redraws string content as separate array lines', async () => {
    const { frames, ctx } = mockPainting()
    const { rerender } = render(<Watermark content={'A\nB'} width={120} height={64} />)
    await act(async () => frames.flush())
    expect(ctx.fillText.mock.calls).toEqual([['A\nB', 60, 32]])
    ctx.fillText.mockClear()

    rerender(<Watermark content={['A', 'B']} width={120} height={64} />)
    await act(async () => frames.flush())
    expect(ctx.fillText.mock.calls).toEqual([
      ['A', 60, 20],
      ['B', 60, 44]
    ])
  })

  it('ignores an old image failure after the current image succeeds', async () => {
    const { frames, ctx, images } = mockPainting()
    const { container, rerender } = render(<Watermark image="/old.png" />)
    await act(async () => frames.flush())
    rerender(<Watermark image="/current.png" />)
    await act(async () => frames.flush())
    expect(images.size).toBe(2)
    await act(async () => images.get('/current.png')!.onload?.())

    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    const painted = overlay.style.getPropertyValue('--tiger-watermark-image')
    expect(painted).toContain('data:image/png;base64,tile')
    expect(ctx.drawImage).toHaveBeenCalledWith(images.get('/current.png'), 0, 0, 120, 64)
    expect(container.querySelector('p')).toBeNull()

    await act(async () => images.get('/old.png')!.onerror?.())
    expect(overlay.style.getPropertyValue('--tiger-watermark-image')).toBe(painted)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders children and watermark overlay', () => {
    render(
      <Watermark content="Secret" className="custom-watermark" data-testid="watermark">
        <span>Protected content</span>
      </Watermark>
    )

    const wrapper = screen.getByTestId('watermark')
    const overlay = wrapper.querySelector('[data-watermark="true"]')

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('custom-watermark')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveStyle({
      position: 'absolute',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    })
  })

  it('renders overlay even without content', () => {
    const { container } = render(
      <Watermark>
        <span>Content</span>
      </Watermark>
    )
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('renders with array content', () => {
    const { container } = render(
      <Watermark content={['Line 1', 'Line 2']}>
        <span>Body</span>
      </Watermark>
    )
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('overlay has pointer-events none', () => {
    render(
      <Watermark content="Secret" data-testid="wm">
        <span>Content</span>
      </Watermark>
    )
    const overlay = screen.getByTestId('wm').querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.pointerEvents).toBe('none')
  })

  it('applies custom zIndex via overlay style', () => {
    render(
      <Watermark content="Z" zIndex={999} data-testid="wm">
        <span>Content</span>
      </Watermark>
    )
    const overlay = screen.getByTestId('wm').querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.zIndex).toBe('999')
  })

  it('merges className prop', () => {
    const { container } = render(
      <Watermark className="prop-cls">
        <span>Content</span>
      </Watermark>
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('prop-cls')
  })

  it('renders without children', () => {
    const { container } = render(<Watermark content="Empty" />)
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('keeps the same overlay node after painting', async () => {
    const { container } = render(
      <Watermark content="Secret">
        <span>Protected content</span>
      </Watermark>
    )
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.style.backgroundImage = 'url(data:image/png;base64,painted)'
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-watermark="true"]')).toBe(overlay)
  })

  it('does not replace the overlay when covering styles are stripped', async () => {
    const { container } = render(
      <Watermark content="Secret">
        <span>Protected content</span>
      </Watermark>
    )
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.setAttribute('style', '')
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-watermark="true"]')).toBe(overlay)
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Watermark />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
