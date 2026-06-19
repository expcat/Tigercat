import {
  defineComponent,
  computed,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type ComputedRef,
  type ExtractPropTypes,
  type InjectionKey,
  type PropType
} from 'vue'
import {
  mergeTigerLocale,
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  getLocaleDirection,
  isBrowser,
  ThemeManager,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleDirection,
  type ColorScheme
} from '@expcat/tigercat-core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
  direction?: TigerLocaleDirection
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

export const configProviderProps = {
  locale: {
    type: [Object, Function, Promise] as PropType<TigerLocaleInput>,
    default: undefined
  },
  direction: {
    type: String as PropType<TigerLocaleDirection>,
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
}

export type VueConfigProviderProps = ExtractPropTypes<typeof configProviderProps>

export const ConfigProvider = defineComponent({
  name: 'TigerConfigProvider',
  props: configProviderProps,
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
        direction:
          props.direction ??
          resolvedLocale.value?.direction ??
          parent.value.direction ??
          (resolvedLocale.value?.locale ? getLocaleDirection(resolvedLocale.value) : undefined),
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

    let previousDir: string | null = null
    let previousDataDir: string | null = null
    watch(
      () => merged.value.direction,
      (direction) => {
        if (!direction || !isBrowser()) return

        const root = document.documentElement
        if (previousDir === null && previousDataDir === null) {
          previousDir = root.getAttribute('dir')
          previousDataDir = root.getAttribute('data-tiger-dir')
        }
        root.setAttribute('dir', direction)
        root.setAttribute('data-tiger-dir', direction)
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (!isBrowser()) return
      const root = document.documentElement
      if (previousDir === null) root.removeAttribute('dir')
      else root.setAttribute('dir', previousDir)
      if (previousDataDir === null) root.removeAttribute('data-tiger-dir')
      else root.setAttribute('data-tiger-dir', previousDataDir)
    })

    provide(TigerConfigKey, merged)

    return () => slots.default?.()
  }
})

export default ConfigProvider
