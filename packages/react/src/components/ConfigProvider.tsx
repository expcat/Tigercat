import React, { useContext, useMemo } from 'react'
import { mergeTigerLocale, type TigerLocale } from '@tigercat/core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
}

const TigerConfigContext = React.createContext<TigerConfig>({})

export interface ConfigProviderProps {
  locale?: Partial<TigerLocale>
  children?: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ locale, children }) => {
  const parent = useContext(TigerConfigContext)

  const value = useMemo<TigerConfig>(() => {
    return {
      locale: mergeTigerLocale(parent.locale, locale)
    }
  }, [parent.locale, locale])

  return <TigerConfigContext.Provider value={value}>{children}</TigerConfigContext.Provider>
}

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
