import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useMemo,
  useImperativeHandle,
  useId,
  forwardRef
} from 'react'
import {
  carouselPauseButtonClasses,
  carouselTrackFadeClasses,
  carouselNextArrowPath,
  carouselPrevArrowPath,
  clampSlideIndex,
  classNames,
  createCarouselAutoplayController,
  getCarouselArrowClasses,
  getCarouselContainerClasses,
  getCarouselDotClasses,
  getCarouselDotMarkClasses,
  getCarouselDotsClasses,
  getCarouselLabels,
  getCarouselPointerPoint,
  getCarouselSlideClasses,
  getCarouselSlideSizeStyle,
  getCarouselTrackRenderedOffset,
  getCarouselTrackScrollClasses,
  getCarouselViewportClasses,
  getCarouselWindowStart,
  getNextSlideIndex,
  getPrevSlideIndex,
  getCarouselAxisTransform,
  getCarouselSlidesPerView,
  carouselStatusClasses,
  carouselTrackInstantClasses,
  formatCarouselSlideStatus,
  isCarouselAutoplayEnabled,
  isCarouselAxisLock,
  isCarouselChromeTarget,
  isCarouselFocusInside,
  isCarouselKeyboardIgnoredTarget,
  isCarouselPaused,
  isCarouselSlideVisible,
  isNextDisabled,
  isPrevDisabled,
  mergeTigerLocale,
  prefersReducedMotion,
  subscribePrefersReducedMotion,
  resolveCarouselKeyboardNavigation,
  resolveCarouselRegion,
  resolveCarouselRootDir,
  resolveCarouselSlideOrder,
  resolveCarouselSwipeDirection,
  resolveCarouselWindowTransition,
  shouldLoopCarousel,
  type CarouselMethods,
  type CarouselProps as CoreCarouselProps,
  type CarouselSwipeDirection,
  type CarouselTouchPoint,
  type CarouselWindowTransition,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './tiger-config'

export interface CarouselProps
  extends
    Omit<CoreCarouselProps, 'style'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreCarouselProps | 'onChange'> {
  currentIndex?: number
  defaultCurrentIndex?: number
  onCurrentIndexChange?: (currentIndex: number) => void
  onChange?: (current: number, prev: number) => void
  onBeforeChange?: (current: number, next: number) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleCarousel>
  thumbnails?: boolean
}

export interface CarouselRef extends CarouselMethods {}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  (
    {
      autoplay = false,
      autoplaySpeed = 3000,
      dots = true,
      axis = 'horizontal',
      slidesPerView = 1,
      thumbnails = false,
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
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      dir: rootDir,
      ...rest
    },
    ref
  ) => {
    const { 'aria-label': ariaLabelAttr, 'aria-labelledby': ariaLabelledByAttr, ...domProps } = rest
    const config = useTigerConfig()
    const instanceId = useId()
    const slides = useMemo(
      () => React.Children.toArray(children).filter((child) => React.isValidElement(child)),
      [children]
    )
    const slideCount = slides.length
    const looping = shouldLoopCarousel(infinite, slideCount, effect)
    const perView = getCarouselSlidesPerView(slidesPerView, slideCount)
    // An explicit root dir attribute wins over the provider direction so the
    // DOM, transforms, keyboard, and gestures read one direction.
    const dir = resolveCarouselRootDir(rootDir, config.direction)
    const [reducedMotion, setReducedMotion] = useState(false)
    useEffect(() => {
      setReducedMotion(prefersReducedMotion())
      return subscribePrefersReducedMotion(setReducedMotion)
    }, [])
    const autoplayEnabled = isCarouselAutoplayEnabled(autoplay, autoplaySpeed, reducedMotion)

    const [currentIndex, setCurrentIndexValue] = useControlledState({
      value: controlledCurrentIndex,
      defaultValue: defaultCurrentIndex,
      onChange: onCurrentIndexChange,
      postState: (index) => clampSlideIndex(index, slideCount)
    })
    const [hovered, setHovered] = useState(false)
    const [focused, setFocused] = useState(false)
    const [userPaused, setUserPaused] = useState(false)
    // Rotation base of the cyclic window and the animated offset in slide
    // slots. Steady state is always baseIndex === windowStart, trackOffset 0.
    const [baseIndex, setBaseIndex] = useState(() =>
      getCarouselWindowStart(currentIndex, slideCount, perView, looping)
    )
    const [trackOffset, setTrackOffset] = useState(0)
    const [snapPending, setSnapPending] = useState(false)

    const paused = isCarouselPaused({
      userPaused,
      pauseOnHover,
      pauseOnFocus,
      hovered,
      focused
    })

    const containerRef = useRef<HTMLDivElement | null>(null)
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const trackRef = useRef<HTMLDivElement | null>(null)
    const wrappingRef = useRef(false)
    const pendingTransitionRef = useRef<CarouselWindowTransition | null>(null)
    const requestedIndexRef = useRef(
      controlledCurrentIndex !== undefined ? controlledCurrentIndex : defaultCurrentIndex
    )
    const pointerRef = useRef<{
      id: number
      start: CarouselTouchPoint
      current: CarouselTouchPoint
      locked: boolean
    } | null>(null)

    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(
      () => getCarouselLabels(mergedLocale, labelsOverride),
      [mergedLocale, labelsOverride]
    )
    const namedAriaLabel =
      typeof ariaLabelAttr === 'string' ? ariaLabelAttr : labelsOverride?.ariaLabel
    const region = resolveCarouselRegion({
      ariaLabel: namedAriaLabel,
      labelledBy: typeof ariaLabelledByAttr === 'string' ? ariaLabelledByAttr : undefined
    })

    const onChangeRef = useRef(onChange)
    const onBeforeChangeRef = useRef(onBeforeChange)
    onChangeRef.current = onChange
    onBeforeChangeRef.current = onBeforeChange
    const currentIndexRef = useRef(currentIndex)
    currentIndexRef.current = currentIndex
    const baseIndexRef = useRef(baseIndex)
    baseIndexRef.current = baseIndex
    const trackOffsetRef = useRef(trackOffset)
    trackOffsetRef.current = trackOffset
    const infiniteRef = useRef(infinite)
    infiniteRef.current = infinite
    const effectRef = useRef(effect)
    effectRef.current = effect
    const slideCountRef = useRef(slideCount)
    slideCountRef.current = slideCount
    const dirRef = useRef(dir)
    dirRef.current = dir
    const axisRef = useRef(axis)
    axisRef.current = axis
    const speedRef = useRef(speed)
    speedRef.current = speed
    const perViewRef = useRef(perView)
    perViewRef.current = perView
    const reducedMotionRef = useRef(reducedMotion)
    reducedMotionRef.current = reducedMotion

    const applyWindowPlan = useCallback((plan: CarouselWindowTransition) => {
      pendingTransitionRef.current = null
      // Reduced motion forces a 0ms duration through the shared CSS rule, so
      // a wrap must not wait for a transitionend that never fires.
      const duration = speedRef.current <= 0 || reducedMotionRef.current ? 0 : speedRef.current
      if (plan.fromOffset === plan.toOffset || duration === 0) {
        wrappingRef.current = false
        setSnapPending(false)
        setBaseIndex(plan.windowStart)
        setTrackOffset(0)
        return
      }
      wrappingRef.current = true
      pendingTransitionRef.current = plan
      if (plan.normalizeAfter) {
        setSnapPending(false)
        setBaseIndex(plan.base)
        setTrackOffset(plan.toOffset)
        return
      }
      setSnapPending(true)
      setBaseIndex(plan.base)
      setTrackOffset(plan.fromOffset)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pendingTransitionRef.current !== plan) return
          setSnapPending(false)
          setTrackOffset(plan.toOffset)
        })
      })
    }, [])

    // Re-plan the window from the live track state. An in-flight plan already
    // heading to the same window absorbs the input; otherwise the rendered
    // offset is sampled so the next plan resumes from the visible position.
    const syncWindow = useCallback(
      (to: number, source: 'step' | 'goto', from: number) => {
        const count = slideCountRef.current
        const loopingNow = shouldLoopCarousel(infiniteRef.current, count, effectRef.current)
        const target = getCarouselWindowStart(to, count, perViewRef.current, loopingNow)
        if (wrappingRef.current) {
          if (pendingTransitionRef.current?.windowStart === target) return
        } else if (baseIndexRef.current === target && trackOffsetRef.current === 0) return
        applyWindowPlan(
          resolveCarouselWindowTransition({
            from,
            to,
            count,
            perView: perViewRef.current,
            looping: loopingNow,
            source,
            start: {
              base: baseIndexRef.current,
              offset: wrappingRef.current
                ? getCarouselTrackRenderedOffset(
                    trackRef.current,
                    axisRef.current,
                    perViewRef.current,
                    dirRef.current
                  )
                : 0
            }
          })
        )
      },
      [applyWindowPlan]
    )

    const navigateToIndex = useCallback(
      (index: number, source: 'step' | 'goto' = 'goto') => {
        const count = slideCountRef.current
        const current = currentIndexRef.current
        const clampedIndex = clampSlideIndex(index, count)
        if (clampedIndex === current) return

        onBeforeChangeRef.current?.(current, clampedIndex)
        // Controlled carousels re-plan from the prop-driven layout effect once
        // the parent accepts the requested index.
        if (controlledCurrentIndex === undefined) {
          syncWindow(clampedIndex, source, current)
        }
        requestedIndexRef.current = clampedIndex
        setCurrentIndexValue(clampedIndex)
        onChangeRef.current?.(clampedIndex, current)
      },
      [controlledCurrentIndex, setCurrentIndexValue, syncWindow]
    )

    const navigateByDirection = useCallback(
      (direction: CarouselSwipeDirection) => {
        const current = currentIndexRef.current
        const count = slideCountRef.current
        const targetIndex =
          direction === 'next'
            ? getNextSlideIndex(current, count, infiniteRef.current)
            : getPrevSlideIndex(current, count, infiniteRef.current)
        navigateToIndex(targetIndex, 'step')
      },
      [navigateToIndex]
    )

    const goTo = useCallback(
      (index: number) => {
        navigateToIndex(index, 'goto')
      },
      [navigateToIndex]
    )

    const next = useCallback(() => {
      navigateByDirection('next')
    }, [navigateByDirection])

    const prev = useCallback(() => {
      navigateByDirection('prev')
    }, [navigateByDirection])

    useImperativeHandle(ref, () => ({ next, prev, goTo }), [next, prev, goTo])

    useLayoutEffect(() => {
      syncWindow(currentIndex, 'goto', currentIndex)
    }, [currentIndex, slideCount, looping, perView, syncWindow])

    const effectiveDuration = speed <= 0 || reducedMotion ? 0 : speed
    // A reduced-motion switch or a zero speed does not cancel an already
    // running CSS transition; settle the pending plan through the instant
    // path so the current page becomes visible immediately.
    useEffect(() => {
      if (effectiveDuration !== 0 || !pendingTransitionRef.current) return
      applyWindowPlan(pendingTransitionRef.current)
    }, [effectiveDuration, applyWindowPlan])

    useEffect(() => {
      const requested =
        controlledCurrentIndex !== undefined ? controlledCurrentIndex : requestedIndexRef.current
      const clamped = clampSlideIndex(requested, slideCount)
      if (clamped === requested) return
      requestedIndexRef.current = clamped
      if (clamped !== currentIndexRef.current) {
        navigateToIndex(clamped, 'goto')
      }
    }, [slideCount, controlledCurrentIndex, navigateToIndex])

    useEffect(() => {
      if (!autoplayEnabled || paused) return
      const controller = createCarouselAutoplayController({
        interval: autoplaySpeed,
        onAdvance: () => {
          navigateByDirection('next')
        }
      })
      controller.start()
      return () => controller.stop()
    }, [autoplayEnabled, autoplaySpeed, paused, navigateByDirection])

    useEffect(() => {
      const viewport = viewportRef.current
      if (!viewport || slideCount <= 1) return

      const resetPointer = () => {
        pointerRef.current = null
      }

      const handlePointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return
        if (isCarouselChromeTarget(event.target)) return
        const point = getCarouselPointerPoint(event)
        if (!point) return
        pointerRef.current = {
          id: event.pointerId,
          start: point,
          current: point,
          locked: false
        }
      }

      const handlePointerMove = (event: PointerEvent) => {
        const session = pointerRef.current
        if (!session || session.id !== event.pointerId) return
        const point = getCarouselPointerPoint(event)
        if (!point) return
        session.current = point
        if (!session.locked && isCarouselAxisLock(session.start, point, axisRef.current)) {
          session.locked = true
          // Capture only once the gesture is a drag so plain clicks on slide
          // content keep their native target.
          try {
            viewport.setPointerCapture(event.pointerId)
          } catch {
            /* happy-dom and some SVG targets omit capture */
          }
        }
        if (session.locked && event.cancelable) {
          event.preventDefault()
        }
      }

      const handlePointerEnd = (event: PointerEvent) => {
        const session = pointerRef.current
        if (!session || session.id !== event.pointerId) return
        const end = getCarouselPointerPoint(event) ?? session.current
        const direction = resolveCarouselSwipeDirection(session.start, end, {
          dir: dirRef.current,
          axis: axisRef.current
        })
        resetPointer()
        if (direction) navigateByDirection(direction)
      }

      const handlePointerCancel = (event: PointerEvent) => {
        if (pointerRef.current?.id === event.pointerId) resetPointer()
      }

      viewport.addEventListener('pointerdown', handlePointerDown)
      viewport.addEventListener('pointermove', handlePointerMove, { passive: false })
      viewport.addEventListener('pointerup', handlePointerEnd)
      viewport.addEventListener('pointercancel', handlePointerCancel)

      return () => {
        resetPointer()
        viewport.removeEventListener('pointerdown', handlePointerDown)
        viewport.removeEventListener('pointermove', handlePointerMove)
        viewport.removeEventListener('pointerup', handlePointerEnd)
        viewport.removeEventListener('pointercancel', handlePointerCancel)
      }
    }, [navigateByDirection, slideCount])

    const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return
      if (!wrappingRef.current) return
      wrappingRef.current = false
      const plan = pendingTransitionRef.current
      pendingTransitionRef.current = null
      if (!plan || !plan.normalizeAfter) return
      setSnapPending(true)
      setBaseIndex(plan.windowStart)
      setTrackOffset(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSnapPending(false))
      })
    }

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      if (pauseOnHover && autoplayEnabled) setHovered(true)
      onMouseEnter?.(event)
    }

    const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
      if (pauseOnHover && autoplayEnabled) setHovered(false)
      onMouseLeave?.(event)
    }

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      if (pauseOnFocus && autoplayEnabled) setFocused(true)
      onFocus?.(event)
    }

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      if (
        pauseOnFocus &&
        autoplayEnabled &&
        !isCarouselFocusInside(event.currentTarget, event.relatedTarget)
      ) {
        setFocused(false)
      }
      onBlur?.(event)
    }

    const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || slideCount <= 1) return
      if (isCarouselKeyboardIgnoredTarget(event.target)) return
      if ((event.target as Element | null)?.closest?.('[role="tablist"]')) return
      const action = resolveCarouselKeyboardNavigation(event.key, dir, axis)
      if (!action) return
      event.preventDefault()
      if (action === 'next') next()
      else if (action === 'prev') prev()
      else if (action === 'first') goTo(0)
      else goTo(slideCount - 1)
    }

    const isPrevArrowDisabled = isPrevDisabled(currentIndex, slideCount, infinite)
    const isNextArrowDisabled = isNextDisabled(currentIndex, slideCount, infinite)
    const carouselDuration = snapPending || speed <= 0 ? '0ms' : `${speed}ms`
    const trackInstant = snapPending || speed <= 0

    const renderArrowButton = (
      type: 'prev' | 'next',
      disabled: boolean,
      onClick: () => void,
      path: string
    ) => (
      <button
        type="button"
        data-tiger-carousel-chrome=""
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
          className="w-6 h-6"
          aria-hidden="true"
          focusable="false">
          <path d={path} />
        </svg>
      </button>
    )

    const windowStart = getCarouselWindowStart(currentIndex, slideCount, perView, looping)

    const renderSlide = (slide: React.ReactNode, logicalIndex: number) => {
      const active = logicalIndex === currentIndex
      const slideId = `${instanceId}-slide-${logicalIndex}`
      const visible =
        effect === 'fade'
          ? active
          : isCarouselSlideVisible(logicalIndex, windowStart, slideCount, perView, looping)
      const hidden = !visible
      return (
        <div
          key={slideId}
          id={slideId}
          className={getCarouselSlideClasses({ effect, active })}
          style={
            effect === 'fade'
              ? ({ ['--tiger-carousel-duration']: carouselDuration } as React.CSSProperties)
              : (getCarouselSlideSizeStyle(axis, perView) as React.CSSProperties)
          }
          role="group"
          aria-roledescription={labels.slideRoleDescription}
          aria-label={labels.slideAriaLabel
            .replace('{index}', String(logicalIndex + 1))
            .replace('{total}', String(slideCount))}
          aria-hidden={hidden || undefined}
          inert={hidden || undefined}
          data-tiger-carousel-slide={active ? 'active' : 'inactive'}>
          {slide}
        </div>
      )
    }

    // Real slides render in cyclic display order so DOM reading and tab
    // order match the visible window; keyed moves keep one component
    // instance per slide across wraps.
    const slideNodes =
      effect === 'fade'
        ? slides.map((slide, index) => renderSlide(slide, index))
        : resolveCarouselSlideOrder(slideCount, baseIndex).map((index) =>
            renderSlide(slides[index], index)
          )

    const track =
      effect === 'fade' ? (
        <div
          className={classNames(
            carouselTrackFadeClasses,
            trackInstant && carouselTrackInstantClasses
          )}
          data-tiger-carousel-track="">
          {slideNodes}
        </div>
      ) : (
        <div
          ref={trackRef}
          className={classNames(
            getCarouselTrackScrollClasses(axis),
            trackInstant && carouselTrackInstantClasses
          )}
          data-tiger-carousel-track=""
          style={
            {
              transform: getCarouselAxisTransform(trackOffset, axis, perView, dir),
              ['--tiger-carousel-duration']: carouselDuration
            } as React.CSSProperties
          }
          onTransitionEnd={handleTrackTransitionEnd}>
          {slideNodes}
        </div>
      )

    return (
      <div
        {...domProps}
        ref={containerRef}
        className={classNames(getCarouselContainerClasses(className))}
        style={style}
        data-tiger-carousel=""
        data-axis={axis}
        data-slides-per-view={String(getCarouselSlidesPerView(slidesPerView, slideCount))}
        role={region.role}
        aria-roledescription={labels.roleDescription}
        aria-label={region.ariaLabel}
        aria-labelledby={typeof ariaLabelledByAttr === 'string' ? ariaLabelledByAttr : undefined}
        dir={rootDir}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleRootKeyDown}>
        <div
          ref={viewportRef}
          className={getCarouselViewportClasses(axis)}
          data-tiger-carousel-viewport="">
          {track}
        </div>
        <div className={carouselStatusClasses} role="status" aria-live="polite">
          {formatCarouselSlideStatus(labels.slideAriaLabel, currentIndex, slideCount)}
        </div>
        {autoplayEnabled ? (
          <button
            type="button"
            data-tiger-carousel-chrome=""
            className={carouselPauseButtonClasses}
            aria-label={userPaused ? labels.playAriaLabel : labels.pauseAriaLabel}
            aria-pressed={userPaused}
            onClick={() => setUserPaused((value) => !value)}>
            {userPaused ? labels.playAriaLabel : labels.pauseAriaLabel}
          </button>
        ) : null}
        {arrows
          ? renderArrowButton('prev', isPrevArrowDisabled, prev, carouselPrevArrowPath)
          : null}
        {arrows
          ? renderArrowButton('next', isNextArrowDisabled, next, carouselNextArrowPath)
          : null}
        {thumbnails && slideCount > 1 ? (
          <div data-tiger-carousel-thumbs="">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                data-tiger-carousel-thumb={index}
                aria-current={index === currentIndex ? 'true' : undefined}
                onClick={() => goTo(index)}>
                {index + 1}
              </button>
            ))}
          </div>
        ) : null}
        {dots && slideCount > 1 ? (
          <div
            className={getCarouselDotsClasses(dotPosition)}
            data-tiger-carousel-chrome=""
            aria-label={labels.navigationAriaLabel}>
            {slides.map((_, index) => {
              const selected = index === currentIndex
              return (
                <button
                  type="button"
                  key={index}
                  data-tiger-carousel-tab={index}
                  className={getCarouselDotClasses(selected)}
                  aria-label={labels.goToSlideAriaLabel.replace('{index}', String(index + 1))}
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => goTo(index)}>
                  <span className={getCarouselDotMarkClasses(selected)} />
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'
