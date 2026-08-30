import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
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
    if (!isDocumentOwner) return
    const handle = createDocumentConfigHandle()
    documentHandleRef.current = handle
    return () => {
      handle.dispose()
      documentHandleRef.current = null
      hydratedDocumentRef.current = false
    }
  }, [isDocumentOwner])

  useEffect(() => {
    if (!documentHandleRef.current) return
    documentHandleRef.current.apply(
      {
        theme: value.theme,
        colorScheme: value.colorScheme,
        direction: value.direction
      },
      { hydrateAuto: !hydratedDocumentRef.current }
    )
    hydratedDocumentRef.current = true
  }, [value.theme, value.colorScheme, value.direction])

  return <TigerConfigContext.Provider value={value}>{children}</TigerConfigContext.Provider>
}

export function useTigerConfig(): TigerConfig {
  return useContext(TigerConfigContext)
}
