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
  getCarouselDotsClasses,
  getCarouselDotClasses,
  getCarouselArrowClasses,
  getNextSlideIndex,
  getPrevSlideIndex,
  isNextDisabled,
  isPrevDisabled,
  clampSlideIndex,
  getScrollTransform,
  getCarouselTouchPoint,
  resolveCarouselSwipeDirection,
  createCarouselAutoplayController,
  carouselPrevArrowPath,
  carouselNextArrowPath,
  mergeTigerLocale,
  getCarouselLabels,
  type CarouselTouchPoint,
  type CarouselSwipeDirection,
  type CarouselProps as CoreCarouselProps,
  type CarouselMethods,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

export interface CarouselProps extends Omit<CoreCarouselProps, 'style'> {
  /**
   * Controlled current slide index
   */
  currentIndex?: number
  /**
   * Initial current slide index for uncontrolled usage
   */
  defaultCurrentIndex?: number
  /**
   * Callback when the controlled current slide index should change
   */
  onCurrentIndexChange?: (currentIndex: number) => void
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
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleCarousel>
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
      currentIndex: controlledCurrentIndex,
      defaultCurrentIndex = 0,
      pauseOnHover = true,
      pauseOnFocus = true,
      className,
      style,
      locale,
      labels: labelsOverride,
      onCurrentIndexChange,
      onChange,
      onBeforeChange,
      children
    },
    ref
  ) => {
    const config = useTigerConfig()
    // Get slides from children
    const slides = useMemo(() => {
      return React.Children.toArray(children).filter((child) => React.isValidElement(child))
    }, [children])

    const slideCount = slides.length
    const [currentIndexValue, setCurrentIndexValue] = useControlledState(
      controlledCurrentIndex,
      clampSlideIndex(defaultCurrentIndex, slideCount),
      onCurrentIndexChange
    )
    const currentIndex = useMemo(
      () => clampSlideIndex(currentIndexValue, slideCount),
      [currentIndexValue, slideCount]
    )
    const [isPaused, setIsPaused] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const touchStartRef = useRef<CarouselTouchPoint | null>(null)
    const touchCurrentRef = useRef<CarouselTouchPoint | null>(null)
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getCarouselLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )

    // Stable refs for callbacks (avoid restarting autoplay timer on callback changes)
    const onChangeRef = useRef(onChange)
    const onBeforeChangeRef = useRef(onBeforeChange)
    onChangeRef.current = onChange
    onBeforeChangeRef.current = onBeforeChange

    const currentIndexRef = useRef(currentIndex)
    currentIndexRef.current = currentIndex

    const navigateToIndex = useCallback(
      (index: number) => {
        const current = currentIndexRef.current
        const clampedIndex = clampSlideIndex(index, slideCount)
        if (clampedIndex === current) return

        onBeforeChangeRef.current?.(current, clampedIndex)
        setCurrentIndexValue(clampedIndex)
        onChangeRef.current?.(clampedIndex, current)
      },
      [slideCount, setCurrentIndexValue]
    )

    const navigateByDirection = useCallback(
      (direction: CarouselSwipeDirection) => {
        const current = currentIndexRef.current
        const targetIndex =
          direction === 'next'
            ? getNextSlideIndex(current, slideCount, infinite)
            : getPrevSlideIndex(current, slideCount, infinite)

        navigateToIndex(targetIndex)
      },
      [slideCount, infinite, navigateToIndex]
    )

    // Container classes
    const containerClasses = useMemo(
      () => classNames(getCarouselContainerClasses(className)),
      [className]
    )

    // Track classes
    const trackClasses = useMemo(() => {
      return effect === 'fade' ? carouselTrackFadeClasses : carouselTrackScrollClasses
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

    // Slide style for fade effect
    const slideStyle = useMemo(() => ({ transitionDuration: `${speed}ms` }), [speed])

    // Get slide classes
    const getSlideClasses = (index: number) => {
      const isActive = index === currentIndex
      if (effect === 'fade') {
        const positionClass = index === 0 ? 'relative' : 'absolute inset-0'
        return classNames(
          positionClass,
          'w-full transition-opacity ease-in-out',
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
        )
      }
      return carouselSlideBaseClasses
    }

    // Dots classes
    const dotsClasses = useMemo(() => {
      return getCarouselDotsClasses(dotPosition)
    }, [dotPosition])

    // Navigation methods
    const goTo = useCallback(
      (index: number) => {
        navigateToIndex(index)
      },
      [navigateToIndex]
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
      if (!autoplay || isPaused) return

      const controller = createCarouselAutoplayController({
        interval: autoplaySpeed,
        onAdvance: () => {
          const curr = currentIndexRef.current
          const nextIdx = getNextSlideIndex(curr, slideCount, infinite)
          if (nextIdx !== curr) {
            navigateToIndex(nextIdx)
          }
        }
      })

      controller.start()

      return () => controller.stop()
    }, [autoplay, autoplaySpeed, isPaused, slideCount, infinite, navigateToIndex])

    useEffect(() => {
      const container = containerRef.current
      if (!container || slideCount <= 1) return

      const resetTouchGesture = () => {
        touchStartRef.current = null
        touchCurrentRef.current = null
      }

      const handleTouchStart = (event: TouchEvent) => {
        const point = getCarouselTouchPoint(event.touches)
        touchStartRef.current = point
        touchCurrentRef.current = point
      }

      const handleTouchMove = (event: TouchEvent) => {
        if (!touchStartRef.current) return

        const point = getCarouselTouchPoint(event.touches)
        if (point) {
          touchCurrentRef.current = point
        }
      }

      const handleTouchEnd = (event: TouchEvent) => {
        const direction = resolveCarouselSwipeDirection(
          touchStartRef.current,
          getCarouselTouchPoint(event.changedTouches) ?? touchCurrentRef.current
        )

        resetTouchGesture()

        if (direction) {
          navigateByDirection(direction)
        }
      }

      const handleTouchCancel = () => {
        resetTouchGesture()
      }

      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: true })
      container.addEventListener('touchend', handleTouchEnd, { passive: true })
      container.addEventListener('touchcancel', handleTouchCancel, { passive: true })

      return () => {
        resetTouchGesture()
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
        container.removeEventListener('touchcancel', handleTouchCancel)
      }
    }, [navigateByDirection, slideCount])

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

    // Arrow button helper
    const renderArrowButton = (
      type: 'prev' | 'next',
      disabled: boolean,
      onClick: () => void,
      path: string
    ) => (
      <button
        type="button"
        className={getCarouselArrowClasses(type, disabled)}
        onClick={onClick}
        disabled={disabled}
        aria-label={type === 'prev' ? labels.previousSlideAriaLabel : labels.nextSlideAriaLabel}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6">
          <path d={path} />
        </svg>
      </button>
    )

    // Render arrows
    const renderArrows = () => {
      if (!arrows) return null
      return (
        <>
          {renderArrowButton('prev', isPrevArrowDisabled, prev, carouselPrevArrowPath)}
          {renderArrowButton('next', isNextArrowDisabled, next, carouselNextArrowPath)}
        </>
      )
    }

    // Render dots
    const renderDots = () => {
      if (!dots || slideCount <= 1) return null

      return (
        <div className={dotsClasses} role="tablist" aria-label={labels.navigationAriaLabel}>
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              className={getCarouselDotClasses(index === currentIndex)}
              onClick={() => goTo(index)}
              aria-label={labels.goToSlideAriaLabel.replace('{index}', String(index + 1))}
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
          style={effect === 'fade' ? slideStyle : undefined}
          role="group"
          aria-roledescription="slide"
          aria-label={labels.slideAriaLabel
            .replace('{index}', String(index + 1))
            .replace('{total}', String(slideCount))}
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
        ref={containerRef}
        className={containerClasses}
        style={style}
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.ariaLabel}
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
