import {
  defineComponent,
  computed,
  inject,
  provide,
  type ComputedRef,
  type InjectionKey,
  type PropType
} from 'vue'
import { mergeTigerLocale, type TigerLocale } from '@tigercat/core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
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
    }
  },
  setup(props, { slots }) {
    const parent = useTigerConfig()

    const merged = computed<TigerConfig>(() => {
      return {
        locale: mergeTigerLocale(parent.value.locale, props.locale)
      }
    })

    provide(TigerConfigKey, merged)

    return () => slots.default?.()
  }
})

export default ConfigProvider
