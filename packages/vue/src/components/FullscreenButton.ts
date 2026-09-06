import { computed, defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  fullscreenButtonClasses,
  getFullscreenLabels,
  getIconDefinition,
  mergeTigerLocale,
  type TigerLocale,
  type TigerLocaleFullscreen
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useFullscreen } from '../composables/useFullscreen'

export interface VueFullscreenButtonProps {
  target?: Element | (() => Element | null | undefined) | null
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleFullscreen>
  className?: string
}

export type FullscreenButtonProps = VueFullscreenButtonProps

function renderGlyph(name: 'fullscreen' | 'fullscreen-exit') {
  const definition = getIconDefinition(name)
  if (!definition) return undefined
  return h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: definition.viewBox,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: 'h-5 w-5',
      'aria-hidden': 'true'
    },
    definition.paths.map((d) => h('path', { d }))
  )
}

export const FullscreenButton = defineComponent({
  name: 'TigerFullscreenButton',
  inheritAttrs: false,
  props: {
    target: {
      type: [Object, Function] as PropType<Element | (() => Element | null | undefined) | null>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleFullscreen>>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  emits: ['change', 'error'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labelSet = computed(() =>
      getFullscreenLabels(mergeTigerLocale(config.value.locale, props.locale), props.labels)
    )
    const fullscreen = useFullscreen(() => ({
      target: props.target,
      onChange: (next) => emit('change', next),
      onError: (error) => emit('error', error)
    }))

    return () => {
      const label = fullscreen.isFullscreen.value
        ? labelSet.value.exitAriaLabel
        : labelSet.value.enterAriaLabel
      return h(
        'button',
        {
          ...attrs,
          type: 'button',
          class: classNames(
            fullscreenButtonClasses,
            props.className,
            coerceClassValue((attrs as Record<string, unknown>).class)
          ),
          'aria-label': label,
          'aria-pressed': fullscreen.isFullscreen.value,
          disabled: !fullscreen.supported,
          onClick: () => {
            void fullscreen.toggle()
          }
        },
        renderGlyph(fullscreen.isFullscreen.value ? 'fullscreen-exit' : 'fullscreen')
      )
    }
  }
})

export default FullscreenButton
