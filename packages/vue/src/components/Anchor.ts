import {
  defineComponent,
  h,
  ref,
  computed,
  provide,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  PropType,
  reactive
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getAnchorWrapperClasses,
  getAnchorInkContainerClasses,
  getAnchorInkActiveClasses,
  getAnchorLinkListClasses,
  findActiveAnchor,
  scrollToAnchor,
  type AnchorDirection
} from '@expcat/tigercat-core'

// Anchor context key
export const AnchorContextKey = Symbol('AnchorContext')

// Anchor context interface
export interface AnchorContext {
  activeLink: string
  direction: AnchorDirection
  registerLink: (href: string) => void
  unregisterLink: (href: string) => void
  handleLinkClick: (href: string, event: Event) => void
  scrollTo: (href: string) => void
}

export interface VueAnchorProps {
  affix?: boolean
  bounds?: number
  offsetTop?: number
  showInkInFixed?: boolean
  targetOffset?: number
  getCurrentAnchor?: (activeLink: string) => string
  getContainer?: () => HTMLElement | Window
  direction?: AnchorDirection
  className?: string
  style?: Record<string, unknown>
}

export const Anchor = defineComponent({
  name: 'TigerAnchor',
  inheritAttrs: false,
  props: {
    /**
     * Whether to fix the anchor to the viewport
     * @default true
     */
    affix: {
      type: Boolean,
      default: true
    },
    /**
     * Anchor detection boundary in pixels
     * @default 5
     */
    bounds: {
      type: Number,
      default: 5
    },
    /**
     * Offset from top of viewport when fixed
     * @default 0
     */
    offsetTop: {
      type: Number,
      default: 0
    },
    /**
     * Whether to show ink indicator when in fixed mode
     * @default false
     */
    showInkInFixed: {
      type: Boolean,
      default: false
    },
    /**
     * Offset when scrolling to target anchor
     */
    targetOffset: {
      type: Number,
      default: undefined
    },
    /**
     * Custom function to determine current active anchor
     */
    getCurrentAnchor: {
      type: Function as PropType<(activeLink: string) => string>,
      default: undefined
    },
    /**
     * Get the scroll container
     * @default () => window
     */
    getContainer: {
      type: Function as PropType<() => HTMLElement | Window>,
      default: () => window
    },
    /**
     * Direction of the anchor navigation
     * @default 'vertical'
     */
    direction: {
      type: String as PropType<AnchorDirection>,
      default: 'vertical'
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['click', 'change'],
  setup(props, { slots, emit, attrs }) {
    const activeLink = ref('')
    const links = ref<string[]>([])
    const anchorRef = ref<HTMLElement | null>(null)
    const inkRef = ref<HTMLElement | null>(null)
    const isScrolling = ref(false)

    let animationFrameId: number | null = null

    // Get current container (call fresh each time to handle lazy refs)
    const getContainer = () => props.getContainer()

    // Register a link
    const registerLink = (href: string) => {
      if (href && !links.value.includes(href)) {
        links.value = [...links.value, href]
      }
    }

    // Unregister a link
    const unregisterLink = (href: string) => {
      links.value = links.value.filter((l) => l !== href)
    }

    // Handle scroll events
    const handleScroll = () => {
      if (isScrolling.value) return

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        const container = getContainer()
        const scrollOffset = props.targetOffset ?? props.offsetTop
        const newActiveLink = findActiveAnchor(links.value, container, props.bounds, scrollOffset)

        // Apply custom getCurrentAnchor if provided
        const finalActiveLink = props.getCurrentAnchor
          ? props.getCurrentAnchor(newActiveLink)
          : newActiveLink

        if (finalActiveLink !== activeLink.value) {
          activeLink.value = finalActiveLink
          emit('change', finalActiveLink)
        }
      })
    }

    // Scroll to anchor
    const scrollTo = (href: string) => {
      const container = getContainer()
      const scrollOffset = props.targetOffset ?? props.offsetTop
      scrollToAnchor(href, container, scrollOffset)
    }

    // Handle link click
    const handleLinkClick = (href: string, event: Event) => {
      emit('click', event, href)

      // Prevent scroll handler from running during programmatic scroll
      isScrolling.value = true
      activeLink.value = href

      scrollTo(href)

      // Re-enable scroll handler after animation
      setTimeout(() => {
        isScrolling.value = false
      }, 500)
    }

    // Update ink position
    const updateInkPosition = () => {
      if (!inkRef.value || !anchorRef.value || !activeLink.value) {
        return
      }

      const activeLinkElement = anchorRef.value.querySelector(
        `[data-anchor-href="${activeLink.value}"]`
      ) as HTMLElement | null

      if (!activeLinkElement) {
        return
      }

      const anchorRect = anchorRef.value.getBoundingClientRect()
      const linkRect = activeLinkElement.getBoundingClientRect()

      if (props.direction === 'vertical') {
        inkRef.value.style.top = `${linkRect.top - anchorRect.top}px`
        inkRef.value.style.height = `${linkRect.height}px`
      } else {
        inkRef.value.style.left = `${linkRect.left - anchorRect.left}px`
        inkRef.value.style.width = `${linkRect.width}px`
      }
    }

    // Watch activeLink for ink position updates
    watch(activeLink, () => {
      updateInkPosition()
    })

    // Watch direction for ink position updates
    watch(() => props.direction, updateInkPosition)

    // Store current container for cleanup
    let currentContainer: HTMLElement | Window | null = null

    onMounted(() => {
      // Use nextTick to ensure sibling refs are ready
      nextTick(() => {
        currentContainer = getContainer()
        currentContainer.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        // Initial ink position update
        setTimeout(updateInkPosition, 0)
      })
    })

    onBeforeUnmount(() => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', handleScroll)
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    })

    // Computed classes
    const wrapperClasses = computed(() => {
      return classNames(
        getAnchorWrapperClasses(props.affix, props.className),
        coerceClassValue(attrs.class)
      )
    })

    const inkContainerClasses = computed(() => {
      return getAnchorInkContainerClasses(props.direction)
    })

    const inkActiveClasses = computed(() => {
      return getAnchorInkActiveClasses(props.direction)
    })

    const linkListClasses = computed(() => {
      return getAnchorLinkListClasses(props.direction)
    })

    const showInk = computed(() => {
      if (!props.affix) return true
      return props.showInkInFixed
    })

    const wrapperStyle = computed(() => {
      const baseStyle: Record<string, unknown> = {}
      if (props.affix && props.offsetTop > 0) {
        baseStyle.top = `${props.offsetTop}px`
      }
      return mergeStyleValues(attrs.style, props.style, baseStyle)
    })

    // Provide context to child AnchorLinks
    const contextValue = reactive<AnchorContext>({
      activeLink: '',
      direction: props.direction,
      registerLink,
      unregisterLink,
      handleLinkClick,
      scrollTo
    })

    // Keep context in sync
    watch(activeLink, (newVal) => {
      contextValue.activeLink = newVal
    })

    watch(
      () => props.direction,
      (newVal) => {
        contextValue.direction = newVal
      }
    )

    provide(AnchorContextKey, contextValue)

    return () => {
      const inkIndicator = showInk.value
        ? [
            h('div', { class: inkContainerClasses.value }, [
              h('div', {
                ref: inkRef,
                class: inkActiveClasses.value
              })
            ])
          ]
        : []

      return h(
        'div',
        {
          ...attrs,
          ref: anchorRef,
          class: wrapperClasses.value,
          style: wrapperStyle.value
        },
        [
          ...inkIndicator,
          h(
            'div',
            {
              class: linkListClasses.value
            },
            slots.default?.()
          )
        ]
      )
    }
  }
})

export default Anchor
