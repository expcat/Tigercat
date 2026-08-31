import { defineComponent, h, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  createBackTopVisibilityController,
  getBackTopLabels,
  getBackTopOffsetStyle,
  getBackTopPositionClasses,
  getBackTopVisibilityClasses,
  getScrollRootEventTarget,
  mergeStyleValues,
  mergeTigerLocale,
  resolveScrollRoot,
  scrollToTop,
  backTopIconPath,
  type BackTopPosition,
  type BackTopProps,
  type BackTopVisibilityController,
  type ScrollRootInput,
  type TigerLocale,
  type TigerLocaleBackTop,
  type ViewportOffset,
  type ViewportPlacement
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueBackTopProps extends BackTopProps {
  className?: string
  style?: Record<string, unknown>
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleBackTop>
}

export type { BackTopProps }

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
    visibilityHeight: {
      type: Number,
      default: 400
    },
    target: {
      type: [String, Object, Function] as PropType<ScrollRootInput>,
      default: undefined
    },
    duration: {
      type: Number,
      default: undefined
    },
    position: {
      type: String as PropType<BackTopPosition>,
      default: 'auto' as BackTopPosition
    },
    placement: {
      type: String as PropType<ViewportPlacement>,
      default: 'bottom-right' as ViewportPlacement
    },
    offset: {
      type: [Number, String, Object] as PropType<ViewportOffset>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleBackTop>>,
      default: undefined
    }
  },
  emits: ['click'],
  setup(props, { slots, emit, attrs }) {
    const visible = ref(false)
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labelSet = computed(() => getBackTopLabels(mergedLocale.value, props.labels))

    const resolvedKey = computed(() => {
      const root = resolveScrollRoot(props.target)
      return root.isWindow ? 'window' : root.target
    })
    let visibilityController: BackTopVisibilityController | undefined
    let boundTarget: EventTarget | null = null

    const unbind = () => {
      if (boundTarget && visibilityController) {
        boundTarget.removeEventListener('scroll', visibilityController.schedule)
      }
      visibilityController?.cancel()
      visibilityController = undefined
      boundTarget = null
    }

    const bind = () => {
      unbind()
      const root = resolveScrollRoot(props.target)
      const eventTarget = getScrollRootEventTarget(root)
      const scrollNode = root.target
      if (!eventTarget || !scrollNode) return
      visibilityController = createBackTopVisibilityController({
        target: scrollNode as HTMLElement | Window,
        getVisibilityHeight: () => props.visibilityHeight,
        onChange: (nextVisible) => {
          visible.value = nextVisible
        }
      })
      eventTarget.addEventListener('scroll', visibilityController.schedule, { passive: true })
      boundTarget = eventTarget
      visibilityController.update()
    }

    const handleClick = (event: MouseEvent) => {
      const root = resolveScrollRoot(props.target)
      if (!root.target) {
        emit('click', event)
        return
      }
      scrollToTop(root.target as HTMLElement | Window, props.duration)
      emit('click', event)
    }

    onMounted(() => {
      bind()
    })

    watch(resolvedKey, () => {
      bind()
    })

    watch(
      () => props.visibilityHeight,
      () => {
        visibilityController?.update()
      }
    )

    onBeforeUnmount(() => {
      unbind()
    })

    const buttonClasses = computed(() =>
      classNames(
        getBackTopPositionClasses({
          position: props.position,
          placement: props.placement
        }),
        getBackTopVisibilityClasses(visible.value),
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const mergedStyle = computed(() =>
      mergeStyleValues(
        getBackTopOffsetStyle(props.position, props.placement, props.offset),
        attrs.style,
        props.style
      )
    )

    return () => {
      const hasSlot = Boolean(slots.default)
      const content = hasSlot ? slots.default!() : DefaultIcon
      const userLabel = attrs['aria-label']
      const ariaLabel =
        typeof userLabel === 'string' && userLabel.trim()
          ? userLabel
          : hasSlot
            ? undefined
            : labelSet.value.ariaLabel

      return h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: buttonClasses.value,
          style: mergedStyle.value,
          'aria-label': ariaLabel,
          'aria-hidden': visible.value ? undefined : 'true',
          tabindex: visible.value ? 0 : -1,
          onClick: handleClick
        },
        content
      )
    }
  }
})

export default BackTop
