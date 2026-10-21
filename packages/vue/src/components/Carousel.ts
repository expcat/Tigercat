import {
  defineComponent,
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  useId,
  PropType,
  h
} from 'vue'
import {
  carouselPauseButtonClasses,
  carouselTrackFadeClasses,
  carouselTrackInstantClasses,
  carouselNextArrowPath,
  carouselPrevArrowPath,
  clampSlideIndex,
  classNames,
  coerceClassValue,
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
  isCarouselAutoplayEnabled,
  isCarouselAxisLock,
  isCarouselChromeTarget,
  isCarouselFocusInside,
  isCarouselKeyboardIgnoredTarget,
  isCarouselPaused,
  isCarouselSlideVisible,
  isNextDisabled,
  isPrevDisabled,
  mergeStyleValues,
  mergeTigerLocale,
  prefersReducedMotion,
  subscribePrefersReducedMotion,
  carouselStatusClasses,
  formatCarouselSlideStatus,
  resolveCarouselKeyboardNavigation,
  resolveCarouselRegion,
  resolveCarouselRootDir,
  resolveCarouselSlideOrder,
  resolveCarouselSwipeDirection,
  resolveCarouselWindowTransition,
  shouldLoopCarousel,
  type CarouselAutoplayController,
  type CarouselDotPosition,
  type CarouselEffect,
  type CarouselMethods,
  type CarouselProps as CoreCarouselProps,
  type CarouselSwipeDirection,
  type CarouselTouchPoint,
  type CarouselWindowTransition,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './tiger-config'

export interface CarouselProps extends CoreCarouselProps {
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleCarousel>
  thumbnails?: boolean
}

export type VueCarouselProps = CarouselProps
export type { CarouselMethods }

function invokeListener(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    handler(event)
    return
  }
  if (Array.isArray(handler)) {
    for (const fn of handler) {
      if (typeof fn === 'function') fn(event)
    }
  }
}

