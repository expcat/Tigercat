import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getScrollTop,
  scrollToTop,
  backTopButtonClasses,
  backTopHiddenClasses,
  backTopVisibleClasses,
  backTopIconPath,
  type BackTopProps
} from '@expcat/tigercat-core'

export interface VueBackTopProps extends BackTopProps {
  target?: () => HTMLElement | Window
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
      type: Function as PropType<() => HTMLElement | Window>,
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
    let targetElement: HTMLElement | Window | null = null

    const handleScroll = () => {
      if (!targetElement) return
      const scrollTop = getScrollTop(targetElement)
      visible.value = scrollTop >= props.visibilityHeight
    }

    const handleClick = (event: MouseEvent) => {
      if (!targetElement) return
      scrollToTop(targetElement, props.duration)
      emit('click', event)
    }

    onMounted(() => {
      targetElement = props.target() ?? window
      if (targetElement) {
        targetElement.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
      }
    })

    onBeforeUnmount(() => {
      if (targetElement) {
        targetElement.removeEventListener('scroll', handleScroll)
      }
    })

    const buttonClasses = computed(() => {
      return classNames(
        backTopButtonClasses,
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
