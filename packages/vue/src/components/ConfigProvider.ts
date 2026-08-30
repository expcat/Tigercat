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
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  resolveTigerConfig,
  isBrowser,
  ThemeManager,
  type TigerConfig,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleDirection,
  type ColorScheme
} from '@expcat/tigercat-core'
import { createGlobalTigerLocaleHandle, type GlobalTigerLocaleHandle } from '../utils/global-locale'

export type { TigerConfig }

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
    let globalLocaleHandle: GlobalTigerLocaleHandle | null = null

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

    const merged = computed<TigerConfig>(() =>
      resolveTigerConfig({
        locale: resolvedLocale.value,
        localeLoading: localeLoading.value,
        direction: props.direction,
        theme: props.theme,
        colorScheme: props.colorScheme,
        parent: parent.value
      })
    )

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

    watch(
      () => merged.value.locale,
      (locale) => {
        if (!globalLocaleHandle) {
          globalLocaleHandle = createGlobalTigerLocaleHandle(locale)
        } else {
          globalLocaleHandle.update(locale)
        }
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
      globalLocaleHandle?.dispose()
      globalLocaleHandle = null

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
