import React, { useContext, useEffect, useMemo } from 'react'
import {
  mergeTigerLocale,
  ThemeManager,
  type TigerLocale,
  type ColorScheme
} from '@expcat/tigercat-core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  theme?: string
  colorScheme?: ColorScheme
}

const TigerConfigContext = React.createContext<TigerConfig>({})

export interface ConfigProviderProps {
  locale?: Partial<TigerLocale>
  theme?: string
  colorScheme?: ColorScheme
  children?: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  locale,
  theme,
  colorScheme,
  children
}) => {
  const parent = useContext(TigerConfigContext)

  const value = useMemo<TigerConfig>(() => {
    return {
      locale: mergeTigerLocale(parent.locale, locale),
      theme: theme ?? parent.theme,
      colorScheme: colorScheme ?? parent.colorScheme
    }
  }, [parent.locale, locale, theme, parent.theme, colorScheme, parent.colorScheme])

  useEffect(() => {
    if (value.theme) ThemeManager.setTheme(value.theme)
  }, [value.theme])

  useEffect(() => {
    if (value.colorScheme) ThemeManager.setColorScheme(value.colorScheme)
  }, [value.colorScheme])

  return <TigerConfigContext.Provider value={value}>{children}</TigerConfigContext.Provider>
}

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
