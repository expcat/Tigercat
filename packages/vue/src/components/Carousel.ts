import {
  defineComponent,
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
  PropType,
  h,
  Comment,
  Fragment,
  type VNode
} from 'vue'
import {
  classNames,
  coerceClassValue,
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
  type CarouselDotPosition,
  type CarouselEffect,
  type CarouselAutoplayController,
  type TigerLocale,
  type TigerLocaleCarousel
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueCarouselProps {
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

export const Carousel = defineComponent({
  name: 'TigerCarousel',
  props: {
    /**
     * Whether to enable automatic slide switching
     * @default false
     */
    autoplay: {
      type: Boolean,
      default: false
    },
    /**
     * Time interval for auto-play in milliseconds
     * @default 3000
     */
    autoplaySpeed: {
      type: Number,
      default: 3000
    },
    /**
     * Whether to show navigation dots
     * @default true
     */
    dots: {
      type: Boolean,
      default: true
    },
    /**
     * Position of navigation dots
     * @default 'bottom'
     */
    dotPosition: {
      type: String as PropType<CarouselDotPosition>,
      default: 'bottom' as CarouselDotPosition
    },
    /**
     * Transition effect type
     * @default 'scroll'
     */
    effect: {
      type: String as PropType<CarouselEffect>,
      default: 'scroll' as CarouselEffect
    },
    /**
     * Whether to show prev/next arrows
     * @default false
     */
    arrows: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to enable infinite loop
     * @default true
     */
    infinite: {
      type: Boolean,
      default: true
    },
    /**
     * Transition animation duration in milliseconds
     * @default 500
     */
    speed: {
      type: Number,
      default: 500
    },
    /**
     * Controlled current slide index (0-based)
     */
    currentIndex: {
      type: Number,
      default: undefined
    },
    /**
     * Initial current slide index for uncontrolled usage
     * @default 0
     */
    defaultCurrentIndex: {
      type: Number,
      default: 0
    },
    /**
     * Whether to pause autoplay on hover
     * @default true
     */
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    /**
     * Whether to pause autoplay on focus
     * @default true
     */
    pauseOnFocus: {
      type: Boolean,
      default: true
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Custom styles
     */
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
    const internalCurrentIndex = ref(props.defaultCurrentIndex)
    const isPaused = ref(false)
    const slideCount = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    let autoplayController: CarouselAutoplayController | null = null
    let touchStartPoint: CarouselTouchPoint | null = null
    let touchCurrentPoint: CarouselTouchPoint | null = null

    const isControlled = computed(() => props.currentIndex !== undefined)
    const currentIndex = computed(() =>
      clampSlideIndex(
        isControlled.value ? (props.currentIndex as number) : internalCurrentIndex.value,
        slideCount.value
      )
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getCarouselLabels(mergedLocale.value, props.labels))

    // Container classes
    const containerClasses = computed(() => {
      return classNames(getCarouselContainerClasses(props.className), coerceClassValue(attrs.class))
    })

    // Track classes
    const trackClasses = computed(() => {
      if (props.effect === 'fade') {
        return carouselTrackFadeClasses
      }
      return carouselTrackScrollClasses
    })

    // Track style for scroll effect
    const trackStyle = computed(() => {
      if (props.effect === 'scroll') {
        return {
          transform: getScrollTransform(currentIndex.value),
          transitionDuration: `${props.speed}ms`
        }
      }
      return {}
    })

    // Get slide classes
    const getSlideClasses = (index: number) => {
      const isActive = index === currentIndex.value
      if (props.effect === 'fade') {
        // First slide uses relative to establish container height, others are absolute
        const positionClass = index === 0 ? 'relative' : 'absolute inset-0'
        return classNames(
          positionClass,
          'w-full transition-opacity ease-in-out',
          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
        )
      }
      return carouselSlideBaseClasses
    }

    // Slide style for fade effect
    const slideStyle = computed(() => ({
      transitionDuration: `${props.speed}ms`
    }))

    // Dots classes
    const dotsClasses = computed(() => {
      return getCarouselDotsClasses(props.dotPosition)
    })

    // Navigation methods
    const next = () => {
      const nextIdx = getNextSlideIndex(currentIndex.value, slideCount.value, props.infinite)
      if (nextIdx !== currentIndex.value) {
        goTo(nextIdx)
      }
    }

    const prev = () => {
      const prevIdx = getPrevSlideIndex(currentIndex.value, slideCount.value, props.infinite)
      if (prevIdx !== currentIndex.value) {
        goTo(prevIdx)
      }
    }

    const goTo = (index: number) => {
      const clampedIndex = clampSlideIndex(index, slideCount.value)
      if (clampedIndex === currentIndex.value) {
        return
      }

      emit('before-change', currentIndex.value, clampedIndex)
      const prevIndex = currentIndex.value
      if (!isControlled.value) {
        internalCurrentIndex.value = clampedIndex
      }
      emit('update:currentIndex', clampedIndex)
      emit('change', clampedIndex, prevIndex)
    }

    // Autoplay control
    const startAutoplay = () => {
      if (!props.autoplay || isPaused.value || autoplayController) return
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

    const resetTouchGesture = () => {
      touchStartPoint = null
      touchCurrentPoint = null
    }

    const handleTouchStart = (event: TouchEvent) => {
      const point = getCarouselTouchPoint(event.touches)
      touchStartPoint = point
      touchCurrentPoint = point
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStartPoint) return

      const point = getCarouselTouchPoint(event.touches)
      if (point) {
        touchCurrentPoint = point
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      const direction = resolveCarouselSwipeDirection(
        touchStartPoint,
        getCarouselTouchPoint(event.changedTouches) ?? touchCurrentPoint
      )

      resetTouchGesture()

      if (direction === 'next') {
        next()
      } else if (direction === 'prev') {
        prev()
      }
    }

    const handleTouchCancel = () => {
      resetTouchGesture()
    }

    // Pause/Resume handlers
    const handleMouseEnter = () => {
      if (props.pauseOnHover && props.autoplay) {
        isPaused.value = true
      }
    }

    const handleMouseLeave = () => {
      if (props.pauseOnHover && props.autoplay) {
        isPaused.value = false
      }
    }

    const handleFocus = () => {
      if (props.pauseOnFocus && props.autoplay) {
        isPaused.value = true
      }
    }

    const handleBlur = () => {
      if (props.pauseOnFocus && props.autoplay) {
        isPaused.value = false
      }
    }

    // Arrow disabled state
    const isPrevArrowDisabled = computed(() =>
      isPrevDisabled(currentIndex.value, slideCount.value, props.infinite)
    )

    const isNextArrowDisabled = computed(() =>
      isNextDisabled(currentIndex.value, slideCount.value, props.infinite)
    )

    // Watch for autoplay changes
    watch([() => props.autoplay, () => props.autoplaySpeed, isPaused], syncAutoplay)

    // Lifecycle
    onMounted(() => {
      if (props.autoplay) {
        startAutoplay()
      }

      containerRef.value?.addEventListener('touchstart', handleTouchStart, { passive: true })
      containerRef.value?.addEventListener('touchmove', handleTouchMove, { passive: true })
      containerRef.value?.addEventListener('touchend', handleTouchEnd, { passive: true })
      containerRef.value?.addEventListener('touchcancel', handleTouchCancel, { passive: true })
    })

    onUnmounted(() => {
      stopAutoplay()
      resetTouchGesture()
      containerRef.value?.removeEventListener('touchstart', handleTouchStart)
      containerRef.value?.removeEventListener('touchmove', handleTouchMove)
      containerRef.value?.removeEventListener('touchend', handleTouchEnd)
      containerRef.value?.removeEventListener('touchcancel', handleTouchCancel)
    })

    // Expose methods for external use
    expose({
      next,
      prev,
      goTo
    })

    return () => {
      // Get slot content and flatten Fragments (from v-for)
      const defaultSlot = slots.default?.() || []
      const flattenSlots = (nodes: VNode[]): VNode[] => {
        return nodes.flatMap((node) => {
          if (node.type === Fragment && Array.isArray(node.children)) {
            return flattenSlots(node.children as VNode[])
          }
          return node
        })
      }
      const slides = flattenSlots(defaultSlot).filter((child) => child.type !== Comment)
      slideCount.value = slides.length

      // Arrow button helper
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
              class: 'w-6 h-6'
            },
            h('path', { d: path })
          )
        )

      // Render arrows
      const renderArrows = () => {
        if (!props.arrows) return null
        return [
          renderArrowButton('prev', isPrevArrowDisabled.value, prev, carouselPrevArrowPath),
          renderArrowButton('next', isNextArrowDisabled.value, next, carouselNextArrowPath)
        ]
      }

      // Render dots
      const renderDots = () => {
        if (!props.dots || slides.length <= 1) return null

        const dots = slides.map((_, index) =>
          h('button', {
            type: 'button',
            key: index,
            class: getCarouselDotClasses(index === currentIndex.value),
            onClick: () => goTo(index),
            'aria-label': labels.value.goToSlideAriaLabel.replace('{index}', String(index + 1)),
            'aria-current': index === currentIndex.value ? 'true' : 'false'
          })
        )

        return h(
          'div',
          {
            class: dotsClasses.value,
            role: 'tablist',
            'aria-label': labels.value.navigationAriaLabel
          },
          dots
        )
      }

      // Render slides
      const renderSlides = () => {
        const slideElements = slides.map((slide, index) =>
          h(
            'div',
            {
              key: index,
              class: getSlideClasses(index),
              style: props.effect === 'fade' ? slideStyle.value : undefined,
              role: 'group',
              'aria-roledescription': 'slide',
              'aria-label': labels.value.slideAriaLabel
                .replace('{index}', String(index + 1))
                .replace('{total}', String(slides.length)),
              'aria-hidden': index !== currentIndex.value
            },
            slide
          )
        )

        // For fade effect, wrap slides in a relative container with first slide height
        if (props.effect === 'fade') {
          return h(
            'div',
            {
              class: classNames(trackClasses.value, 'h-full')
            },
            slideElements
          )
        }

        // For scroll effect
        return h(
          'div',
          {
            class: trackClasses.value,
            style: trackStyle.value
          },
          slideElements
        )
      }

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
          style: props.style,
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': labels.value.ariaLabel,
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          onFocusin: handleFocus,
          onFocusout: handleBlur
        },
        [renderSlides(), renderArrows(), renderDots()]
      )
    }
  }
})

export default Carousel
