import {
  defineComponent,
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  useId,
  PropType,
  h
} from 'vue'
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
  mergeStyleValues,
  mergeTigerLocale,
  prefersReducedMotion,
  resolveCarouselKeyboardNavigation,
  resolveCarouselLoopSnap,
  resolveCarouselRegion,
  resolveCarouselSwipeDirection,
  resolveCarouselTabKeyboardNavigation,
  shouldLoopCarousel,
  type CarouselAutoplayController,
  type CarouselDotPosition,
  type CarouselEffect,
  type CarouselMethods,
  type CarouselSwipeDirection,
  type CarouselTouchPoint,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

export interface CarouselProps {
  autoplay?: boolean
  autoplaySpeed?: number
  dots?: boolean
  dotPosition?: CarouselDotPosition
  effect?: CarouselEffect
  arrows?: boolean
  infinite?: boolean
  speed?: number
  currentIndex?: number
  defaultCurrentIndex?: number
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  className?: string
  style?: Record<string, string | number>
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleCarousel>
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
    const displayIndex = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    const viewportRef = ref<HTMLElement | null>(null)
    const requestedIndex = ref(
      props.currentIndex !== undefined ? props.currentIndex : props.defaultCurrentIndex
    )

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
    const dir = computed(() => config.value.direction)
    const reducedMotion = computed(() => prefersReducedMotion())
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
    const transitionDuration = computed(() =>
      snapPending.value || reducedMotion.value || props.speed <= 0 ? '0ms' : `${props.speed}ms`
    )

    displayIndex.value = getCarouselDisplayIndex(
      currentIndex.value,
      slideCount.value,
      looping.value
    )

