import { computed, defineComponent, h, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  DEFAULT_LOADING_BAR_COLOR,
  DEFAULT_LOADING_BAR_HEIGHT,
  getLoadingBarContainerClasses,
  getLoadingBarFillClasses,
  getLoadingBarFillStyle,
  getLoadingBarProgressValue,
  getLoadingLabel,
  mergeStyleValues,
  type LoadingBarColor,
  type LoadingBarContainerProps as CoreLoadingBarContainerProps,
  type LoadingBarStatus
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { getGlobalTigerLocale } from '../utils/global-locale'

export interface VueLoadingBarContainerProps extends CoreLoadingBarContainerProps {
  style?: Record<string, string | number>
}

export type LoadingBarContainerProps = VueLoadingBarContainerProps

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
    const config = useTigerConfig()
    const containerClasses = computed(() =>
      getLoadingBarContainerClasses(classNames(props.className, coerceClassValue(attrs.class)))
    )
    const fillClasses = computed(() => getLoadingBarFillClasses(props.status, props.color))
    const fillStyle = computed(() => getLoadingBarFillStyle(props.percentage, props.height))
    const resolvedAriaLabel = computed(() =>
      getLoadingLabel(config.value.locale ?? getGlobalTigerLocale(), props.ariaLabel)
    )
    const valueNow = computed(() => getLoadingBarProgressValue(props.percentage))

    return () => {
      const isBusy = props.status === 'loading'
      const {
        role: _role,
        'aria-label': _ariaLabel,
        'aria-live': _ariaLive,
        'aria-atomic': _ariaAtomic,
        'aria-busy': _ariaBusy,
        'aria-valuenow': _ariaValueNow,
        'aria-valuemin': _ariaValueMin,
        'aria-valuemax': _ariaValueMax,
        class: _class,
        style: attrStyle,
        ...domAttrs
      } = attrs

      return h(
        'div',
        {
          ...domAttrs,
          class: containerClasses.value,
          style: mergeStyleValues(attrStyle, props.style, { height: `${props.height}px` }),
          role: 'progressbar',
          'aria-label': resolvedAriaLabel.value,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': valueNow.value,
          'aria-busy': isBusy ? 'true' : undefined,
          'data-tiger-loading-bar-container': '',
          'data-tiger-loading-bar-status': props.status
        },
        [
          h('div', {
            class: fillClasses.value,
            style: fillStyle.value,
            'data-tiger-loading-bar': '',
            'data-tiger-loading-bar-status': props.status
          })
        ]
      )
    }
  }
})

export default LoadingBarContainer
