/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { createRef, useState } from 'react'
import { Carousel, type CarouselRef } from '@expcat/tigercat-react/Carousel'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { zhTW } from '../../packages/core/src/utils/i18n/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

function slides() {
  return [
    <div key="1">
      <button type="button">Slide 1 action</button>
    </div>,
    <div key="2">
      <a href="#two">Slide 2 link</a>
    </div>,
    <div key="3">Slide 3</div>
  ]
}

describe('Carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        return globalThis.setTimeout(() => callback(globalThis.performance.now()), 16)
      })
    )
    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn((handle: number) => {
        globalThis.clearTimeout(handle)
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders real tabs and does not mint a landmark without a name', () => {
      const { container } = render(<Carousel>{slides()}</Carousel>)
      const root = container.querySelector('[data-tiger-carousel]') as HTMLElement
      expect(root).toHaveAttribute('role', 'group')
      expect(root).not.toHaveAttribute('aria-label')
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 1')
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('tabindex', '-1')
    })

    it('renders arrows when arrows is true', () => {
      render(<Carousel arrows>{slides()}</Carousel>)
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
    })

    it('localizes chrome from the official zhCN object without naming the landmark', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <Carousel arrows>{slides()}</Carousel>
        </ConfigProvider>
      )
      expect(screen.queryByRole('region')).toBeNull()
      expect(screen.getByRole('tablist', { name: '轮播导航' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '上一张' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '跳转到第 1 张' })).toBeInTheDocument()
    })

    it('uses official zhTW strings instead of simplified Chinese', () => {
      render(
        <ConfigProvider locale={zhTW}>
          <Carousel arrows>{slides()}</Carousel>
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: '上一張' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '跳到第 1 張' })).toBeInTheDocument()
    })

    it('names a region only when the caller provides one', () => {
      render(
        <Carousel aria-label="Highlights" arrows>
          {slides()}
        </Carousel>
      )
      expect(screen.getByRole('region', { name: 'Highlights' })).toBeInTheDocument()
    })

    it('forwards native attributes onto the root', () => {
      const { container } = render(
        <Carousel id="hero" data-testid="carousel">
          {slides()}
        </Carousel>
      )
      const root = container.querySelector('[data-tiger-carousel]') as HTMLElement
      expect(root).toHaveAttribute('id', 'hero')
      expect(root).toHaveAttribute('data-testid', 'carousel')
    })

    it('ignores text children so slide count matches Vue', () => {
      const { container } = render(
        <Carousel>
          <div>One</div> <div>Two</div>
        </Carousel>
      )
      expect(
        container.querySelectorAll('[data-tiger-carousel-slide]:not([data-tiger-carousel-clone])')
      ).toHaveLength(2)
    })
  })

  describe('Navigation', () => {
    it('moves to the next slide from the arrow and keeps hidden slides inert', async () => {
      const onChange = vi.fn()
      const onBeforeChange = vi.fn()
      const { container } = render(
        <Carousel arrows onChange={onChange} onBeforeChange={onBeforeChange}>
          {slides()}
        </Carousel>
      )

      await fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(onBeforeChange).toHaveBeenCalledWith(0, 1)
      expect(onChange).toHaveBeenCalledWith(1, 0)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 2')
      expect(container.querySelector('[data-tiger-carousel-slide="inactive"]')).toHaveAttribute(
        'inert'
      )
      expect(screen.queryByRole('button', { name: 'Slide 1 action' })).toBeNull()
      expect(screen.getByRole('link', { name: 'Slide 2 link' })).toBeInTheDocument()
    })

    it('animates onto a clone when wrapping instead of rewinding the track', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel arrows defaultCurrentIndex={2} infinite onChange={onChange}>
          {slides()}
        </Carousel>
      )

      await fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(onChange).toHaveBeenCalledWith(0, 2)
      const track = container.querySelector('[data-tiger-carousel-track]') as HTMLElement
      expect(track.style.transform).toBe('translateX(-400%)')
      expect(container.querySelector('[data-tiger-carousel-slide="active"]')).toHaveAttribute(
        'aria-label',
        'Slide 1 of 3'
      )

      fireEvent.transitionEnd(track)
      act(() => {
        vi.advanceTimersByTime(32)
      })
      expect(track.style.transform).toBe('translateX(-100%)')
    })

    it('does not wrap the track when infinite is false', async () => {
      render(
        <Carousel arrows infinite={false} defaultCurrentIndex={2}>
          {slides()}
        </Carousel>
      )
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
    })

    it('changes slides with pointer swipe and ignores cancel plus vertical drags', async () => {
      const onChange = vi.fn()
      const { container } = render(<Carousel onChange={onChange}>{slides()}</Carousel>)
      const viewport = container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement

      fireEvent.pointerDown(viewport, { pointerId: 1, button: 0, clientX: 180, clientY: 60 })
      fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 120, clientY: 66 })
      fireEvent.pointerUp(viewport, { pointerId: 1, clientX: 120, clientY: 66 })
      expect(onChange).toHaveBeenCalledWith(1, 0)

      onChange.mockClear()
      fireEvent.pointerDown(viewport, { pointerId: 2, button: 0, clientX: 180, clientY: 60 })
      fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 120, clientY: 66 })
      fireEvent.pointerCancel(viewport, { pointerId: 2, clientX: 120, clientY: 66 })
      expect(onChange).not.toHaveBeenCalled()

      fireEvent.pointerDown(viewport, { pointerId: 3, button: 0, clientX: 100, clientY: 100 })
      fireEvent.pointerMove(viewport, { pointerId: 3, clientX: 104, clientY: 180 })
      fireEvent.pointerUp(viewport, { pointerId: 3, clientX: 104, clientY: 180 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('moves with keyboard and reverses arrows in rtl', () => {
      const ltrChange = vi.fn()
      const ltr = render(
        <ConfigProvider direction="ltr">
          <Carousel onChange={ltrChange}>{slides()}</Carousel>
        </ConfigProvider>
      )
      fireEvent.keyDown(
        ltr.container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement,
        {
          key: 'ArrowRight'
        }
      )
      expect(ltrChange).toHaveBeenCalledWith(1, 0)

      const rtlChange = vi.fn()
      const rtl = render(
        <ConfigProvider direction="rtl">
          <Carousel onChange={rtlChange}>{slides()}</Carousel>
        </ConfigProvider>
      )
      fireEvent.keyDown(
        rtl.container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement,
        {
          key: 'ArrowLeft'
        }
      )
      expect(rtlChange).toHaveBeenCalledWith(1, 0)
    })

    it('does not emit before-change when the index does not change', async () => {
      const onBeforeChange = vi.fn()
      render(<Carousel onBeforeChange={onBeforeChange}>{slides()}</Carousel>)
      await fireEvent.click(screen.getByRole('tab', { selected: true }))
      expect(onBeforeChange).not.toHaveBeenCalled()
    })
  })

  describe('Autoplay', () => {
    it('auto-advances and exposes a pause control', async () => {
      const onChange = vi.fn()
      render(
        <Carousel autoplay autoplaySpeed={1000} onChange={onChange}>
          {slides()}
        </Carousel>
      )
      expect(screen.getByRole('button', { name: 'Pause autoplay' })).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(1100)
      })
      expect(onChange).toHaveBeenCalledWith(1, 0)
    })

    it('keeps autoplay paused when hover and focus overlap', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <Carousel autoplay autoplaySpeed={1000} pauseOnHover pauseOnFocus onChange={onChange}>
          {slides()}
        </Carousel>
      )
      const root = container.querySelector('[data-tiger-carousel]') as HTMLElement
      await fireEvent.mouseEnter(root)
      const tab = screen.getByRole('tab', { selected: true })
      await fireEvent.focus(tab)
      await fireEvent.mouseLeave(root)
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not start autoplay when reduced motion is requested', () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }))
      )
      const onChange = vi.fn()
      render(
        <Carousel autoplay autoplaySpeed={1000} onChange={onChange}>
          {slides()}
        </Carousel>
      )
      expect(screen.queryByRole('button', { name: 'Pause autoplay' })).toBeNull()
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Fade', () => {
    it('sizes the track from the current slide rather than the first', async () => {
      const { container } = render(
        <Carousel effect="fade" arrows defaultCurrentIndex={1}>
          <div style={{ height: 40 }}>Short</div>
          <div style={{ height: 120 }}>Tall</div>
          <div style={{ height: 80 }}>Mid</div>
        </Carousel>
      )
      const active = container.querySelector('[data-tiger-carousel-slide="active"]') as HTMLElement
      const inactive = container.querySelectorAll('[data-tiger-carousel-slide="inactive"]')
      expect(active).toHaveTextContent('Tall')
      expect(active).not.toHaveAttribute('inert')
      expect(inactive[0]).toHaveAttribute('inert')
      expect(container.querySelector('[data-tiger-carousel-clone]')).toBeNull()
    })
  })

  describe('Imperative API', () => {
    it('exposes next via ref', () => {
      const carouselRef = createRef<CarouselRef>()
      const onChange = vi.fn()
      render(
        <Carousel ref={carouselRef} onChange={onChange}>
          {slides()}
        </Carousel>
      )
      act(() => {
        carouselRef.current?.next()
      })
      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Controlled', () => {
    it('requests currentIndex changes without mutating controlled state', async () => {
      const onCurrentIndexChange = vi.fn()
      const onChange = vi.fn()
      const { rerender } = render(
        <Carousel
          arrows
          currentIndex={1}
          onCurrentIndexChange={onCurrentIndexChange}
          onChange={onChange}>
          {slides()}
        </Carousel>
      )
      await fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(onCurrentIndexChange).toHaveBeenCalledWith(2)
      expect(onChange).toHaveBeenCalledWith(2, 1)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 2')

      rerender(
        <Carousel
          arrows
          currentIndex={2}
          onCurrentIndexChange={onCurrentIndexChange}
          onChange={onChange}>
          {slides()}
        </Carousel>
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 3')
    })

    it('keeps the last value after dropping the controlled prop', () => {
      function Harness() {
        const [index, setIndex] = useState<number | undefined>(1)
        return (
          <div>
            <button type="button" onClick={() => setIndex(undefined)}>
              Release
            </button>
            <Carousel currentIndex={index} arrows>
              {slides()}
            </Carousel>
          </div>
        )
      }
      render(<Harness />)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 2')
      fireEvent.click(screen.getByRole('button', { name: 'Release' }))
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 2')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations with interactive slide content', async () => {
      vi.useRealTimers()
      const { container } = render(<Carousel arrows>{slides()}</Carousel>)
      await expectNoA11yViolations(container)
    })
  })
})