    const goTo = (index: number, source: 'step' | 'goto' = 'goto') => {
      const count = slideCount.value
      const current = currentIndex.value
      const clampedIndex = clampSlideIndex(index, count)
      if (clampedIndex === current) return

      emit('before-change', current, clampedIndex)
      const loopingNow = looping.value
      const target =
        source === 'step'
          ? getCarouselLoopTarget(current, clampedIndex, count, loopingNow)
          : {
              displayIndex: getCarouselDisplayIndex(clampedIndex, count, loopingNow),
              logicalIndex: clampedIndex,
              needsSnap: false
            }
      wrapping.value = target.needsSnap
      snapPending.value = false
      displayIndex.value = target.displayIndex
      requestedIndex.value = clampedIndex
      if (!isControlled.value) {
        internalCurrentIndex.value = clampedIndex
      }
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
      try {
        viewportNode.setPointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerSession || pointerSession.id !== event.pointerId) return
      const point = getCarouselPointerPoint(event)
      if (!point) return
      pointerSession.current = point
      if (!pointerSession.locked && isCarouselHorizontalLock(pointerSession.start, point)) {
        pointerSession.locked = true
      }
      if (pointerSession.locked && event.cancelable) {
        event.preventDefault()
      }
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (!pointerSession || pointerSession.id !== event.pointerId) return
      const end = getCarouselPointerPoint(event) ?? pointerSession.current
      const direction = resolveCarouselSwipeDirection(pointerSession.start, end, {
        dir: dir.value
      })
      resetPointer()
      if (direction) navigateByDirection(direction)
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerSession?.id === event.pointerId) resetPointer()
    }

    watch(
      () => props.currentIndex,
      (value) => {
        if (value !== undefined) {
          internalCurrentIndex.value = value
          requestedIndex.value = value
          if (!wrapping.value) {
            displayIndex.value = getCarouselDisplayIndex(
              currentIndex.value,
              slideCount.value,
              looping.value
            )
          }
        }
      }
    )

    watch(slideCount, (count) => {
      const requested = isControlled.value ? (props.currentIndex as number) : requestedIndex.value
      const clamped = clampSlideIndex(requested, count)
      if (clamped !== requested) {
        requestedIndex.value = clamped
        goTo(clamped, 'goto')
      } else if (!wrapping.value) {
        displayIndex.value = getCarouselDisplayIndex(currentIndex.value, count, looping.value)
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

      const renderSlide = (
        slide: (typeof currentSlides)[number],
        logicalIndex: number,
        clone: boolean
      ) => {
        const active = !clone && logicalIndex === current
        const slideId = `${instanceId}-slide-${logicalIndex}`
        const hidden = !active
        return h(
          'div',
          {
            key: clone
              ? `clone-${logicalIndex}-${logicalIndex === 0 ? 'trailing' : 'leading'}`
              : slideId,
            id: clone ? undefined : slideId,
            class: getCarouselSlideClasses({ effect: props.effect, active }),
            style:
              props.effect === 'fade'
                ? { transitionDuration: transitionDuration.value }
                : undefined,
            role: 'group',
            'aria-roledescription': labels.value.slideRoleDescription,
            'aria-label': labels.value.slideAriaLabel
              .replace('{index}', String(logicalIndex + 1))
              .replace('{total}', String(count)),
            'aria-hidden': hidden ? true : undefined,
            inert: hidden ? true : undefined,
            'data-tiger-carousel-slide': clone ? 'clone' : active ? 'active' : 'inactive',
            ...(clone ? getCarouselCloneAttributes() : {})
          },
          slide
        )
      }

      const slideNodes = isLooping
        ? [
            renderSlide(currentSlides[count - 1], count - 1, true),
            ...currentSlides.map((slide, index) => renderSlide(slide, index, false)),
            renderSlide(currentSlides[0], 0, true)
          ]
        : currentSlides.map((slide, index) => renderSlide(slide, index, false))

      const handleTrackTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== event.currentTarget) return
        if (!wrapping.value) return
        const snap = resolveCarouselLoopSnap(displayIndex.value, count)
        if (snap === null) {
          wrapping.value = false
          return
        }
        wrapping.value = false
        snapPending.value = true
        displayIndex.value = snap
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
              { class: carouselTrackFadeClasses, 'data-tiger-carousel-track': '' },
              slideNodes
            )
          : h(
              'div',
              {
                class: carouselTrackScrollClasses,
                'data-tiger-carousel-track': '',
                style: {
                  transform: getScrollTransform(displayIndex.value, dir.value),
                  transitionDuration: transitionDuration.value
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
        const action = resolveCarouselKeyboardNavigation(event.key, dir.value)
        if (!action) return
        event.preventDefault()
        if (action === 'next') next()
        else if (action === 'prev') prev()
        else if (action === 'first') goTo(0, 'goto')
        else goTo(count - 1, 'goto')
      }

      const handleTablistKeyDown = (event: KeyboardEvent) => {
        const action = resolveCarouselTabKeyboardNavigation(
          event.key,
          getCarouselDotsOrientation(props.dotPosition),
          dir.value
        )
        if (!action) return
        event.preventDefault()
        event.stopPropagation()
        const nextIndex =
          action === 'next'
            ? getNextSlideIndex(current, count, true)
            : action === 'prev'
              ? getPrevSlideIndex(current, count, true)
              : action === 'first'
                ? 0
                : count - 1
        goTo(nextIndex, 'goto')
        nextTick(() => {
          const tab = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>(
            `[data-tiger-carousel-tab="${nextIndex}"]`
          )
          tab?.focus()
        })
      }

      return h(
        'div',
        {
          ...attrs,
          ref: containerRef,
          class: composeComponentClasses(
            getCarouselContainerClasses(props.className),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'data-tiger-carousel': '',
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
              class: carouselViewportClasses,
              'data-tiger-carousel-viewport': '',
              tabindex: count > 1 ? 0 : undefined
            },
            track
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
          props.dots && count > 1
            ? h(
                'div',
                {
                  class: getCarouselDotsClasses(props.dotPosition),
                  'data-tiger-carousel-chrome': '',
                  role: 'tablist',
                  'aria-label': labels.value.navigationAriaLabel,
                  'aria-orientation': getCarouselDotsOrientation(props.dotPosition),
                  onKeydown: handleTablistKeyDown
                },
                currentSlides.map((_, index) => {
                  const selected = index === current
                  return h(
                    'button',
                    {
                      type: 'button',
                      key: index,
                      id: `${instanceId}-tab-${index}`,
                      role: 'tab',
                      'data-tiger-carousel-tab': index,
                      class: getCarouselDotClasses(selected),
                      'aria-label': labels.value.goToSlideAriaLabel.replace(
                        '{index}',
                        String(index + 1)
                      ),
                      'aria-selected': selected ? 'true' : 'false',
                      'aria-controls': `${instanceId}-slide-${index}`,
                      tabindex: selected ? 0 : -1,
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
