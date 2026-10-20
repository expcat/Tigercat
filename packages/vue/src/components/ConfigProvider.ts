import {
  defineComponent,
  computed,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type ExtractPropTypes,
  type PropType
} from 'vue'
import {
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  resolveTigerConfig,
  createDocumentConfigHandle,
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
import { TigerConfigKey, TigerDocumentOwnerKey } from './tiger-config'
import { OverlayOutletProvider } from '../utils/overlay-outlet'
import {
  createTigerThemeScope,
  createIconRegistry,
  type TigerThemeScope,
  type IconRegistry
} from '@expcat/tigercat-core'

export type { TigerConfig }
export { TigerConfigKey, useResolvedTigerLocale, useTigerConfig } from './tiger-config'

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
  },
  document: {
    type: Boolean,
    default: true
  },
  /**
   * App-owned icon registry. Wins over the parent registry; never disposed
   * by this provider.
   */
  iconRegistry: {
    type: Object as PropType<IconRegistry>,
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
    const parentOwnerRef = inject(TigerDocumentOwnerKey, null)
    const parentOwnsDocument = computed(() => parentOwnerRef?.value ?? false)
    const isDocumentOwner = computed(() => props.document !== false && !parentOwnsDocument.value)
    const parent = parentInjected ?? computed(() => ({ locale: enUS }) as TigerConfig)
    let documentHandle: DocumentConfigHandle | null = null
    let nestedScope: TigerThemeScope | null = null
    const hostRef = ref<HTMLElement | null>(null)
    // Explicit prop wins over the parent registry; the fallback is created on
    // first use and disposed on unmount. Registries passed in stay caller-owned.
    let ownedRegistry: IconRegistry | null = null
    const iconRegistry = computed<IconRegistry>(() => {
      const provided = props.iconRegistry ?? parent.value.iconRegistry
      if (provided) return provided
      ownedRegistry ??= createIconRegistry()
      return ownedRegistry
    })

    const resolvedLocale = ref<Partial<TigerLocale> | undefined>(
      isLazyTigerLocale(props.locale) ? undefined : getImmediateTigerLocale(props.locale)
    )
    const localeLoading = ref(isLazyTigerLocale(props.locale))
    const localeLoadError = ref<Error | undefined>(undefined)
    let loadId = 0

    watch(
      () => props.locale,
      (locale) => {
        const thisId = ++loadId
        if (!isLazyTigerLocale(locale)) {
          resolvedLocale.value = getImmediateTigerLocale(locale)
          localeLoading.value = false
          localeLoadError.value = undefined
          return
        }

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
        iconRegistry: iconRegistry.value,
        parent: parent.value
      })
    )

    watch(
      () => ({
        ownsDocument: isDocumentOwner.value,
        theme: merged.value.theme,
        colorScheme: merged.value.colorScheme,
        direction: merged.value.direction,
        lang: resolvedLocale.value?.locale,
        locale: merged.value.locale
      }),
      (values) => {
        if (!values.ownsDocument) {
          documentHandle?.dispose()
          documentHandle = null
          return
        }
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
        blocked: isDocumentOwner.value || props.document === false,
        host: hostRef.value,
        theme: props.theme,
        colorScheme: props.colorScheme ?? parent.value.colorScheme
      }),
      (values) => {
        if (values.blocked) {
          nestedScope?.dispose()
          nestedScope = null
          return
        }
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
        // Reset to auto instead of re-applying a stale explicit scheme.
        nestedScope.setColorScheme(values.colorScheme ?? 'auto')
      }
    )

    onBeforeUnmount(() => {
      ownedRegistry?.dispose()
      ownedRegistry = null
      documentHandle?.dispose()
      documentHandle = null
      nestedScope?.dispose()
      nestedScope = null
    })

    provide(TigerConfigKey, merged)
    provide(
      TigerDocumentOwnerKey,
      computed(() => isDocumentOwner.value || parentOwnsDocument.value)
    )
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
