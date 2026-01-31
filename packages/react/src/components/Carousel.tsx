import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react'
import {
  classNames,
  getCarouselContainerClasses,
  carouselTrackScrollClasses,
  carouselTrackFadeClasses,
  carouselSlideBaseClasses,
  carouselSlideFadeClasses,
  getCarouselDotsClasses,
  getCarouselDotClasses,
  getCarouselArrowClasses,
  getNextSlideIndex,
  getPrevSlideIndex,
  isNextDisabled,
  isPrevDisabled,
  clampSlideIndex,
  getScrollTransform,
  carouselPrevArrowPath,
  carouselNextArrowPath,
  type CarouselDotPosition,
  type CarouselEffect,
  type CarouselProps as CoreCarouselProps,
  type CarouselMethods
} from '@expcat/tigercat-core'

export interface CarouselProps extends Omit<CoreCarouselProps, 'style'> {
  /**
   * Callback when slide changes
   */
  onChange?: (current: number, prev: number) => void
  /**
   * Callback before slide changes
   */
  onBeforeChange?: (current: number, next: number) => void
  /**
   * Carousel slides
   */
  children?: React.ReactNode
  /**
   * Custom styles
   */
  style?: React.CSSProperties
}

export interface CarouselRef extends CarouselMethods {}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (
    {
      autoplay = false,
      autoplaySpeed = 3000,
      dots = true,
      dotPosition = 'bottom',
      effect = 'scroll',
      arrows = false,
      infinite = true,
      speed = 500,
      initialSlide = 0,
      pauseOnHover = true,
      pauseOnFocus = true,
      className,
      style,
      onChange,
      onBeforeChange,
      children
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(initialSlide)
    const [isPaused, setIsPaused] = useState(false)
    const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Get slides from children
    const slides = useMemo(() => {
      return React.Children.toArray(children).filter(
        (child) => React.isValidElement(child)
      )
    }, [children])

    const slideCount = slides.length

    // Container classes
    const containerClasses = useMemo(
      () => classNames(getCarouselContainerClasses(className)),
      [className]
    )

    // Track classes
    const trackClasses = useMemo(() => {
      if (effect === 'fade') {
        return carouselTrackFadeClasses
      }
      return carouselTrackScrollClasses
    }, [effect])

    // Track style for scroll effect
    const trackStyle = useMemo(() => {
      if (effect === 'scroll') {
        return {
          transform: getScrollTransform(currentIndex),
          transitionDuration: `${speed}ms`
        }
      }
      return {}
    }, [effect, currentIndex, speed])

    // Get slide classes
    const getSlideClasses = useCallback(
      (index: number) => {
        const isActive = index === currentIndex
        if (effect === 'fade') {
          return classNames(
            carouselSlideFadeClasses,
            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )
        }
        return carouselSlideBaseClasses
      },
      [effect, currentIndex]
    )

    // Get slide style for fade effect
    const getSlideStyle = useCallback(() => {
      return {
        transitionDuration: `${speed}ms`
      }
    }, [speed])

    // Dots classes
    const dotsClasses = useMemo(() => {
      return getCarouselDotsClasses(dotPosition)
    }, [dotPosition])

    // Navigation methods
    const goTo = useCallback(
      (index: number) => {
        const clampedIndex = clampSlideIndex(index, slideCount)
        if (clampedIndex === currentIndex) return

        onBeforeChange?.(currentIndex, clampedIndex)
        const prevIndex = currentIndex
        setCurrentIndex(clampedIndex)
        onChange?.(clampedIndex, prevIndex)
      },
      [currentIndex, slideCount, onBeforeChange, onChange]
    )

    const next = useCallback(() => {
      const nextIdx = getNextSlideIndex(currentIndex, slideCount, infinite)
      if (nextIdx !== currentIndex) {
        goTo(nextIdx)
      }
    }, [currentIndex, slideCount, infinite, goTo])

    const prev = useCallback(() => {
      const prevIdx = getPrevSlideIndex(currentIndex, slideCount, infinite)
      if (prevIdx !== currentIndex) {
        goTo(prevIdx)
      }
    }, [currentIndex, slideCount, infinite, goTo])

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        next,
        prev,
        goTo
      }),
      [next, prev, goTo]
    )

    // Autoplay effect
    useEffect(() => {
      if (autoplay && !isPaused) {
        // Clear any existing timer first
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current)
        }
        autoplayTimerRef.current = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            const nextIdx = getNextSlideIndex(prevIndex, slideCount, infinite)
            if (nextIdx !== prevIndex) {
              onBeforeChange?.(prevIndex, nextIdx)
              onChange?.(nextIdx, prevIndex)
            }
            return nextIdx
          })
        }, autoplaySpeed)
      }
      return () => {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current)
          autoplayTimerRef.current = null
        }
      }
    }, [autoplay, autoplaySpeed, isPaused, slideCount, infinite, onChange, onBeforeChange])

    // Pause/Resume handlers
    const handleMouseEnter = useCallback(() => {
      if (pauseOnHover && autoplay) {
        setIsPaused(true)
      }
    }, [pauseOnHover, autoplay])

    const handleMouseLeave = useCallback(() => {
      if (pauseOnHover && autoplay) {
        setIsPaused(false)
      }
    }, [pauseOnHover, autoplay])

    const handleFocus = useCallback(() => {
      if (pauseOnFocus && autoplay) {
        setIsPaused(true)
      }
    }, [pauseOnFocus, autoplay])

    const handleBlur = useCallback(() => {
      if (pauseOnFocus && autoplay) {
        setIsPaused(false)
      }
    }, [pauseOnFocus, autoplay])

    // Arrow disabled state
    const isPrevArrowDisabled = useMemo(
      () => isPrevDisabled(currentIndex, slideCount, infinite),
      [currentIndex, slideCount, infinite]
    )

    const isNextArrowDisabled = useMemo(
      () => isNextDisabled(currentIndex, slideCount, infinite),
      [currentIndex, slideCount, infinite]
    )

    // Render arrows
    const renderArrows = () => {
      if (!arrows) return null

      return (
        <>
          <button
            type="button"
            className={getCarouselArrowClasses('prev', isPrevArrowDisabled)}
            onClick={prev}
            disabled={isPrevArrowDisabled}
            aria-label="Previous slide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6">
              <path d={carouselPrevArrowPath} />
            </svg>
          </button>
          <button
            type="button"
            className={getCarouselArrowClasses('next', isNextArrowDisabled)}
            onClick={next}
            disabled={isNextArrowDisabled}
            aria-label="Next slide">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6">
              <path d={carouselNextArrowPath} />
            </svg>
          </button>
        </>
      )
    }

    // Render dots
    const renderDots = () => {
      if (!dots || slideCount <= 1) return null

      return (
        <div
          className={dotsClasses}
          role="tablist"
          aria-label="Carousel navigation">
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={getCarouselDotClasses(index === currentIndex)}
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )
    }

    // Render slides
    const renderSlides = () => {
      const slideElements = slides.map((slide, index) => (
        <div
          key={index}
          className={getSlideClasses(index)}
          style={effect === 'fade' ? getSlideStyle() : undefined}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${slideCount}`}
          aria-hidden={index !== currentIndex}>
          {slide}
        </div>
      ))

      // For fade effect, wrap slides in a relative container
      if (effect === 'fade') {
        return <div className={classNames(trackClasses, 'h-full')}>{slideElements}</div>
      }

      // For scroll effect
      return (
        <div className={trackClasses} style={trackStyle}>
          {slideElements}
        </div>
      )
    }

    return (
      <div
        className={containerClasses}
        style={style}
        role="region"
        aria-roledescription="carousel"
        aria-label="Image carousel"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}>
        {renderSlides()}
        {renderArrows()}
        {renderDots()}
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'
