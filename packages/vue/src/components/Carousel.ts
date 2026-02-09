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
  carouselPrevArrowPath,
  carouselNextArrowPath,
  type CarouselDotPosition,
  type CarouselEffect
} from '@expcat/tigercat-core'

export interface VueCarouselProps {
  autoplay?: boolean
  autoplaySpeed?: number
  dots?: boolean
  dotPosition?: CarouselDotPosition
  effect?: CarouselEffect
  arrows?: boolean
  infinite?: boolean
  speed?: number
  initialSlide?: number
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  className?: string
  style?: Record<string, string | number>
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
     * Initial slide index (0-based)
     * @default 0
     */
    initialSlide: {
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
    }
  },
  emits: ['change', 'before-change'],
  setup(props, { slots, emit, attrs, expose }) {
    const currentIndex = ref(props.initialSlide)
    const isPaused = ref(false)
    const slideCount = ref(0)
    let autoplayTimer: ReturnType<typeof setInterval> | null = null

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
      currentIndex.value = clampedIndex
      emit('change', clampedIndex, prevIndex)
    }

    // Autoplay control
    const startAutoplay = () => {
      if (!props.autoplay || autoplayTimer) return
      autoplayTimer = setInterval(() => {
        if (!isPaused.value) {
          next()
        }
      }, props.autoplaySpeed)
    }

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
      }
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
    watch(
      () => props.autoplay,
      (newVal) => {
        if (newVal) {
          startAutoplay()
        } else {
          stopAutoplay()
        }
      }
    )

    // Lifecycle
    onMounted(() => {
      if (props.autoplay) {
        startAutoplay()
      }
    })

    onUnmounted(() => {
      stopAutoplay()
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
            'aria-label': type === 'prev' ? 'Previous slide' : 'Next slide'
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
            'aria-label': `Go to slide ${index + 1}`,
            'aria-current': index === currentIndex.value ? 'true' : 'false'
          })
        )

        return h(
          'div',
          {
            class: dotsClasses.value,
            role: 'tablist',
            'aria-label': 'Carousel navigation'
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
              'aria-label': `Slide ${index + 1} of ${slides.length}`,
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
          class: containerClasses.value,
          style: props.style,
          role: 'region',
          'aria-roledescription': 'carousel',
          'aria-label': 'Image carousel',
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
