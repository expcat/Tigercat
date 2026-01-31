/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Carousel } from '@expcat/tigercat-vue'

describe('Carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2'),
            h('div', { key: '3' }, 'Slide 3')
          ]
        }
      })

      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
      expect(container.querySelector('[role="region"]')).toBeInTheDocument()
    })

    it('should render with navigation dots by default', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots).toHaveLength(2)
    })

    it('should not render dots when dots is false', () => {
      const { container } = render(Carousel, {
        props: { dots: false },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).not.toBeInTheDocument()
    })

    it('should render arrows when arrows is true', () => {
      render(Carousel, {
        props: { arrows: true },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument()
    })

    it('should not render arrows by default', () => {
      render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should start at initialSlide', () => {
      const { container } = render(Carousel, {
        props: { initialSlide: 1 },
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

    it('should render dots in different positions', () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const

      positions.forEach((position) => {
        const { container, unmount } = render(Carousel, {
          props: { dotPosition: position },
          slots: {
            default: () => [
              h('div', { key: '1' }, 'Slide 1'),
              h('div', { key: '2' }, 'Slide 2')
            ]
          }
        })

        const dotsContainer = container.querySelector('[role="tablist"]')
        expect(dotsContainer).toBeInTheDocument()
        unmount()
      })
    })

    it('should apply scroll effect by default', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const track = container.querySelector('.flex.transition-transform')
      expect(track).toBeInTheDocument()
    })

    it('should apply fade effect when effect is fade', () => {
      const { container } = render(Carousel, {
        props: { effect: 'fade' },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const track = container.querySelector('.relative')
      expect(track).toBeInTheDocument()
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

    it('should navigate to previous slide when prev arrow is clicked', async () => {
      const onChange = vi.fn()

      const { container } = render(Carousel, {
        props: {
          arrows: true,
          initialSlide: 1,
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

      const prevButton = screen.getByRole('button', { name: 'Previous slide' })
      await fireEvent.click(prevButton)

      expect(onChange).toHaveBeenCalledWith(0, 1)

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[0]).toHaveAttribute('aria-current', 'true')
    })

    it('should navigate to specific slide when dot is clicked', async () => {
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

      const dots = container.querySelectorAll('[role="tablist"] button')
      await fireEvent.click(dots[2])

      expect(onChange).toHaveBeenCalledWith(2, 0)
      expect(dots[2]).toHaveAttribute('aria-current', 'true')
    })

    it('should loop to first slide when clicking next at last slide with infinite=true', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          initialSlide: 2,
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

    it('should not loop when infinite=false', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          initialSlide: 2,
          infinite: false,
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
      expect(nextButton).toBeDisabled()

      await fireEvent.click(nextButton)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Events', () => {
    it('should emit before-change event before navigation', async () => {
      const onBeforeChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          'onBefore-change': onBeforeChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1)
    })

    it('should emit change event after navigation', async () => {
      const onChange = vi.fn()

      render(Carousel, {
        props: {
          arrows: true,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
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
      vi.advanceTimersByTime(1000)

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
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const carousel = container.querySelector('[role="region"]')!
      await fireEvent.mouseEnter(carousel)

      // Advance timer
      vi.advanceTimersByTime(2000)

      // Should not have changed since it's paused
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should resume autoplay on mouse leave', async () => {
      const onChange = vi.fn()

      const { container } = render(Carousel, {
        props: {
          autoplay: true,
          autoplaySpeed: 1000,
          pauseOnHover: true,
          onChange
        },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const carousel = container.querySelector('[role="region"]')!

      // Pause
      await fireEvent.mouseEnter(carousel)

      // Resume
      await fireEvent.mouseLeave(carousel)

      // Advance timer
      vi.advanceTimersByTime(1000)

      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on container', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const carouselEl = container.querySelector('[role="region"]')
      expect(carouselEl).toHaveAttribute('aria-roledescription', 'carousel')
      expect(carouselEl).toHaveAttribute('aria-label')
    })

    it('should have proper ARIA attributes on slides', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const slides = container.querySelectorAll('[role="group"]')
      expect(slides).toHaveLength(2)
      expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide')
      expect(slides[0]).toHaveAttribute('aria-label', 'Slide 1 of 2')
      expect(slides[0]).toHaveAttribute('aria-hidden', 'false')
      expect(slides[1]).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper ARIA attributes on navigation buttons', () => {
      render(Carousel, {
        props: { arrows: true },
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const prevButton = screen.getByRole('button', { name: 'Previous slide' })
      const nextButton = screen.getByRole('button', { name: 'Next slide' })

      expect(prevButton).toHaveAttribute('type', 'button')
      expect(nextButton).toHaveAttribute('type', 'button')
    })

    it('should have proper ARIA attributes on dots', () => {
      const { container } = render(Carousel, {
        slots: {
          default: () => [
            h('div', { key: '1' }, 'Slide 1'),
            h('div', { key: '2' }, 'Slide 2')
          ]
        }
      })

      const dotsContainer = container.querySelector('[role="tablist"]')
      expect(dotsContainer).toHaveAttribute('aria-label', 'Carousel navigation')

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[0]).toHaveAttribute('aria-label', 'Go to slide 1')
      expect(dots[1]).toHaveAttribute('aria-label', 'Go to slide 2')
    })
  })
})
