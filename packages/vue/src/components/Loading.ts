import { defineComponent, computed, h, PropType, ref, watch, onUnmounted } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLoadingIndicator,
  getLoadingLabel,
  getLoadingTextClasses,
  DEFAULT_LOADING_BACKGROUND,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingRegionBaseClasses,
  loadingRegionOverlayClasses,
  mergeStyleValues,
  mergeTigerLocale,
  normalizeSvgAttrs,
  type LoadingIndicatorNode,
  type LoadingProps,
  type LoadingVariant,
  type LoadingSize,
  type LoadingColor,
  type TigerLocale
} from '@expcat/tigercat-core'
import {
  renderVueBodyTeleport,
  useVueBackgroundInert,
  useVueBodyScrollLock
} from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface VueLoadingProps extends LoadingProps {
  style?: Record<string, string | number>
  locale?: Partial<TigerLocale>
}

export type { LoadingProps }

function renderIndicator(node: LoadingIndicatorNode) {
  if (node.kind === 'items') {
    return h(
      'div',
      { class: node.className, 'aria-hidden': 'true' },
      node.items.map((item) => h('div', { class: item.className }))
    )
  }

  return h(
    'svg',
    {
      class: node.className,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: node.viewBox,
      'aria-hidden': 'true',
      focusable: 'false'
    },
    node.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  )
}

export const Loading = defineComponent({
  name: 'TigerLoading',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<LoadingVariant>,
      default: 'spinner' as LoadingVariant
    },
    size: {
      type: String as PropType<LoadingSize>,
      default: 'md' as LoadingSize
    },
    color: {
      type: String as PropType<LoadingColor>,
      default: 'primary' as LoadingColor
    },
    text: {
      type: String,
      default: undefined
    },
    spinning: {
      type: Boolean,
      default: true
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    delay: {
      type: Number,
      default: 0
    },
    background: {
      type: String,
      default: DEFAULT_LOADING_BACKGROUND
    },
    customColor: {
      type: String,
      default: undefined
    },
    lockScroll: {
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
    }
  },
  setup(props, { attrs, slots }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))

    const visible = ref(false)
    const containerRef = ref<HTMLElement | null>(null)
    let timer: ReturnType<typeof setTimeout> | null = null

    const hasRegion = computed(() => !!slots.default)
    const showIndicator = computed(() => visible.value && props.spinning)
    const showFullscreen = computed(
      () => props.fullscreen && showIndicator.value && !hasRegion.value
    )
    const shouldLockBodyScroll = computed(() => showFullscreen.value && props.lockScroll)

    useVueBodyScrollLock(shouldLockBodyScroll)
    useVueBackgroundInert(showFullscreen, containerRef)

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    watch(
      () => props.delay,
      (delay) => {
        clearTimer()

        if (delay <= 0) {
          visible.value = true
          return
        }

        visible.value = false
        timer = setTimeout(() => {
          visible.value = true
        }, delay)
      },
      { immediate: true }
    )

    onUnmounted(() => {
      clearTimer()
    })

    const indicator = computed(() =>
      getLoadingIndicator({
        variant: props.variant,
        size: props.size,
        color: props.color,
        customColor: props.customColor
      })
    )

    const textClasses = computed(() => {
      return getLoadingTextClasses(props.size, props.color, props.customColor)
    })

    const inlineStyle = computed(() => {
      const baseStyle: Record<string, string | number> = {}
      if (props.customColor) baseStyle.color = props.customColor
      if (props.fullscreen) baseStyle.backgroundColor = props.background
      return mergeStyleValues(baseStyle, attrs.style, props.style)
    })

    const overlayStyle = computed(() => {
      const baseStyle: Record<string, string | number> = {}
      if (props.customColor) baseStyle.color = props.customColor
      baseStyle.backgroundColor = props.background
      return mergeStyleValues(baseStyle, attrs.style, props.style)
    })

    const label = computed(() => getLoadingLabel(mergedLocale.value, props.text))

    return () => {
      const indicatorNode = renderIndicator(indicator.value)
      const children = [indicatorNode]
      if (props.text) {
        children.push(h('div', { class: textClasses.value }, props.text))
      }

      const decorative =
        attrs['aria-hidden'] === true ||
        attrs['aria-hidden'] === 'true' ||
        attrs.role === 'presentation'
      const statusProps = decorative
        ? { role: 'presentation', 'aria-hidden': true }
        : { role: 'status', 'aria-label': label.value, 'aria-busy': true }

      if (hasRegion.value) {
        const content = slots.default?.()
        return h('div', { class: classNames(loadingRegionBaseClasses, props.className) }, [
          h('div', { inert: showIndicator.value || undefined }, content),
          showIndicator.value
            ? h(
                'div',
                {
                  ...attrs,
                  ref: containerRef,
                  class: classNames(loadingRegionOverlayClasses, coerceClassValue(attrs.class)),
                  style: overlayStyle.value,
                  ...statusProps
                },
                children
              )
            : null
        ])
      }

      if (!showIndicator.value) {
        return null
      }

      const loadingNode = h(
        'div',
        {
          ...attrs,
          ref: containerRef,
          class: classNames(
            props.fullscreen ? loadingFullscreenBaseClasses : loadingContainerBaseClasses,
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: inlineStyle.value,
          ...statusProps
        },
        children
      )

      if (props.fullscreen) {
        return renderVueBodyTeleport([loadingNode])
      }

      return loadingNode
    }
  }
})

export default Loading
