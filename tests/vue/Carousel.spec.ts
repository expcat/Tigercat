/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h, ref, nextTick } from 'vue'
import { Carousel } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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
      const { container } = render(Carousel, {
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots).toHaveLength(2)
    })
    it('should render arrows when arrows is true', () => {
      render(Carousel, {
        props: { arrows: true },
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should start at defaultCurrentIndex', () => {
      const { container } = render(Carousel, {
        props: { defaultCurrentIndex: 1 },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')
    })

    it('should request currentIndex updates without mutating controlled state', async () => {
      const onUpdateCurrentIndex = vi.fn()
      const onChange = vi.fn()

      const { container, rerender } = render(Carousel, {
        props: {
          arrows: true,
          currentIndex: 1,
          'onUpdate:currentIndex': onUpdateCurrentIndex,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onUpdateCurrentIndex).toHaveBeenCalledWith(2)
      expect(onChange).toHaveBeenCalledWith(2, 1)

      let dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')

      await rerender({ currentIndex: 2 })

      dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[2]).toHaveAttribute('aria-current', 'true')
    })
  })

  describe('Navigation', () => {
    it('should navigate to next slide when next arrow is clicked', async () => {
      const onChange = vi.fn()

      const { container } = render(Carousel, {
        props: {
          arrows: true,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(1, 0)

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')
    })
    it('should loop to first slide when clicking next at last slide with infinite=true', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          defaultCurrentIndex: 2,
          infinite: true,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(0, 2)
    })
    it('should navigate to the next slide on horizontal touch swipe', async () => {
      const onChange = vi.fn()

      const { container } = render(Carousel, {
        props: { onChange },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      const carousel = container.querySelector('[role="region"]') as HTMLElement
      await fireEvent.touchStart(carousel, { touches: [{ clientX: 180, clientY: 60 }] })
      await fireEvent.touchMove(carousel, { touches: [{ clientX: 120, clientY: 66 }] })
      await fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 120, clientY: 66 }] })

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Events', () => {
    it('should emit change event after navigation', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          onChange
        },
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Autoplay', () => {
    it('should auto-advance slides when autoplay is true', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          autoplay: true,
          autoplaySpeed: 1000,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      // Advance timer
      vi.advanceTimersByTime(1100)

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })

    it('should pause autoplay on mouse enter when pauseOnHover is true', async () => {
      const onChange = vi.fn()

      const { container } = render(Carousel, {
        props: {
          autoplay: true,
          autoplaySpeed: 1000,
          pauseOnHover: true,
          onChange
        },
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      const carousel = container.querySelector('[role="region"]')!
      await fireEvent.mouseEnter(carousel)

      // Advance timer
      vi.advanceTimersByTime(2000)

      // Should not have changed since it's paused
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      vi.useRealTimers()

      const { container } = render(Carousel, {
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      await expectNoA11yViolationsIsolated(container)
    })

    it('should have proper ARIA attributes on container', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [h('div', { key: '1' }, 'Slide 1'), h('div', { key: '2' }, 'Slide 2')]
        }
      })

      const carouselEl = container.querySelector('[role="region"]')
      expect(carouselEl).toHaveAttribute('aria-roledescription', 'carousel')
      expect(carouselEl).toHaveAttribute('aria-label')
    })
  })

  describe('Imperative API', () => {
    it('should expose next method via ref', async () => {
      const onChange = vi.fn()
      const carouselRef = ref<{
        next: () => void
        prev: () => void
        goTo: (index: number) => void
      }>()

      render({
        setup() {
          return () =>
            h(
              Carousel,
              {
                ref: carouselRef,
                onChange
              },
              {
                default: () => [
                  h('div', { key: '1' }, 'Slide 1'),
                  h('div', { key: '2' }, 'Slide 2'),
                  h('div', { key: '3' }, 'Slide 3')
                ]
              }
            )
        }
      })

      carouselRef.value?.next()
      await nextTick()

      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })
  describe('Edge Cases', () => {})
})
