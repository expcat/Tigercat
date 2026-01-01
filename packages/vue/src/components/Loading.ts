import { defineComponent, computed, h, PropType, ref, onMounted, onUnmounted } from 'vue'
import { 
  classNames,
  getLoadingClasses,
  getSpinnerSVG,
  dotsVariantConfig,
  barsVariantConfig,
  loadingContainerBaseClasses,
  loadingFullscreenBaseClasses,
  loadingTextSizeClasses,
  loadingColorClasses,
  injectLoadingAnimationStyles,
  type LoadingVariant,
  type LoadingSize,
  type LoadingColor,
} from '@tigercat/core'

export const Loading = defineComponent({
  name: 'TigerLoading',
  props: {
    /**
     * Loading spinner variant - determines animation style
     * @default 'spinner'
     */
    variant: {
      type: String as PropType<LoadingVariant>,
      default: 'spinner' as LoadingVariant,
    },
    /**
     * Size of the loading indicator
     * @default 'md'
     */
    size: {
      type: String as PropType<LoadingSize>,
      default: 'md' as LoadingSize,
    },
    /**
     * Color variant
     * @default 'primary'
     */
    color: {
      type: String as PropType<LoadingColor>,
      default: 'primary' as LoadingColor,
    },
    /**
     * Custom text to display below the spinner
     */
    text: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to show loading as fullscreen overlay
     * @default false
     */
    fullscreen: {
      type: Boolean,
      default: false,
    },
    /**
     * Delay before showing the loading indicator (ms)
     * @default 0
     */
    delay: {
      type: Number,
      default: 0,
    },
    /**
     * Custom background color (for fullscreen mode)
     * @default 'rgba(255, 255, 255, 0.9)'
     */
    background: {
      type: String,
      default: 'rgba(255, 255, 255, 0.9)',
    },
    /**
     * Custom spinner color (overrides color variant)
     */
    customColor: {
      type: String,
      default: undefined,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    // Inject animation styles when component is first used
    injectLoadingAnimationStyles()
    
    const visible = ref(props.delay === 0)
    let timer: ReturnType<typeof setTimeout> | null = null

    onMounted(() => {
      if (props.delay > 0) {
        timer = setTimeout(() => {
          visible.value = true
        }, props.delay)
      }
    })

    onUnmounted(() => {
      if (timer) {
        clearTimeout(timer)
      }
    })

    const spinnerClasses = computed(() => {
      return getLoadingClasses(props.variant, props.size, props.color, props.customColor)
    })

    const textClasses = computed(() => {
      return classNames(
        loadingTextSizeClasses[props.size],
        props.customColor ? '' : loadingColorClasses[props.color],
        'font-medium'
      )
    })

    const containerClasses = computed(() => {
      if (props.fullscreen) {
        return classNames(loadingFullscreenBaseClasses, props.className)
      }
      return classNames(loadingContainerBaseClasses, props.className)
    })

    const customStyle = computed(() => {
      const style: Record<string, string> = {}
      if (props.customColor) {
        style.color = props.customColor
      }
      if (props.fullscreen) {
        style.backgroundColor = props.background
      }
      return style
    })

    // Render spinner variant
    const renderSpinner = () => {
      const svg = getSpinnerSVG(props.variant)
      
      return h(
        'svg',
        {
          class: spinnerClasses.value,
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: svg.viewBox,
          style: props.customColor ? { color: props.customColor } : undefined,
        },
        svg.elements.map(el => 
          h(el.type, el.attrs)
        )
      )
    }

    // Render dots variant
    const renderDots = () => {
      const config = dotsVariantConfig[props.size]
      const colorClass = props.customColor ? '' : loadingColorClasses[props.color]
      
      return h(
        'div',
        {
          class: classNames('flex items-center', config.gap),
        },
        [0, 1, 2].map(i => 
          h('div', {
            class: classNames(
              config.dotSize,
              'rounded-full',
              'bg-current',
              colorClass,
              'animate-bounce-dot',
              i === 0 ? 'animation-delay-0' : i === 1 ? 'animation-delay-150' : 'animation-delay-300'
            ),
            style: props.customColor ? { backgroundColor: props.customColor } : undefined,
          })
        )
      )
    }

    // Render bars variant
    const renderBars = () => {
      const config = barsVariantConfig[props.size]
      const colorClass = props.customColor ? '' : loadingColorClasses[props.color]
      
      return h(
        'div',
        {
          class: classNames('flex items-end', config.gap),
        },
        [0, 1, 2].map(i => 
          h('div', {
            class: classNames(
              config.barWidth,
              config.barHeight,
              'rounded-sm',
              'bg-current',
              colorClass,
              'animate-scale-bar',
              i === 0 ? 'animation-delay-0' : i === 1 ? 'animation-delay-150' : 'animation-delay-300'
            ),
            style: props.customColor ? { backgroundColor: props.customColor } : undefined,
          })
        )
      )
    }

    // Render loading indicator based on variant
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
        children.push(
          h('div', { class: textClasses.value }, props.text)
        )
      }

      return h(
        'div',
        {
          class: containerClasses.value,
          style: customStyle.value,
          role: 'status',
          'aria-label': props.text || 'Loading',
          'aria-live': 'polite',
        },
        children
      )
    }
  },
})

export default Loading
