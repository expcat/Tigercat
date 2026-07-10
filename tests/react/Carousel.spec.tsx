/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { createRef } from 'react'
import { Carousel, ConfigProvider, type CarouselRef } from '@expcat/tigercat-react'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    it('should render with navigation dots by default', () => {
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots).toHaveLength(2)
    })
    it('should render arrows when arrows is true', () => {
      render(
        <Carousel arrows>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
    })

    it('localizes carousel aria labels from ConfigProvider', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <Carousel arrows>
            <div>第一页</div>
            <div>第二页</div>
          </Carousel>
        </ConfigProvider>
      )

      expect(screen.getByRole('region', { name: '图片轮播' })).toBeInTheDocument()
      expect(screen.getByRole('tablist', { name: '轮播导航' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '上一张' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '跳转到第 1 张' })).toBeInTheDocument()
      expect(screen.getByLabelText('第 1 张，共 2 张')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should start at defaultCurrentIndex', () => {
      const { container } = render(
        <Carousel defaultCurrentIndex={1}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')
    })

    it('should request currentIndex changes without mutating controlled state', async () => {
      const onCurrentIndexChange = vi.fn()
      const onChange = vi.fn()

      const { container, rerender } = render(
        <Carousel
          arrows
          currentIndex={1}
          onCurrentIndexChange={onCurrentIndexChange}
          onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onCurrentIndexChange).toHaveBeenCalledWith(2)
      expect(onChange).toHaveBeenCalledWith(2, 1)

      let dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')

      rerender(
        <Carousel
          arrows
          currentIndex={2}
          onCurrentIndexChange={onCurrentIndexChange}
          onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[2]).toHaveAttribute('aria-current', 'true')
    })
  })

  describe('Navigation', () => {
    it('should navigate to next slide when next arrow is clicked', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel arrows onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(1, 0)

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')
    })
    it('should loop to first slide when clicking next at last slide with infinite=true', async () => {
      const onChange = vi.fn()

      render(
        <Carousel arrows defaultCurrentIndex={2} infinite onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(0, 2)
    })
    it('should navigate to the next slide on horizontal touch swipe', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const carousel = container.querySelector('[role="region"]') as HTMLElement
      await fireEvent.touchStart(carousel, { touches: [{ clientX: 180, clientY: 60 }] })
      await fireEvent.touchMove(carousel, { touches: [{ clientX: 120, clientY: 66 }] })
      await fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 120, clientY: 66 }] })

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Events', () => {
    it('should call onChange event after navigation', async () => {
      const onChange = vi.fn()

      render(
        <Carousel arrows onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Autoplay', () => {
    it('should auto-advance slides when autoplay is true', async () => {
      const onChange = vi.fn()

      render(
        <Carousel autoplay autoplaySpeed={1000} onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(1100)
      })

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })

    it('should pause autoplay on mouse enter when pauseOnHover is true', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel autoplay autoplaySpeed={1000} pauseOnHover onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const carousel = container.querySelector('[role="region"]')!
      await fireEvent.mouseEnter(carousel)

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should not have changed since it's paused
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Imperative API', () => {
    it('should expose next method via ref', async () => {
      const ref = createRef<CarouselRef>()
      const onChange = vi.fn()

      render(
        <Carousel ref={ref} onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      act(() => {
        ref.current?.next()
      })

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      vi.useRealTimers()

      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      await expectNoA11yViolationsIsolated(container)
    })

    it('should have proper ARIA attributes on container', () => {
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const carouselEl = container.querySelector('[role="region"]')
      expect(carouselEl).toHaveAttribute('aria-roledescription', 'carousel')
      expect(carouselEl).toHaveAttribute('aria-label')
    })
  })
})
