/**
 * @vitest-environment happy-dom
 */

import { setImmediate as flushPromises } from 'node:timers/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Watermark } from '@expcat/tigercat-vue/Watermark'
import { expectNoA11yViolationsIsolated } from '../utils'
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
    const { container } = render(Watermark, {
      props: { content: 'Fallback', image: '/missing.png', width: 120, height: 64 }
    })
    frames.flush()
    images.get('/missing.png')!.onerror?.()
    await flushPromises()

    expect(ctx.fillText.mock.calls).toEqual([['Fallback', 60, 32]])
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.getPropertyValue('--tiger-watermark-image')).toContain(
      'data:image/png;base64,tile'
    )
  })

  it('redraws reactive content after push and element assignment', async () => {
    const { frames, ctx } = mockPainting()
    const content = ref(['Line 1'])
    render(
      defineComponent({
        setup: () => () => h(Watermark, { content: content.value, width: 120, height: 64 })
      })
    )
    frames.flush()
    await flushPromises()
    expect(ctx.fillText.mock.calls).toEqual([['Line 1', 60, 32]])
    ctx.fillText.mockClear()

    content.value.push('Line 2')
    await nextTick()
    frames.flush()
    await flushPromises()
    expect(ctx.fillText.mock.calls).toEqual([
      ['Line 1', 60, 20],
      ['Line 2', 60, 44]
    ])
    ctx.fillText.mockClear()

    content.value[0] = 'Updated Line 1'
    await nextTick()
    frames.flush()
    await flushPromises()
    expect(ctx.fillText.mock.calls).toEqual([
      ['Updated Line 1', 60, 20],
      ['Line 2', 60, 44]
    ])
  })

  it('ignores an old image failure after the current image succeeds', async () => {
    const { frames, ctx, images } = mockPainting()
    const { container, rerender } = render(Watermark, { props: { image: '/old.png' } })
    frames.flush()
    await rerender({ image: '/current.png' })
    frames.flush()
    expect(images.size).toBe(2)
    images.get('/current.png')!.onload?.()
    await flushPromises()

    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    const painted = overlay.style.getPropertyValue('--tiger-watermark-image')
    expect(painted).toContain('data:image/png;base64,tile')
    expect(ctx.drawImage).toHaveBeenCalledWith(images.get('/current.png'), 0, 0, 120, 64)
    expect(container.querySelector('p')).toBeNull()

    images.get('/old.png')!.onerror?.()
    await flushPromises()
    expect(overlay.style.getPropertyValue('--tiger-watermark-image')).toBe(painted)
    expect(container.querySelector('p')).toBeNull()
  })

  it('renders children and watermark overlay', () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret', className: 'from-prop' },
      attrs: { class: 'from-attr', 'data-testid': 'watermark' },
      slots: { default: 'Protected content' }
    })

    const wrapper = screen.getByTestId('watermark')
    const overlay = container.querySelector('[data-watermark="true"]')

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('from-prop')
    expect(wrapper).toHaveClass('from-attr')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveStyle({
      position: 'absolute',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    })
  })

  it('renders overlay even without content', () => {
    const { container } = render(Watermark, {
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('renders with array content', () => {
    const { container } = render(Watermark, {
      props: { content: ['Line 1', 'Line 2'] },
      slots: { default: 'Body' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('overlay has pointer-events none', () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.pointerEvents).toBe('none')
  })

  it('applies custom zIndex via overlay style', () => {
    const { container } = render(Watermark, {
      props: { content: 'Z', zIndex: 999 },
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.zIndex).toBe('999')
  })

  it('merges className and attrs class', () => {
    const { container } = render(Watermark, {
      props: { className: 'prop-cls' },
      attrs: { class: 'attr-cls' },
      slots: { default: 'Content' }
    })
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('prop-cls')
    expect(wrapper).toHaveClass('attr-cls')
  })

  it('renders without children', () => {
    const { container } = render(Watermark, {
      props: { content: 'Empty' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('keeps the same overlay node after painting', async () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Protected content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.style.backgroundImage = 'url(data:image/png;base64,painted)'
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-watermark="true"]')).toBe(overlay)
  })

  it('does not recreate an overlay after it is removed', async () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Protected content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.remove()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-watermark="true"]')).toBeNull()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Watermark)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
