/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React, { createRef } from 'react'
import { Carousel, type CarouselRef } from '@expcat/tigercat-react'

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
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      expect(screen.getByText('Slide 1')).toBeInTheDocument()
      expect(screen.getByText('Slide 2')).toBeInTheDocument()
      expect(screen.getByText('Slide 3')).toBeInTheDocument()
      expect(container.querySelector('[role="region"]')).toBeInTheDocument()
    })

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

    it('should not render dots when dots is false', () => {
      const { container } = render(
        <Carousel dots={false}>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).not.toBeInTheDocument()
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

    it('should not render arrows by default', () => {
      render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should start at initialSlide', () => {
      const { container } = render(
        <Carousel initialSlide={1}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[1]).toHaveAttribute('aria-current', 'true')
    })

    it('should render dots in different positions', () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const

      positions.forEach((position) => {
        const { container, unmount } = render(
          <Carousel dotPosition={position}>
            <div>Slide 1</div>
            <div>Slide 2</div>
          </Carousel>
        )

        const dotsContainer = container.querySelector('[role="tablist"]')
        expect(dotsContainer).toBeInTheDocument()
        unmount()
      })
    })

    it('should apply scroll effect by default', () => {
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const track = container.querySelector('.flex.transition-transform')
      expect(track).toBeInTheDocument()
    })

    it('should apply fade effect when effect is fade', () => {
      const { container } = render(
        <Carousel effect="fade">
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const track = container.querySelector('.relative')
      expect(track).toBeInTheDocument()
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

    it('should navigate to previous slide when prev arrow is clicked', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel arrows initialSlide={1} onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const prevButton = screen.getByRole('button', { name: 'Previous slide' })
      await fireEvent.click(prevButton)

      expect(onChange).toHaveBeenCalledWith(0, 1)

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[0]).toHaveAttribute('aria-current', 'true')
    })

    it('should navigate to specific slide when dot is clicked', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const dots = container.querySelectorAll('[role="tablist"] button')
      await fireEvent.click(dots[2])

      expect(onChange).toHaveBeenCalledWith(2, 0)
      expect(dots[2]).toHaveAttribute('aria-current', 'true')
    })

    it('should loop to first slide when clicking next at last slide with infinite=true', async () => {
      const onChange = vi.fn()

      render(
        <Carousel arrows initialSlide={2} infinite onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onChange).toHaveBeenCalledWith(0, 2)
    })

    it('should not loop when infinite=false', async () => {
      const onChange = vi.fn()

      render(
        <Carousel arrows initialSlide={2} infinite={false} onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      expect(nextButton).toBeDisabled()

      await fireEvent.click(nextButton)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('Events', () => {
    it('should call onBeforeChange event before navigation', async () => {
      const onBeforeChange = vi.fn()

      render(
        <Carousel arrows onBeforeChange={onBeforeChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const nextButton = screen.getByRole('button', { name: 'Next slide' })
      await fireEvent.click(nextButton)

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1)
    })

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
        vi.advanceTimersByTime(1000)
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

    it('should resume autoplay on mouse leave', async () => {
      const onChange = vi.fn()

      const { container } = render(
        <Carousel autoplay autoplaySpeed={1000} pauseOnHover onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const carousel = container.querySelector('[role="region"]')!

      // Pause
      await fireEvent.mouseEnter(carousel)

      // Resume
      await fireEvent.mouseLeave(carousel)

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(onChange).toHaveBeenCalled()
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

    it('should expose prev method via ref', async () => {
      const ref = createRef<CarouselRef>()
      const onChange = vi.fn()

      render(
        <Carousel ref={ref} initialSlide={1} onChange={onChange}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
        </Carousel>
      )

      act(() => {
        ref.current?.prev()
      })

      expect(onChange).toHaveBeenCalledWith(0, 1)
    })

    it('should expose goTo method via ref', async () => {
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
        ref.current?.goTo(2)
      })

      expect(onChange).toHaveBeenCalledWith(2, 0)
    })
  })

  describe('Accessibility', () => {
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

    it('should have proper ARIA attributes on slides', () => {
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const slides = container.querySelectorAll('[role="group"]')
      expect(slides).toHaveLength(2)
      expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide')
      expect(slides[0]).toHaveAttribute('aria-label', 'Slide 1 of 2')
      expect(slides[0]).toHaveAttribute('aria-hidden', 'false')
      expect(slides[1]).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have proper ARIA attributes on navigation buttons', () => {
      render(
        <Carousel arrows>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const prevButton = screen.getByRole('button', { name: 'Previous slide' })
      const nextButton = screen.getByRole('button', { name: 'Next slide' })

      expect(prevButton).toHaveAttribute('type', 'button')
      expect(nextButton).toHaveAttribute('type', 'button')
    })

    it('should have proper ARIA attributes on dots', () => {
      const { container } = render(
        <Carousel>
          <div>Slide 1</div>
          <div>Slide 2</div>
        </Carousel>
      )

      const dotsContainer = container.querySelector('[role="tablist"]')
      expect(dotsContainer).toHaveAttribute('aria-label', 'Carousel navigation')

      const dots = container.querySelectorAll('[role="tablist"] button')
      expect(dots[0]).toHaveAttribute('aria-label', 'Go to slide 1')
      expect(dots[1]).toHaveAttribute('aria-label', 'Go to slide 2')
    })
  })
})
