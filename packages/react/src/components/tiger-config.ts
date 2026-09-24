import React, { useContext } from 'react'
import { readDocumentOwnerLocale, type TigerConfig, type TigerLocale } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'

export const FALLBACK_CONFIG: TigerConfig = { locale: enUS }
export const TigerConfigContext = React.createContext<TigerConfig>(FALLBACK_CONFIG)

/**
 * Locale for this tree, or the document owner's locale when this tree has no provider.
 */
export function useResolvedTigerLocale(): Partial<TigerLocale> | undefined {
  const config = useContext(TigerConfigContext)
  if (config !== FALLBACK_CONFIG) return config.locale
  return readDocumentOwnerLocale()
}

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
