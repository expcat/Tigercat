import {
  defineComponent,
  h,
  ref,
  shallowRef,
  computed,
  onMounted,
  onBeforeUnmount,
  unref,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getScrollTop,
  scrollToTop,
  backTopButtonClasses,
  backTopContainerClasses,
  backTopHiddenClasses,
  backTopVisibleClasses,
  backTopIconPath,
  type BackTopProps
} from '@expcat/tigercat-core'

export interface VueBackTopProps extends BackTopProps {
  target?: () => HTMLElement | Window | null
  className?: string
  style?: Record<string, unknown>
}

const DefaultIcon = h(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    'stroke-width': '2',
    class: 'h-5 w-5',
    'aria-hidden': 'true'
  },
  [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: backTopIconPath })]
)

export const BackTop = defineComponent({
  name: 'TigerBackTop',
  inheritAttrs: false,
  props: {
    /**
     * Scroll height to show the BackTop button
     * @default 400
     */
    visibilityHeight: {
      type: Number,
      default: 400
    },
    /**
     * Target element to listen for scroll events
     * @default () => window
     */
    target: {
      type: Function as PropType<() => HTMLElement | Window | null>,
      default: () => window
    },
    /**
     * Duration of scroll animation in milliseconds
     * @default 450
     */
    duration: {
      type: Number,
      default: 450
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
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const visible = ref(false)
    const targetElement = shallowRef<HTMLElement | Window | null>(null)

    const handleScroll = () => {
      if (!targetElement.value) return
      const scrollTop = getScrollTop(targetElement.value)
      visible.value = scrollTop >= props.visibilityHeight
    }

    const handleClick = (event: MouseEvent) => {
      if (!targetElement.value) return
      scrollToTop(targetElement.value, props.duration)
      emit('click', event)
    }

    onMounted(() => {
      const nextTarget = unref(props.target()) ?? window
      targetElement.value = nextTarget
      targetElement.value.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    })

    onBeforeUnmount(() => {
      if (targetElement.value) {
        targetElement.value.removeEventListener('scroll', handleScroll)
      }
    })

    const buttonClasses = computed(() => {
      // Use targetElement.value after mount, fallback to props.target() for initial render
      const targetResult = targetElement.value ?? unref(props.target())
      const isWindowTarget = !targetResult || targetResult === window
      const positionClasses = isWindowTarget ? backTopButtonClasses : backTopContainerClasses
      return classNames(
        positionClasses,
        visible.value ? backTopVisibleClasses : backTopHiddenClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const mergedStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    return () => {
      const content = slots.default ? slots.default() : DefaultIcon

      return h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-label': attrs['aria-label'] ?? 'Back to top',
          onClick: handleClick
        },
        content
      )
    }
  }
})

export default BackTop
