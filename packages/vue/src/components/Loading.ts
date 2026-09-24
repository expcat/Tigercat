import { defineComponent, computed, h, nextTick, PropType, ref, useId, watch, onUnmounted } from 'vue'
import {
  captureRegionFocus,
  classNames,
  coerceClassValue,
  createLoadingDelayGate,
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
  restoreRegionFocus,
  type LoadingIndicatorNode,
  type LoadingProps,
  type LoadingVariant,
  type LoadingSize,
  type LoadingColor,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useVueFocusTrap } from '../utils/overlay'
import { renderVueOverlayOutlet } from '../utils/overlay-outlet'
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
    const regionRef = ref<HTMLElement | null>(null)
    const layerRef = ref<HTMLElement | null>(null)
    const gate = createLoadingDelayGate()
    const stopGate = gate.subscribe(() => {
      visible.value = gate.isShown()
    })
    let rememberedFocus: HTMLElement | null = null
    let regionMasked = false
    const fullscreenId = `loading-fullscreen-${useId()}`

    const hasRegion = computed(() => !!slots.default)
    const showIndicator = computed(() => visible.value)
    const showFullscreen = computed(() => props.fullscreen && showIndicator.value)

    useVueFocusTrap({
      enabled: showFullscreen,
      containerRef: layerRef,
      inert: true,
      autoFocus: true,
      initialFocusRef: layerRef,
      lockScroll: computed(() => props.lockScroll)
    })

    watch(
      () => [props.spinning, props.delay] as const,
      ([spinning, delay]) => {
        gate.sync(Boolean(spinning), delay)
      },
      { immediate: true }
    )

    watch(showIndicator, (showing) => {
      if (showing || !hasRegion.value || props.fullscreen) return
      const remembered = rememberedFocus
      rememberedFocus = null
      regionMasked = false
      nextTick(() => restoreRegionFocus(regionRef.value, remembered))
    })

    onUnmounted(() => {
      stopGate()
      gate.dispose()
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
      if (showIndicator.value && !showFullscreen.value && hasRegion.value && !regionMasked) {
        rememberedFocus = captureRegionFocus(regionRef.value)
        regionMasked = true
      }
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
        : {
            role: 'status',
            'aria-label': label.value,
            ...(hasRegion.value ? {} : { 'aria-busy': true })
          }

      const fullscreenNode = renderVueOverlayOutlet(
        fullscreenId,
        showFullscreen.value
          ? h(
              'div',
              {
                ...attrs,
                ref: layerRef,
                tabindex: -1,
                class: classNames(
                  loadingFullscreenBaseClasses,
                  props.className,
                  coerceClassValue(attrs.class)
                ),
                style: overlayStyle.value,
                ...statusProps,
                'data-tiger-overlay-layer': ''
              },
              children
            )
          : null
      )

      if (hasRegion.value) {
        const content = slots.default?.()
        return h(
          'div',
          {
            ref: regionRef,
            class: classNames(loadingRegionBaseClasses, props.className),
            'aria-busy': showIndicator.value ? 'true' : undefined
          },
          [
            h('div', { inert: showIndicator.value && !showFullscreen.value ? true : undefined }, content),
            showIndicator.value && !showFullscreen.value
              ? h(
                  'div',
                  {
                    ...attrs,
                    class: classNames(loadingRegionOverlayClasses, coerceClassValue(attrs.class)),
                    style: overlayStyle.value,
                    ...statusProps
                  },
                  children
                )
              : null,
            fullscreenNode
          ]
        )
      }

      if (showFullscreen.value) return fullscreenNode
      if (!showIndicator.value) return null

      return h(
        'div',
        {
          ...attrs,
          class: classNames(
            loadingContainerBaseClasses,
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: inlineStyle.value,
          ...statusProps
        },
        children
      )
    }
  }
})

export default Loading
