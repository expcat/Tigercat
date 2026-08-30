import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  resolveTigerConfig,
  ThemeManager,
  type TigerConfig,
  type ConfigProviderProps as CoreConfigProviderProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { createGlobalTigerLocaleHandle, type GlobalTigerLocaleHandle } from '../utils/global-locale'

export type { TigerConfig }

const TigerConfigContext = React.createContext<TigerConfig>({})

export interface ConfigProviderProps extends CoreConfigProviderProps {
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

  const value = useMemo<TigerConfig>(
    () =>
      resolveTigerConfig({
        locale: resolvedLocale,
        localeLoading,
        direction,
        theme,
        colorScheme,
        parent
      }),
    [resolvedLocale, localeLoading, direction, theme, colorScheme, parent]
  )

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
