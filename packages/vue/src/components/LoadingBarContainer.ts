import { computed, defineComponent, h, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  DEFAULT_LOADING_BAR_ARIA_LABEL,
  DEFAULT_LOADING_BAR_COLOR,
  DEFAULT_LOADING_BAR_HEIGHT,
  getLoadingBarContainerClasses,
  getLoadingBarFillClasses,
  getLoadingBarFillStyle,
  LOADING_BAR_CONTAINER_ID,
  mergeStyleValues,
  type LoadingBarColor,
  type LoadingBarContainerProps,
  type LoadingBarStatus
} from '@expcat/tigercat-core'

export interface VueLoadingBarContainerProps extends LoadingBarContainerProps {
  style?: Record<string, string | number>
}

export const LoadingBarContainer = /* @__PURE__ */ defineComponent({
  name: 'TigerLoadingBarContainer',
  inheritAttrs: false,
  props: {
    percentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String as PropType<LoadingBarStatus>,
      default: 'idle' as LoadingBarStatus
    },
    color: {
      type: String as PropType<LoadingBarColor>,
      default: DEFAULT_LOADING_BAR_COLOR
    },
    height: {
      type: Number,
      default: DEFAULT_LOADING_BAR_HEIGHT
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    ariaLabel: {
      type: String,
      default: undefined
    }
  },
  setup(props, { attrs }) {
    const containerClasses = computed(() =>
      getLoadingBarContainerClasses(classNames(props.className, coerceClassValue(attrs.class)))
    )
    const fillClasses = computed(() => getLoadingBarFillClasses(props.status, props.color))
    const fillStyle = computed(() => getLoadingBarFillStyle(props.percentage, props.height))
    const resolvedAriaLabel = computed(
      () => props.ariaLabel?.trim() || DEFAULT_LOADING_BAR_ARIA_LABEL
    )

    return () => {
      const isBusy = props.status === 'loading'

      return h(
        'div',
        {
          ...attrs,
          class: containerClasses.value,
          style: mergeStyleValues(attrs.style, props.style, { height: `${props.height}px` }),
          id: LOADING_BAR_CONTAINER_ID,
          'data-tiger-loading-bar-container': '',
          'data-tiger-loading-bar-status': props.status
        },
        [
          h('div', {
            class: fillClasses.value,
            style: fillStyle.value,
            role: 'progressbar',
            'aria-label': resolvedAriaLabel.value,
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-valuenow': Math.round(props.percentage),
            'aria-busy': isBusy ? 'true' : undefined,
            'aria-live': 'polite',
            'aria-atomic': 'true',
            'data-tiger-loading-bar': '',
            'data-tiger-loading-bar-status': props.status
          })
        ]
      )
    }
  }
})

export default LoadingBarContainer
