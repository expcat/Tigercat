import {
  defineComponent,
  computed,
  inject,
  provide,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType
} from 'vue'
import {
  mergeTigerLocale,
  ThemeManager,
  type TigerLocale,
  type ColorScheme
} from '@expcat/tigercat-core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  theme?: string
  colorScheme?: ColorScheme
}

export const TigerConfigKey: InjectionKey<ComputedRef<TigerConfig>> = Symbol('TigerConfig')

export function useTigerConfig(): ComputedRef<TigerConfig> {
  return inject(
    TigerConfigKey,
    computed(() => ({}))
  )
}

export const ConfigProvider = defineComponent({
  name: 'TigerConfigProvider',
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    theme: {
      type: String,
      default: undefined
    },
    colorScheme: {
      type: String as PropType<ColorScheme>,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const parent = useTigerConfig()

    const merged = computed<TigerConfig>(() => {
      return {
        locale: mergeTigerLocale(parent.value.locale, props.locale),
        theme: props.theme ?? parent.value.theme,
        colorScheme: props.colorScheme ?? parent.value.colorScheme
      }
    })

    // Apply theme when it changes
    watch(
      () => merged.value.theme,
      (name) => {
        if (name) ThemeManager.setTheme(name)
      },
      { immediate: true }
    )

    watch(
      () => merged.value.colorScheme,
      (scheme) => {
        if (scheme) ThemeManager.setColorScheme(scheme)
      },
      { immediate: true }
    )

    provide(TigerConfigKey, merged)

    return () => slots.default?.()
  }
})

export default ConfigProvider
