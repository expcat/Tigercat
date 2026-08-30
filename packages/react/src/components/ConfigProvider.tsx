import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  resolveTigerConfig,
  createDocumentConfigHandle,
  type TigerConfig,
  type ConfigProviderProps as CoreConfigProviderProps,
  type TigerLocale,
  type DocumentConfigHandle
} from '@expcat/tigercat-core'
import { createGlobalTigerLocaleHandle, type GlobalTigerLocaleHandle } from '../utils/global-locale'

export type { TigerConfig }

const EMPTY_CONFIG: TigerConfig = {}
const TigerConfigContext = React.createContext<TigerConfig>(EMPTY_CONFIG)

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
  const isDocumentOwner = parent === EMPTY_CONFIG
  const globalLocaleHandleRef = useRef<GlobalTigerLocaleHandle | null>(null)
  const documentHandleRef = useRef<DocumentConfigHandle | null>(null)
  const hydratedDocumentRef = useRef(false)

  const isLazy = isLazyTigerLocale(locale)
  const [lazyLocale, setLazyLocale] = useState<Partial<TigerLocale> | undefined>(undefined)
  const [localeLoading, setLocaleLoading] = useState(isLazy)
  const resolvedLocale = isLazy ? lazyLocale : getImmediateTigerLocale(locale)

  useEffect(() => {
    if (!isLazyTigerLocale(locale)) {
      setLazyLocale(undefined)
      setLocaleLoading(false)
      return
    }

    let cancelled = false
    setLocaleLoading(true)

    resolveTigerLocale(locale).then(
      (result) => {
        if (!cancelled) {
          setLazyLocale(result)
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

  if (!globalLocaleHandleRef.current) {
    globalLocaleHandleRef.current = createGlobalTigerLocaleHandle(value.locale)
  } else {
    globalLocaleHandleRef.current.update(value.locale)
  }

  useLayoutEffect(() => {
    if (!globalLocaleHandleRef.current) {
      globalLocaleHandleRef.current = createGlobalTigerLocaleHandle(value.locale)
    }
    return () => {
      globalLocaleHandleRef.current?.dispose()
      globalLocaleHandleRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (!isDocumentOwner) return
    const handle = createDocumentConfigHandle()
    documentHandleRef.current = handle
    return () => {
      handle.dispose()
      documentHandleRef.current = null
      hydratedDocumentRef.current = false
    }
  }, [isDocumentOwner])

  useLayoutEffect(() => {
    if (!documentHandleRef.current) return
    documentHandleRef.current.apply(
      {
        theme: value.theme,
        colorScheme: value.colorScheme,
        direction: value.direction,
        lang: value.locale?.locale
      },
      { hydrateAuto: !hydratedDocumentRef.current }
    )
    hydratedDocumentRef.current = true
  }, [value.theme, value.colorScheme, value.direction, value.locale?.locale])

  return <TigerConfigContext.Provider value={value}>{children}</TigerConfigContext.Provider>
}

ConfigProvider.displayName = 'TigerConfigProvider'

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
