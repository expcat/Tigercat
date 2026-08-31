/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h, ref, nextTick, Text } from 'vue'
import { Carousel } from '@expcat/tigercat-vue/Carousel'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { zhTW } from '../../packages/core/src/utils/i18n/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

function slideNodes() {
  return [
    h('div', { key: '1' }, [h('button', { type: 'button' }, 'Slide 1 action')]),
    h('div', { key: '2' }, [h('a', { href: '#two' }, 'Slide 2 link')]),
    h('div', { key: '3' }, 'Slide 3')
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
      const { container } = render(Carousel, {
        slots: { default: () => slideNodes() }
      })
      const root = container.querySelector('[data-tiger-carousel]') as HTMLElement
      expect(root).toHaveAttribute('role', 'group')
      expect(root).not.toHaveAttribute('aria-label')
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 1')
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('tabindex', '-1')
    })

    it('renders arrows when arrows is true', () => {
      render(Carousel, {
        props: { arrows: true },
        slots: { default: () => slideNodes() }
      })
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
    })

    it('localizes chrome from the official zhCN object without naming the landmark', () => {
      render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () =>
              h(Carousel, { arrows: true }, () => slideNodes())
            )
        }
      })
      expect(screen.queryByRole('region')).toBeNull()
      expect(screen.getByRole('tablist', { name: '轮播导航' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '上一张' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '跳转到第 1 张' })).toBeInTheDocument()
    })

    it('uses official zhTW strings instead of simplified Chinese', () => {
      render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhTW }, () =>
              h(Carousel, { arrows: true }, () => slideNodes())
            )
        }
      })
      expect(screen.getByRole('button', { name: '上一張' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: '跳到第 1 張' })).toBeInTheDocument()
    })

    it('names a region only when the caller provides one', () => {
      render(Carousel, {
        attrs: { 'aria-label': 'Highlights' },
        props: { arrows: true },
        slots: { default: () => slideNodes() }
      })
      expect(screen.getByRole('region', { name: 'Highlights' })).toBeInTheDocument()
    })

    it('drops text nodes so slide count matches React', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'One'),
            h(Text, '   '),
            h('div', { key: '2' }, 'Two')
          ]
        }
      })
      expect(
        container.querySelectorAll('[data-tiger-carousel-slide]:not([data-tiger-carousel-clone])')
      ).toHaveLength(2)
    })
  })

  describe('Navigation', () => {
    it('moves to the next slide from the arrow and keeps hidden slides inert', async () => {
      const onChange = vi.fn()
      const onBeforeChange = vi.fn()
      const { container } = render(Carousel, {
        props: { arrows: true, onChange, onBeforeChange },
        slots: { default: () => slideNodes() }
      })

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
      const { container } = render(Carousel, {
        props: { arrows: true, defaultCurrentIndex: 2, infinite: true, onChange },
        slots: { default: () => slideNodes() }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(onChange).toHaveBeenCalledWith(0, 2)
      const track = container.querySelector('[data-tiger-carousel-track]') as HTMLElement
      expect(track.style.transform).toBe('translateX(-400%)')
      expect(container.querySelector('[data-tiger-carousel-slide="active"]')).toHaveAttribute(
        'aria-label',
        'Slide 1 of 3'
      )

      fireEvent.transitionEnd(track)
      vi.advanceTimersByTime(32)
      await nextTick()
      expect(track.style.transform).toBe('translateX(-100%)')
    })

    it('does not wrap the track when infinite is false', () => {
      render(Carousel, {
        props: { arrows: true, infinite: false, defaultCurrentIndex: 2 },
        slots: { default: () => slideNodes() }
      })
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
    })

    it('changes slides with pointer swipe and ignores cancel plus vertical drags', async () => {
      const onChange = vi.fn()
      const { container } = render(Carousel, {
        props: { onChange },
        slots: { default: () => slideNodes() }
      })
      const viewport = container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement

      await fireEvent.pointerDown(viewport, { pointerId: 1, button: 0, clientX: 180, clientY: 60 })
      await fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 120, clientY: 66 })
      await fireEvent.pointerUp(viewport, { pointerId: 1, clientX: 120, clientY: 66 })
      expect(onChange).toHaveBeenCalledWith(1, 0)

      onChange.mockClear()
      await fireEvent.pointerDown(viewport, { pointerId: 2, button: 0, clientX: 180, clientY: 60 })
      await fireEvent.pointerMove(viewport, { pointerId: 2, clientX: 120, clientY: 66 })
      await fireEvent.pointerCancel(viewport, { pointerId: 2, clientX: 120, clientY: 66 })
      expect(onChange).not.toHaveBeenCalled()

      await fireEvent.pointerDown(viewport, { pointerId: 3, button: 0, clientX: 100, clientY: 100 })
      await fireEvent.pointerMove(viewport, { pointerId: 3, clientX: 104, clientY: 180 })
      await fireEvent.pointerUp(viewport, { pointerId: 3, clientX: 104, clientY: 180 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('moves with keyboard and reverses arrows in rtl', async () => {
      const ltrChange = vi.fn()
      const { container } = render({
        setup() {
          return () =>
            h(ConfigProvider, { direction: 'ltr' }, () =>
              h(Carousel, { onChange: ltrChange }, () => slideNodes())
            )
        }
      })
      await fireEvent.keyDown(
        container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement,
        { key: 'ArrowRight' }
      )
      expect(ltrChange).toHaveBeenCalledWith(1, 0)

      const rtlChange = vi.fn()
      const rtl = render({
        setup() {
          return () =>
            h(ConfigProvider, { direction: 'rtl' }, () =>
              h(Carousel, { onChange: rtlChange }, () => slideNodes())
            )
        }
      })
      await fireEvent.keyDown(
        rtl.container.querySelector('[data-tiger-carousel-viewport]') as HTMLElement,
        { key: 'ArrowLeft' }
      )
      expect(rtlChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Autoplay', () => {
    it('auto-advances and exposes a pause control', () => {
      const onChange = vi.fn()
      render(Carousel, {
        props: { autoplay: true, autoplaySpeed: 1000, onChange },
        slots: { default: () => slideNodes() }
      })
      expect(screen.getByRole('button', { name: 'Pause autoplay' })).toBeInTheDocument()
      vi.advanceTimersByTime(1100)
      expect(onChange).toHaveBeenCalledWith(1, 0)
    })

    it('keeps autoplay paused when hover and focus overlap', async () => {
      const onChange = vi.fn()
      const { container } = render(Carousel, {
        props: {
          autoplay: true,
          autoplaySpeed: 1000,
          pauseOnHover: true,
          pauseOnFocus: true,
          onChange
        },
        slots: { default: () => slideNodes() }
      })
      const root = container.querySelector('[data-tiger-carousel]') as HTMLElement
      await fireEvent.mouseEnter(root)
      await fireEvent.focusIn(screen.getByRole('tab', { selected: true }))
      await fireEvent.mouseLeave(root)
      vi.advanceTimersByTime(2000)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Fade', () => {
    it('sizes the track from the current slide rather than the first', () => {
      const { container } = render(Carousel, {
        props: { effect: 'fade', arrows: true, defaultCurrentIndex: 1 },
        slots: {
          default: () => [
            h('div', { key: '1', style: { height: '40px' } }, 'Short'),
            h('div', { key: '2', style: { height: '120px' } }, 'Tall'),
            h('div', { key: '3', style: { height: '80px' } }, 'Mid')
          ]
        }
      })
      const active = container.querySelector('[data-tiger-carousel-slide="active"]') as HTMLElement
      const inactive = container.querySelectorAll('[data-tiger-carousel-slide="inactive"]')
      expect(active).toHaveTextContent('Tall')
      expect(active).not.toHaveAttribute('inert')
      expect(inactive[0]).toHaveAttribute('inert')
      expect(container.querySelector('[data-tiger-carousel-clone]')).toBeNull()
    })
  })

  describe('Imperative API', () => {
    it('exposes next via ref', async () => {
      const onChange = vi.fn()
      const carouselRef = ref<CarouselMethodsLike>()

      render({
        setup() {
          return () => h(Carousel, { ref: carouselRef, onChange }, { default: () => slideNodes() })
        }
      })

      carouselRef.value?.next()
      await nextTick()
      expect(onChange).toHaveBeenCalledWith(1, 0)
    })
  })

  describe('Controlled', () => {
    it('requests currentIndex updates without mutating controlled state', async () => {
      const onUpdateCurrentIndex = vi.fn()
      const onChange = vi.fn()
      const { rerender } = render(Carousel, {
        props: {
          arrows: true,
          currentIndex: 1,
          'onUpdate:currentIndex': onUpdateCurrentIndex,
          onChange
        },
        slots: { default: () => slideNodes() }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
      expect(onUpdateCurrentIndex).toHaveBeenCalledWith(2)
      expect(onChange).toHaveBeenCalledWith(2, 1)
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 2')

      await rerender({ currentIndex: 2 })
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Go to slide 3')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations with interactive slide content', async () => {
      vi.useRealTimers()
      const { container } = render(Carousel, {
        props: { arrows: true },
        slots: { default: () => slideNodes() }
      })
      await expectNoA11yViolations(container)
    })
  })
})

interface CarouselMethodsLike {
  next: () => void
  prev: () => void
  goTo: (index: number) => void
}
