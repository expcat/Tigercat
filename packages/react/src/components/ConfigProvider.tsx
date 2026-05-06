import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  mergeTigerLocale,
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  ThemeManager,
  type TigerLocale,
  type TigerLocaleInput,
  type ColorScheme
} from '@expcat/tigercat-core'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
  theme?: string
  colorScheme?: ColorScheme
}

const TigerConfigContext = React.createContext<TigerConfig>({})

export interface ConfigProviderProps {
  locale?: TigerLocaleInput
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

  const isLazy = isLazyTigerLocale(locale)
  const immediateLocale = isLazy ? undefined : getImmediateTigerLocale(locale)

  const [resolvedLocale, setResolvedLocale] = useState<Partial<TigerLocale> | undefined>(
    immediateLocale
  )
  const [localeLoading, setLocaleLoading] = useState(isLazy)

  useEffect(() => {
    if (!isLazyTigerLocale(locale)) {
      setResolvedLocale(getImmediateTigerLocale(locale))
      setLocaleLoading(false)
      return
    }

    let cancelled = false
    setLocaleLoading(true)

    resolveTigerLocale(locale).then(
      (result) => {
        if (!cancelled) {
          setResolvedLocale(result)
          setLocaleLoading(false)
        }
      },
      () => {
        if (!cancelled) {
          setLocaleLoading(false)
        }
      }
    )

    return () => {
      cancelled = true
    }
  }, [locale])

  const value = useMemo<TigerConfig>(() => {
    return {
      locale: mergeTigerLocale(parent.locale, resolvedLocale),
      localeLoading: localeLoading || parent.localeLoading,
      theme: theme ?? parent.theme,
      colorScheme: colorScheme ?? parent.colorScheme
    }
  }, [parent.locale, resolvedLocale, localeLoading, parent.localeLoading, theme, parent.theme, colorScheme, parent.colorScheme])

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