export const Carousel = defineComponent({
  name: 'TigerCarousel',
  inheritAttrs: false,
  props: {
    autoplay: {
      type: Boolean,
      default: false
    },
    autoplaySpeed: {
      type: Number,
      default: 3000
    },
    dots: {
      type: Boolean,
      default: true
    },
    axis: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    slidesPerView: {
      type: Number,
      default: 1
    },
    thumbnails: {
      type: Boolean,
      default: false
    },
    dotPosition: {
      type: String as PropType<CarouselDotPosition>,
      default: 'bottom' as CarouselDotPosition
    },
    effect: {
      type: String as PropType<CarouselEffect>,
      default: 'scroll' as CarouselEffect
    },
    arrows: {
      type: Boolean,
      default: false
    },
    infinite: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 500
    },
    currentIndex: {
      type: Number,
      default: undefined
    },
    defaultCurrentIndex: {
      type: Number,
      default: 0
    },
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    pauseOnFocus: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleCarousel>>,
      default: undefined
    }
  },
  emits: ['change', 'before-change', 'update:currentIndex'],
  setup(props, { slots, emit, attrs, expose }) {
    const config = useTigerConfig()
    const instanceId = useId()
    const internalCurrentIndex = ref(props.defaultCurrentIndex)
    const hovered = ref(false)
    const focused = ref(false)
    const userPaused = ref(false)
    const snapPending = ref(false)
    const wrapping = ref(false)
    // Rotation base of the cyclic window and the animated offset in slide
    // slots. Steady state is always baseIndex === windowStart, trackOffset 0.
    const baseIndex = ref(0)
    const trackOffset = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    const viewportRef = ref<HTMLElement | null>(null)
    const trackRef = ref<HTMLElement | null>(null)
    const requestedIndex = ref(
      props.currentIndex !== undefined ? props.currentIndex : props.defaultCurrentIndex
    )
    let pendingTransition: CarouselWindowTransition | null = null

    let autoplayController: CarouselAutoplayController | null = null
    let pointerSession: {
      id: number
      start: CarouselTouchPoint
      current: CarouselTouchPoint
      locked: boolean
    } | null = null
    let viewportNode: HTMLElement | null = null

    const slides = computed(() => flattenElementVNodes(slots.default?.()))
    const slideCount = computed(() => slides.value.length)
    const isControlled = computed(() => props.currentIndex !== undefined)
    const currentIndex = computed(() =>
      clampSlideIndex(
        isControlled.value ? (props.currentIndex as number) : internalCurrentIndex.value,
        slideCount.value
      )
    )
    const looping = computed(() =>
      shouldLoopCarousel(props.infinite, slideCount.value, props.effect)
    )
    const perView = computed(() => getCarouselSlidesPerView(props.slidesPerView, slideCount.value))
    // An explicit root dir attribute wins over the provider direction so the
    // DOM, transforms, keyboard, and gestures read one direction.
    const dir = computed(() => resolveCarouselRootDir(attrs.dir, config.value.direction))
    const windowStart = computed(() =>
      getCarouselWindowStart(currentIndex.value, slideCount.value, perView.value, looping.value)
    )
    const reducedMotion = ref(false)
    let stopMotion: (() => void) | undefined
    onMounted(() => {
      reducedMotion.value = prefersReducedMotion()
      stopMotion = subscribePrefersReducedMotion((value) => {
        reducedMotion.value = value
      })
    })
    const autoplayEnabled = computed(() =>
      isCarouselAutoplayEnabled(props.autoplay, props.autoplaySpeed, reducedMotion.value)
    )
    const paused = computed(() =>
      isCarouselPaused({
        userPaused: userPaused.value,
        pauseOnHover: props.pauseOnHover,
        pauseOnFocus: props.pauseOnFocus,
        hovered: hovered.value,
        focused: focused.value
      })
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCarouselLabels(mergedLocale.value, props.labels))
    const carouselDuration = computed(() =>
      snapPending.value || props.speed <= 0 ? '0ms' : `${props.speed}ms`
    )
    const trackInstant = computed(() => snapPending.value || props.speed <= 0)
    // Reduced motion forces a 0ms duration through the shared CSS rule, so a
    // wrap must not wait for a transitionend that never fires.
    const effectiveDuration = computed(() =>
      props.speed <= 0 || reducedMotion.value ? 0 : props.speed
    )

    const applyWindowPlan = (plan: CarouselWindowTransition) => {
      pendingTransition = null
      if (plan.fromOffset === plan.toOffset || effectiveDuration.value === 0) {
        wrapping.value = false
        snapPending.value = false
        baseIndex.value = plan.windowStart
        trackOffset.value = 0
        return
      }
      wrapping.value = true
      pendingTransition = plan
      if (plan.normalizeAfter) {
        snapPending.value = false
        baseIndex.value = plan.base
        trackOffset.value = plan.toOffset
        return
      }
      snapPending.value = true
      baseIndex.value = plan.base
      trackOffset.value = plan.fromOffset
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pendingTransition !== plan) return
          snapPending.value = false
          trackOffset.value = plan.toOffset
        })
      })
    }

    // Re-plan the window from the live track state. An in-flight plan already
    // heading to the same window absorbs the input; otherwise the rendered
    // offset is sampled so the next plan resumes from the visible position.
    const syncWindow = (to: number, source: 'step' | 'goto', from: number) => {
      const count = slideCount.value
      const target = getCarouselWindowStart(to, count, perView.value, looping.value)
      if (wrapping.value) {
        if (pendingTransition?.windowStart === target) return
      } else if (baseIndex.value === target && trackOffset.value === 0) return
      applyWindowPlan(
        resolveCarouselWindowTransition({
          from,
          to,
          count,
          perView: perView.value,
          looping: looping.value,
          source,
          start: {
            base: baseIndex.value,
            offset: wrapping.value
              ? getCarouselTrackRenderedOffset(trackRef.value, props.axis, perView.value, dir.value)
              : 0
          }
        })
      )
    }

    baseIndex.value = windowStart.value

    const goTo = (index: number, source: 'step' | 'goto' = 'goto') => {
      const count = slideCount.value
      const current = currentIndex.value
      const clampedIndex = clampSlideIndex(index, count)
      if (clampedIndex === current) return

      emit('before-change', current, clampedIndex)
      // Controlled carousels re-plan from the prop watcher once the parent
      // accepts the requested index.
      if (!isControlled.value) {
        syncWindow(clampedIndex, source, current)
        internalCurrentIndex.value = clampedIndex
      }
      requestedIndex.value = clampedIndex
      emit('update:currentIndex', clampedIndex)
      emit('change', clampedIndex, current)
    }

    const next = () => {
      goTo(getNextSlideIndex(currentIndex.value, slideCount.value, props.infinite), 'step')
    }

    const prev = () => {
      goTo(getPrevSlideIndex(currentIndex.value, slideCount.value, props.infinite), 'step')
    }

    const navigateByDirection = (direction: CarouselSwipeDirection) => {
      if (direction === 'next') next()
      else prev()
    }

    const startAutoplay = () => {
      if (!autoplayEnabled.value || paused.value || autoplayController) return
      autoplayController = createCarouselAutoplayController({
        interval: props.autoplaySpeed,
        onAdvance: next
      })
      autoplayController.start()
    }

    const stopAutoplay = () => {
      autoplayController?.stop()
      autoplayController = null
    }

    const syncAutoplay = () => {
      stopAutoplay()
      startAutoplay()
    }

    const resetPointer = () => {
      pointerSession = null
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || slideCount.value <= 1) return
      if (isCarouselChromeTarget(event.target)) return
      const point = getCarouselPointerPoint(event)
      if (!point || !viewportNode) return
      pointerSession = {
        id: event.pointerId,
        start: point,
        current: point,
        locked: false
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerSession || pointerSession.id !== event.pointerId) return
      const point = getCarouselPointerPoint(event)
      if (!point) return
      pointerSession.current = point
      if (!pointerSession.locked && isCarouselAxisLock(pointerSession.start, point, props.axis)) {
        pointerSession.locked = true
        // Capture only once the gesture is a drag so plain clicks on slide
        // content keep their native target.
        try {
          viewportNode?.setPointerCapture(event.pointerId)
        } catch {
          /* ignore */
        }
      }
      if (pointerSession.locked && event.cancelable) {
        event.preventDefault()
      }
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (!pointerSession || pointerSession.id !== event.pointerId) return
      const end = getCarouselPointerPoint(event) ?? pointerSession.current
      const direction = resolveCarouselSwipeDirection(pointerSession.start, end, {
        dir: dir.value,
        axis: props.axis
      })
      resetPointer()
      if (direction) navigateByDirection(direction)
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerSession?.id === event.pointerId) resetPointer()
    }

    watch(
      () => props.currentIndex,
      (value, oldValue) => {
        if (value === undefined) return
        internalCurrentIndex.value = value
        requestedIndex.value = value
        syncWindow(value, 'goto', clampSlideIndex(oldValue ?? value, slideCount.value))
      }
    )

    // Layout input changes re-clamp the window so the current page stays
    // inside the visible span instead of leaking a stale rotation.
    watch([perView, looping], () => {
      syncWindow(currentIndex.value, 'goto', currentIndex.value)
    })

    // A reduced-motion switch or a zero speed does not cancel an already
    // running CSS transition; settle the pending plan through the instant
    // path so the current page becomes visible immediately.
    watch(effectiveDuration, (duration) => {
      if (duration !== 0 || !pendingTransition) return
      applyWindowPlan(pendingTransition)
    })

    watch(slideCount, (count) => {
      const requested = isControlled.value ? (props.currentIndex as number) : requestedIndex.value
      const clamped = clampSlideIndex(requested, count)
      if (clamped !== requested) {
        requestedIndex.value = clamped
        goTo(clamped, 'goto')
      } else if (!wrapping.value) {
        baseIndex.value = getCarouselWindowStart(
          currentIndex.value,
          count,
          perView.value,
          looping.value
        )
        trackOffset.value = 0
      }
    })

    watch([autoplayEnabled, () => props.autoplaySpeed, paused], syncAutoplay)

    onMounted(() => {
      viewportNode = viewportRef.value
      if (viewportNode) {
        viewportNode.addEventListener('pointerdown', handlePointerDown)
        viewportNode.addEventListener('pointermove', handlePointerMove, { passive: false })
        viewportNode.addEventListener('pointerup', handlePointerEnd)
        viewportNode.addEventListener('pointercancel', handlePointerCancel)
      }
      if (autoplayEnabled.value) startAutoplay()
    })

    onUnmounted(() => {
      stopMotion?.()
      stopAutoplay()
      resetPointer()
      viewportNode?.removeEventListener('pointerdown', handlePointerDown)
      viewportNode?.removeEventListener('pointermove', handlePointerMove)
      viewportNode?.removeEventListener('pointerup', handlePointerEnd)
      viewportNode?.removeEventListener('pointercancel', handlePointerCancel)
      viewportNode = null
    })

    expose({
      next,
      prev,
      goTo: (index: number) => goTo(index, 'goto')
    } satisfies CarouselMethods)

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const attrAriaLabel =
        typeof attrsRecord['aria-label'] === 'string' ? attrsRecord['aria-label'] : undefined
      const attrLabelledBy =
        typeof attrsRecord['aria-labelledby'] === 'string'
          ? attrsRecord['aria-labelledby']
          : undefined
      const region = resolveCarouselRegion({
        ariaLabel: attrAriaLabel ?? props.labels?.ariaLabel,
        labelledBy: attrLabelledBy
      })
      const currentSlides = slides.value
      const count = currentSlides.length
      const current = currentIndex.value
      const isLooping = looping.value

      const renderArrowButton = (
        type: 'prev' | 'next',
        disabled: boolean,
        onClick: () => void,
        path: string
      ) =>
        h(
          'button',
          {
            type: 'button',
            'data-tiger-carousel-chrome': '',
            class: getCarouselArrowClasses(type, disabled),
            onClick,
            disabled,
            'aria-label':
              type === 'prev'
                ? labels.value.previousSlideAriaLabel
                : labels.value.nextSlideAriaLabel
          },
          h(
            'svg',
            {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              class: 'w-6 h-6',
              'aria-hidden': 'true',
              focusable: 'false'
            },
            h('path', { d: path })
          )
        )

      const renderSlide = (slide: (typeof currentSlides)[number], logicalIndex: number) => {
        const active = logicalIndex === current
        const slideId = `${instanceId}-slide-${logicalIndex}`
        const visible =
          props.effect === 'fade'
            ? active
            : isCarouselSlideVisible(
                logicalIndex,
                windowStart.value,
                count,
                perView.value,
                isLooping
              )
        const hidden = !visible
        return h(
          'div',
          {
            key: slideId,
            id: slideId,
            class: getCarouselSlideClasses({ effect: props.effect, active }),
            style:
              props.effect === 'fade'
                ? { '--tiger-carousel-duration': carouselDuration.value }
                : getCarouselSlideSizeStyle(props.axis, perView.value),
            role: 'group',
            'aria-roledescription': labels.value.slideRoleDescription,
            'aria-label': labels.value.slideAriaLabel
              .replace('{index}', String(logicalIndex + 1))
              .replace('{total}', String(count)),
            'aria-hidden': hidden ? true : undefined,
            inert: hidden ? true : undefined,
            'data-tiger-carousel-slide': active ? 'active' : 'inactive'
          },
          slide
        )
      }

      // Real slides render in cyclic display order so DOM reading and tab
      // order match the visible window; keyed moves keep one component
      // instance per slide across wraps.
      const slideNodes =
        props.effect === 'fade'
          ? currentSlides.map((slide, index) => renderSlide(slide, index))
          : resolveCarouselSlideOrder(count, baseIndex.value).map((index) =>
              renderSlide(currentSlides[index], index)
            )

      const handleTrackTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== event.currentTarget) return
        if (!wrapping.value) return
        wrapping.value = false
        const plan = pendingTransition
        pendingTransition = null
        if (!plan || !plan.normalizeAfter) return
        snapPending.value = true
        baseIndex.value = plan.windowStart
        trackOffset.value = 0
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            snapPending.value = false
          })
        })
      }

      const track =
        props.effect === 'fade'
          ? h(
              'div',
              {
                class: classNames(
                  carouselTrackFadeClasses,
                  trackInstant.value ? carouselTrackInstantClasses : ''
                ),
                'data-tiger-carousel-track': ''
              },
              slideNodes
            )
          : h(
              'div',
              {
                ref: trackRef,
                class: classNames(
                  getCarouselTrackScrollClasses(props.axis),
                  trackInstant.value ? carouselTrackInstantClasses : ''
                ),
                'data-tiger-carousel-track': '',
                style: {
                  transform: getCarouselAxisTransform(
                    trackOffset.value,
                    props.axis,
                    perView.value,
                    dir.value
                  ),
                  '--tiger-carousel-duration': carouselDuration.value
                },
                onTransitionend: handleTrackTransitionEnd
              },
              slideNodes
            )

      const handleRootKeyDown = (event: KeyboardEvent) => {
        invokeListener(attrsRecord.onKeydown, event)
        if (event.defaultPrevented || count <= 1) return
        if (isCarouselKeyboardIgnoredTarget(event.target)) return
        if ((event.target as Element | null)?.closest?.('[role="tablist"]')) return
        const action = resolveCarouselKeyboardNavigation(event.key, dir.value, props.axis)
        if (!action) return
        event.preventDefault()
        if (action === 'next') next()
        else if (action === 'prev') prev()
        else if (action === 'first') goTo(0, 'goto')
        else goTo(count - 1, 'goto')
      }

      return h(
        'div',
        {
          ...attrs,
          ref: containerRef,
          class: classNames(
            getCarouselContainerClasses(props.className),
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-tiger-carousel': '',
          'data-axis': props.axis,
          'data-slides-per-view': String(getCarouselSlidesPerView(props.slidesPerView, count)),
          role: region.role,
          'aria-roledescription': labels.value.roleDescription,
          'aria-label': region.ariaLabel,
          onMouseenter: (event: MouseEvent) => {
            if (props.pauseOnHover && autoplayEnabled.value) hovered.value = true
            invokeListener(attrsRecord.onMouseenter, event)
          },
          onMouseleave: (event: MouseEvent) => {
            if (props.pauseOnHover && autoplayEnabled.value) hovered.value = false
            invokeListener(attrsRecord.onMouseleave, event)
          },
          onFocusin: (event: FocusEvent) => {
            if (props.pauseOnFocus && autoplayEnabled.value) focused.value = true
            invokeListener(attrsRecord.onFocusin, event)
          },
          onFocusout: (event: FocusEvent) => {
            if (
              props.pauseOnFocus &&
              autoplayEnabled.value &&
              !isCarouselFocusInside(event.currentTarget, event.relatedTarget)
            ) {
              focused.value = false
            }
            invokeListener(attrsRecord.onFocusout, event)
          },
          onKeydown: handleRootKeyDown
        },
        [
          h(
            'div',
            {
              ref: viewportRef,
              class: getCarouselViewportClasses(props.axis),
              'data-tiger-carousel-viewport': ''
            },
            track
          ),
          h(
            'div',
            {
              class: carouselStatusClasses,
              role: 'status',
              'aria-live': 'polite'
            },
            formatCarouselSlideStatus(labels.value.slideAriaLabel, current, count)
          ),
          autoplayEnabled.value
            ? h(
                'button',
                {
                  type: 'button',
                  'data-tiger-carousel-chrome': '',
                  class: carouselPauseButtonClasses,
                  'aria-label': userPaused.value
                    ? labels.value.playAriaLabel
                    : labels.value.pauseAriaLabel,
                  'aria-pressed': userPaused.value,
                  onClick: () => {
                    userPaused.value = !userPaused.value
                  }
                },
                userPaused.value ? labels.value.playAriaLabel : labels.value.pauseAriaLabel
              )
            : null,
          props.arrows
            ? renderArrowButton(
                'prev',
                isPrevDisabled(current, count, props.infinite),
                prev,
                carouselPrevArrowPath
              )
            : null,
          props.arrows
            ? renderArrowButton(
                'next',
                isNextDisabled(current, count, props.infinite),
                next,
                carouselNextArrowPath
              )
            : null,
          props.thumbnails && count > 1
            ? h(
                'div',
                { 'data-tiger-carousel-thumbs': '' },
                currentSlides.map((_, index) =>
                  h(
                    'button',
                    {
                      type: 'button',
                      'data-tiger-carousel-thumb': index,
                      'aria-current': index === current ? 'true' : undefined,
                      onClick: () => goTo(index)
                    },
                    String(index + 1)
                  )
                )
              )
            : null,
          props.dots && count > 1
            ? h(
                'div',
                {
                  class: getCarouselDotsClasses(props.dotPosition),
                  'data-tiger-carousel-chrome': '',
                  'aria-label': labels.value.navigationAriaLabel
                },
                currentSlides.map((_, index) => {
                  const selected = index === current
                  return h(
                    'button',
                    {
                      type: 'button',
                      key: index,
                      'data-tiger-carousel-tab': index,
                      class: getCarouselDotClasses(selected),
                      'aria-label': labels.value.goToSlideAriaLabel.replace(
                        '{index}',
                        String(index + 1)
                      ),
                      'aria-current': selected ? 'true' : undefined,
                      onClick: () => goTo(index, 'goto')
                    },
                    h('span', { class: getCarouselDotMarkClasses(selected) })
                  )
                })
              )
            : null
        ]
      )
    }
  }
})

export default Carousel
