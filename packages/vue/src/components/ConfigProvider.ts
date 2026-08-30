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
  createDocumentConfigHandle,
  type TigerConfig,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleDirection,
  type ColorScheme,
  type DocumentConfigHandle
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
    const parentInjected = inject(TigerConfigKey, null)
    const isDocumentOwner = parentInjected === null
    const parent = parentInjected ?? computed(() => ({}) as TigerConfig)
    let globalLocaleHandle: GlobalTigerLocaleHandle | null = null
    let documentHandle: DocumentConfigHandle | null = null
    let didHydrateDocument = false

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

    watch(
      () => ({
        theme: merged.value.theme,
        colorScheme: merged.value.colorScheme,
        direction: merged.value.direction,
        lang: merged.value.locale?.locale
      }),
      (values) => {
        if (!isDocumentOwner) return
        if (!documentHandle) documentHandle = createDocumentConfigHandle()
        documentHandle.apply(values, { hydrateAuto: !didHydrateDocument })
        didHydrateDocument = true
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      globalLocaleHandle?.dispose()
      globalLocaleHandle = null
      documentHandle?.dispose()
      documentHandle = null
    })

    provide(TigerConfigKey, merged)

    return () => slots.default?.()
  }
})

export default ConfigProvider
