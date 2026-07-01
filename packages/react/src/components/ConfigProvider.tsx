import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  mergeTigerLocale,
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  getLocaleDirection,
  ThemeManager,
  type TigerLocale,
  type TigerLocaleInput,
  type TigerLocaleDirection,
  type ColorScheme
} from '@expcat/tigercat-core'
import { createGlobalTigerLocaleHandle, type GlobalTigerLocaleHandle } from '../utils/global-locale'

export interface TigerConfig {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
  direction?: TigerLocaleDirection
  theme?: string
  colorScheme?: ColorScheme
}

const TigerConfigContext = React.createContext<TigerConfig>({})

export interface ConfigProviderProps {
  locale?: TigerLocaleInput
  direction?: TigerLocaleDirection
  theme?: string
  colorScheme?: ColorScheme
  children?: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  locale,
  direction,
  theme,
  colorScheme,
  children
}) => {
  const parent = useContext(TigerConfigContext)
  const globalLocaleHandleRef = useRef<GlobalTigerLocaleHandle | null>(null)

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
      direction:
        direction ??
        resolvedLocale?.direction ??
        parent.direction ??
        (resolvedLocale?.locale ? getLocaleDirection(resolvedLocale) : undefined),
      theme: theme ?? parent.theme,
      colorScheme: colorScheme ?? parent.colorScheme
    }
  }, [
    parent.locale,
    resolvedLocale,
    localeLoading,
    parent.localeLoading,
    direction,
    parent.direction,
    theme,
    parent.theme,
    colorScheme,
    parent.colorScheme
  ])

  useEffect(() => {
    if (value.theme) ThemeManager.setTheme(value.theme)
  }, [value.theme])

  useEffect(() => {
    if (value.colorScheme) ThemeManager.setColorScheme(value.colorScheme)
  }, [value.colorScheme])

  useEffect(() => {
    globalLocaleHandleRef.current = createGlobalTigerLocaleHandle(value.locale)
    return () => {
      globalLocaleHandleRef.current?.dispose()
      globalLocaleHandleRef.current = null
    }
  }, [])

  useEffect(() => {
    globalLocaleHandleRef.current?.update(value.locale)
  }, [value.locale])

  useEffect(() => {
    if (!value.direction || typeof document === 'undefined') return

    const root = document.documentElement
    const previousDir = root.getAttribute('dir')
    const previousDataDir = root.getAttribute('data-tiger-dir')
    root.setAttribute('dir', value.direction)
    root.setAttribute('data-tiger-dir', value.direction)

    return () => {
      if (previousDir === null) root.removeAttribute('dir')
      else root.setAttribute('dir', previousDir)
      if (previousDataDir === null) root.removeAttribute('data-tiger-dir')
      else root.setAttribute('data-tiger-dir', previousDataDir)
    }
  }, [value.direction])

  return <TigerConfigContext.Provider value={value}>{children}</TigerConfigContext.Provider>
}

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
