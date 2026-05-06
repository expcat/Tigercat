import {
  defineComponent,
  computed,
  inject,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType
} from 'vue'
import {
  mergeTigerLocale,
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  ThemeManager,
  type TigerLocale,
  type TigerLocaleInput,
  type ColorScheme
} from '@expcat/tigercat-core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
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
      type: [Object, Function, Promise] as PropType<TigerLocaleInput>,
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

    const resolvedLocale = ref<Partial<TigerLocale> | undefined>(
      isLazyTigerLocale(props.locale) ? undefined : getImmediateTigerLocale(props.locale)
    )
    const localeLoading = ref(isLazyTigerLocale(props.locale))
    let loadId = 0

    watch(
      () => props.locale,
      (locale) => {
        if (!isLazyTigerLocale(locale)) {
          resolvedLocale.value = getImmediateTigerLocale(locale)
          localeLoading.value = false
          return
        }

        const thisId = ++loadId
        localeLoading.value = true

        resolveTigerLocale(locale).then(
          (result) => {
            if (thisId === loadId) {
              resolvedLocale.value = result
              localeLoading.value = false
            }
          },
          () => {
            if (thisId === loadId) {
              localeLoading.value = false
            }
          }
        )
      },
      { immediate: true }
    )

    const merged = computed<TigerConfig>(() => {
      return {
        locale: mergeTigerLocale(parent.value.locale, resolvedLocale.value),
        localeLoading: localeLoading.value || parent.value.localeLoading,
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
