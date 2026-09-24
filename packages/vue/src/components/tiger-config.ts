import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import { readDocumentOwnerLocale, type TigerConfig, type TigerLocale } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'

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
