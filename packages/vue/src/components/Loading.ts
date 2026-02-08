import { defineComponent, computed, h, PropType, ref, watch, onUnmounted } from 'vue'
import {
  classNames,
  coerceClassValue,
  getLoadingBarClasses,
  getLoadingBarsWrapperClasses,
  getLoadingClasses,
  getLoadingDotClasses,
  getLoadingDotsWrapperClasses,
  getLoadingTextClasses,
  getSpinnerSVG,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingColorClasses,
  mergeStyleValues,
  normalizeSvgAttrs,
  injectLoadingAnimationStyles,
  type LoadingProps,
  type LoadingVariant,
  type LoadingSize,
  type LoadingColor
} from '@expcat/tigercat-core'

export interface VueLoadingProps extends LoadingProps {
  style?: Record<string, string | number>
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
      default: 'rgba(255, 255, 255, 0.9)'
    },
    customColor: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { attrs }) {
    injectLoadingAnimationStyles()

    const visible = ref(false)
    let timer: ReturnType<typeof setTimeout> | null = null

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

    const spinnerClasses = computed(() => {
      return getLoadingClasses(props.variant, props.size, props.color, props.customColor)
    })

    const textClasses = computed(() => {
      return getLoadingTextClasses(props.size, props.color, props.customColor)
    })

    const containerClasses = computed(() => {
      return classNames(
        props.fullscreen ? loadingFullscreenBaseClasses : loadingContainerBaseClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const customStyle = computed(() => {
      const baseStyle: Record<string, string | number> = {}

      if (props.customColor) {
        baseStyle.color = props.customColor
      }

      if (props.fullscreen) {
        baseStyle.backgroundColor = props.background
      }

      return mergeStyleValues(attrs.style, props.style, baseStyle)
    })

    const renderSpinner = () => {
      const svg = getSpinnerSVG(props.variant)

      return h(
        'svg',
        {
          class: spinnerClasses.value,
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: svg.viewBox
        },
        svg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
      )
    }

    const renderDots = () => {
      const colorClass = props.customColor ? '' : loadingColorClasses[props.color]
      const steps = [0, 1, 2] as const

      return h(
        'div',
        {
          class: getLoadingDotsWrapperClasses(props.size)
        },
        steps.map((i) =>
          h('div', {
            class: getLoadingDotClasses(props.size, i, colorClass)
          })
        )
      )
    }

    const renderBars = () => {
      const colorClass = props.customColor ? '' : loadingColorClasses[props.color]
      const steps = [0, 1, 2] as const

      return h(
        'div',
        {
          class: getLoadingBarsWrapperClasses(props.size)
        },
        steps.map((i) =>
          h('div', {
            class: getLoadingBarClasses(props.size, i, colorClass)
          })
        )
      )
    }

    const renderIndicator = () => {
      switch (props.variant) {
        case 'dots':
          return renderDots()
        case 'bars':
          return renderBars()
        case 'spinner':
        case 'ring':
        case 'pulse':
        default:
          return renderSpinner()
      }
    }

    return () => {
      if (!visible.value) {
        return null
      }

      const children = [renderIndicator()]

      if (props.text) {
        children.push(h('div', { class: textClasses.value }, props.text))
      }

      return h(
        'div',
        {
          role: 'status',
          'aria-label': props.text || 'Loading',
          'aria-live': 'polite',
          'aria-busy': true,
          ...attrs,
          class: containerClasses.value,
          style: customStyle.value
        },
        children
      )
    }
  }
})

export default Loading
