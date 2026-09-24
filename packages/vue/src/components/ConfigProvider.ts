import {
  defineComponent,
  computed,
  h,
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
  readDocumentOwnerLocale,
  devWarn,
  type TigerConfig,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleDirection,
  type ColorScheme,
  type DocumentConfigHandle
} from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { FeedbackDepthKey, FeedbackHost } from './FeedbackHost'
import { OverlayOutletProvider } from '../utils/overlay-outlet'
import {
  createTigerLocaleScope,
  createTigerThemeScope,
  createIconRegistry,
  type TigerLocaleScope,
  type TigerThemeScope,
  type IconRegistry,
  type TigerLocaleHandle
} from '@expcat/tigercat-core'

export type { TigerConfig }

export const TigerConfigKey: InjectionKey<ComputedRef<TigerConfig>> = Symbol('TigerConfig')

export function useTigerConfig(): ComputedRef<TigerConfig> {
  return inject(
    TigerConfigKey,
    computed(() => ({ locale: enUS }))
  )
}

/**
 * Locale for this tree, or the document owner's locale when this tree has no provider.
 * Imperative hosts mount outside the provider and use the second path.
 */
export function useResolvedTigerLocale(): ComputedRef<Partial<TigerLocale> | undefined> {
  const provided = inject(TigerConfigKey, null)
  return computed(() => provided?.value.locale ?? readDocumentOwnerLocale())
}

export const configProviderProps = {
  locale: {
    type: [Object, Function, Promise] as PropType<TigerLocaleInput>,
    default: undefined
  },
  dir: {
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
  inheritAttrs: false,
  props: configProviderProps,
  setup(props, { slots }) {
    const parentInjected = inject(TigerConfigKey, null)
    const isDocumentOwner = parentInjected === null
    const parent = parentInjected ?? computed(() => ({ locale: enUS }) as TigerConfig)
    const localeScope: TigerLocaleScope = createTigerLocaleScope()
    let localeHandle: TigerLocaleHandle | null = null
    let documentHandle: DocumentConfigHandle | null = null
    let nestedScope: TigerThemeScope | null = null
    const hostRef = ref<HTMLElement | null>(null)
    const ownedIcons = !parentInjected
    const iconRegistry: IconRegistry = parentInjected?.value.iconRegistry ?? createIconRegistry()

    const resolvedLocale = ref<Partial<TigerLocale> | undefined>(
      isLazyTigerLocale(props.locale) ? undefined : getImmediateTigerLocale(props.locale)
    )
    const localeLoading = ref(isLazyTigerLocale(props.locale))
    const localeLoadError = ref<Error | undefined>(undefined)
    let loadId = 0

    watch(
      () => props.locale,
      (locale) => {
        if (!isLazyTigerLocale(locale)) {
          resolvedLocale.value = getImmediateTigerLocale(locale)
          localeLoading.value = false
          localeLoadError.value = undefined
          return
        }

        const thisId = ++loadId
        localeLoading.value = true
        localeLoadError.value = undefined

        resolveTigerLocale(locale).then(
          (result) => {
            if (thisId === loadId) {
              resolvedLocale.value = result
              localeLoading.value = false
              localeLoadError.value = undefined
            }
          },
          (reason) => {
            if (thisId === loadId) {
              localeLoading.value = false
              localeLoadError.value = reason instanceof Error ? reason : new Error(String(reason))
              devWarn(
                'ConfigProvider.localeLoad',
                '[Tigercat] ConfigProvider failed to load locale; keeping the previous locale.'
              )
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
        localeLoadError: localeLoadError.value,
        direction: props.dir,
        theme: props.theme,
        colorScheme: props.colorScheme,
        iconRegistry,
        parent: parent.value
      })
    )

    watch(
      () => merged.value.locale,
      (locale) => {
        if (!localeHandle) localeHandle = localeScope.createHandle(locale)
        else localeHandle.update(locale)
      },
      { immediate: true }
    )

    watch(
      () => ({
        theme: merged.value.theme,
        colorScheme: merged.value.colorScheme,
        direction: merged.value.direction,
        lang: resolvedLocale.value?.locale,
        locale: merged.value.locale
      }),
      (values) => {
        if (!isDocumentOwner) return
        if (!documentHandle) documentHandle = createDocumentConfigHandle()
        documentHandle.apply({
          theme: values.theme,
          colorScheme: values.colorScheme,
          direction: values.direction,
          lang: values.lang
        })
        documentHandle.setLocale(values.locale)
      },
      { immediate: true }
    )

    watch(
      () => ({
        host: hostRef.value,
        theme: props.theme,
        colorScheme: props.colorScheme
      }),
      (values) => {
        if (isDocumentOwner) return
        if (!values.host || !values.theme) {
          nestedScope?.dispose()
          nestedScope = null
          return
        }
        if (!nestedScope) {
          nestedScope = createTigerThemeScope({
            root: values.host,
            nested: true,
            theme: values.theme,
            colorScheme: values.colorScheme ?? 'auto'
          })
        }
        nestedScope.setTheme(values.theme)
        if (values.colorScheme) nestedScope.setColorScheme(values.colorScheme)
        else nestedScope.apply()
      }
    )

    onBeforeUnmount(() => {
      localeHandle?.dispose()
      localeHandle = null
      if (ownedIcons) iconRegistry.dispose()
      documentHandle?.dispose()
      documentHandle = null
      nestedScope?.dispose()
      nestedScope = null
    })

    provide(TigerConfigKey, merged)
    provide(FeedbackDepthKey, inject(FeedbackDepthKey, 0) + 1)

    return () =>
      h(
        'div',
        {
          ref: hostRef,
          class: 'tiger-config-root',
          'data-tiger-config-root': '',
          dir: merged.value.direction,
          lang: resolvedLocale.value?.locale
        },
        h(OverlayOutletProvider, null, {
          default: () => [slots.default?.(), h(FeedbackHost)]
        })
      )
  }
})

export default ConfigProvider
