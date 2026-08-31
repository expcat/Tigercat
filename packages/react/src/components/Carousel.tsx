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
  carouselTrackScrollClasses,
  carouselViewportClasses,
  carouselNextArrowPath,
  carouselPrevArrowPath,
  clampSlideIndex,
  composeComponentClasses,
  createCarouselAutoplayController,
  getCarouselArrowClasses,
  getCarouselCloneAttributes,
  getCarouselContainerClasses,
  getCarouselDisplayIndex,
  getCarouselDotClasses,
  getCarouselDotMarkClasses,
  getCarouselDotsClasses,
  getCarouselDotsOrientation,
  getCarouselLabels,
  getCarouselLoopTarget,
  getCarouselPointerPoint,
  getCarouselSlideClasses,
  getNextSlideIndex,
  getPrevSlideIndex,
  getScrollTransform,
  isCarouselAutoplayEnabled,
  isCarouselChromeTarget,
  isCarouselFocusInside,
  isCarouselHorizontalLock,
  isCarouselKeyboardIgnoredTarget,
  isCarouselPaused,
  isNextDisabled,
  isPrevDisabled,
  mergeTigerLocale,
  prefersReducedMotion,
  resolveCarouselKeyboardNavigation,
  resolveCarouselLoopSnap,
  resolveCarouselRegion,
  resolveCarouselSwipeDirection,
  resolveCarouselTabKeyboardNavigation,
  shouldLoopCarousel,
  type CarouselMethods,
  type CarouselProps as CoreCarouselProps,
  type CarouselSwipeDirection,
  type CarouselTouchPoint,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

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
      children,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
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
    const dir = config.direction
    const reducedMotion = prefersReducedMotion()
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
    const [displayIndex, setDisplayIndex] = useState(() =>
      getCarouselDisplayIndex(currentIndex, slideCount, looping)
    )
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
    const wrappingRef = useRef(false)
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
    const infiniteRef = useRef(infinite)
    infiniteRef.current = infinite
    const effectRef = useRef(effect)
    effectRef.current = effect
    const slideCountRef = useRef(slideCount)
    slideCountRef.current = slideCount
    const dirRef = useRef(dir)
    dirRef.current = dir

    const navigateToIndex = useCallback(
      (index: number, source: 'step' | 'goto' = 'goto') => {
        const count = slideCountRef.current
        const current = currentIndexRef.current
        const clampedIndex = clampSlideIndex(index, count)
        if (clampedIndex === current) return

        onBeforeChangeRef.current?.(current, clampedIndex)
        const loopingNow = shouldLoopCarousel(infiniteRef.current, count, effectRef.current)
        const target =
          source === 'step'
            ? getCarouselLoopTarget(current, clampedIndex, count, loopingNow)
            : {
                displayIndex: getCarouselDisplayIndex(clampedIndex, count, loopingNow),
                logicalIndex: clampedIndex,
                needsSnap: false
              }
        wrappingRef.current = target.needsSnap
        setSnapPending(false)
        setDisplayIndex(target.displayIndex)
        requestedIndexRef.current = clampedIndex
        setCurrentIndexValue(clampedIndex)
        onChangeRef.current?.(clampedIndex, current)
      },
      [setCurrentIndexValue]
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
      if (wrappingRef.current) return
      const nextDisplay = getCarouselDisplayIndex(currentIndex, slideCount, looping)
      setDisplayIndex((prevDisplay) => (prevDisplay === nextDisplay ? prevDisplay : nextDisplay))
    }, [currentIndex, slideCount, looping])

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
        try {
          viewport.setPointerCapture(event.pointerId)
        } catch {
          /* happy-dom and some SVG targets omit capture */
        }
      }

      const handlePointerMove = (event: PointerEvent) => {
        const session = pointerRef.current
        if (!session || session.id !== event.pointerId) return
        const point = getCarouselPointerPoint(event)
        if (!point) return
        session.current = point
        if (!session.locked && isCarouselHorizontalLock(session.start, point)) {
          session.locked = true
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
          dir: dirRef.current
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
      const snap = resolveCarouselLoopSnap(displayIndex, slideCount)
      if (snap === null) {
        wrappingRef.current = false
        return
      }
      wrappingRef.current = false
      setSnapPending(true)
      setDisplayIndex(snap)
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
      const action = resolveCarouselKeyboardNavigation(event.key, dir)
      if (!action) return
      event.preventDefault()
      if (action === 'next') next()
      else if (action === 'prev') prev()
      else if (action === 'first') goTo(0)
      else goTo(slideCount - 1)
    }

    const handleTablistKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const action = resolveCarouselTabKeyboardNavigation(
        event.key,
        getCarouselDotsOrientation(dotPosition),
        dir
      )
      if (!action) return
      event.preventDefault()
      event.stopPropagation()
      const nextIndex =
        action === 'next'
          ? getNextSlideIndex(currentIndex, slideCount, true)
          : action === 'prev'
            ? getPrevSlideIndex(currentIndex, slideCount, true)
            : action === 'first'
              ? 0
              : slideCount - 1
      goTo(nextIndex)
      const tab = event.currentTarget.querySelector<HTMLElement>(
        `[data-tiger-carousel-tab="${nextIndex}"]`
      )
      tab?.focus()
    }

    const isPrevArrowDisabled = isPrevDisabled(currentIndex, slideCount, infinite)
    const isNextArrowDisabled = isNextDisabled(currentIndex, slideCount, infinite)
    const transitionDuration = snapPending || reducedMotion || speed <= 0 ? '0ms' : `${speed}ms`

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

    const renderSlide = (slide: React.ReactNode, logicalIndex: number, clone: boolean) => {
      const active = !clone && logicalIndex === currentIndex
      const slideId = `${instanceId}-slide-${logicalIndex}`
      const hidden = !active
      return (
        <div
          key={
            clone ? `clone-${logicalIndex}-${logicalIndex === 0 ? 'trailing' : 'leading'}` : slideId
          }
          id={clone ? undefined : slideId}
          className={getCarouselSlideClasses({ effect, active })}
          style={effect === 'fade' ? { transitionDuration } : undefined}
          role="group"
          aria-roledescription={labels.slideRoleDescription}
          aria-label={labels.slideAriaLabel
            .replace('{index}', String(logicalIndex + 1))
            .replace('{total}', String(slideCount))}
          aria-hidden={hidden || undefined}
          inert={hidden || undefined}
          data-tiger-carousel-slide={clone ? 'clone' : active ? 'active' : 'inactive'}
          {...(clone ? getCarouselCloneAttributes() : {})}>
          {slide}
        </div>
      )
    }

    const slideNodes = looping
      ? [
          renderSlide(slides[slideCount - 1], slideCount - 1, true),
          ...slides.map((slide, index) => renderSlide(slide, index, false)),
          renderSlide(slides[0], 0, true)
        ]
      : slides.map((slide, index) => renderSlide(slide, index, false))

    const track =
      effect === 'fade' ? (
        <div className={carouselTrackFadeClasses} data-tiger-carousel-track="">
          {slideNodes}
        </div>
      ) : (
        <div
          className={carouselTrackScrollClasses}
          data-tiger-carousel-track=""
          style={{
            transform: getScrollTransform(displayIndex, dir),
            transitionDuration
          }}
          onTransitionEnd={handleTrackTransitionEnd}>
          {slideNodes}
        </div>
      )

    return (
      <div
        {...domProps}
        ref={containerRef}
        className={composeComponentClasses(getCarouselContainerClasses(className))}
        style={style}
        data-tiger-carousel=""
        role={region.role}
        aria-roledescription={labels.roleDescription}
        aria-label={region.ariaLabel}
        aria-labelledby={typeof ariaLabelledByAttr === 'string' ? ariaLabelledByAttr : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleRootKeyDown}>
        <div
          ref={viewportRef}
          className={carouselViewportClasses}
          data-tiger-carousel-viewport=""
          tabIndex={slideCount > 1 ? 0 : undefined}>
          {track}
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
        {dots && slideCount > 1 ? (
          <div
            className={getCarouselDotsClasses(dotPosition)}
            data-tiger-carousel-chrome=""
            role="tablist"
            aria-label={labels.navigationAriaLabel}
            aria-orientation={getCarouselDotsOrientation(dotPosition)}
            onKeyDown={handleTablistKeyDown}>
            {slides.map((_, index) => {
              const selected = index === currentIndex
              return (
                <button
                  type="button"
                  key={index}
                  id={`${instanceId}-tab-${index}`}
                  role="tab"
                  data-tiger-carousel-tab={index}
                  className={getCarouselDotClasses(selected)}
                  aria-label={labels.goToSlideAriaLabel.replace('{index}', String(index + 1))}
                  aria-selected={selected}
                  aria-controls={`${instanceId}-slide-${index}`}
                  tabIndex={selected ? 0 : -1}
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
