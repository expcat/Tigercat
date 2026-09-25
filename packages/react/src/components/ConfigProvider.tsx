import React, { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  isLazyTigerLocale,
  getImmediateTigerLocale,
  resolveTigerLocale,
  resolveTigerConfig,
  createDocumentConfigHandle,
  devWarn,
  type TigerConfig,
  type ConfigProviderProps as CoreConfigProviderProps,
  type TigerLocale,
  type DocumentConfigHandle
} from '@expcat/tigercat-core'
import { OverlayOutletProvider } from '../utils/overlay-outlet'
import { FeedbackDepthContext, FeedbackHost } from './FeedbackHost'
import { FALLBACK_CONFIG, TigerConfigContext, TigerDocumentOwnerContext } from './tiger-config'
import {
  createTigerLocaleScope,
  createTigerThemeScope,
  createIconRegistry,
  type TigerLocaleHandle,
  type TigerThemeScope,
  type IconRegistry
} from '@expcat/tigercat-core'

export type { TigerConfig }
export { useResolvedTigerLocale, useTigerConfig } from './tiger-config'

export interface ConfigProviderProps extends CoreConfigProviderProps {
  children?: React.ReactNode
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  locale,
  dir,
  theme,
  colorScheme,
  document: documentOwner = true,
  children
}) => {
  const parent = useContext(TigerConfigContext)
  const parentOwnsDocument = useContext(TigerDocumentOwnerContext)
  const feedbackDepth = useContext(FeedbackDepthContext) + 1
  const isDocumentOwner = documentOwner !== false && !parentOwnsDocument
  const nestedScheme = colorScheme ?? parent.colorScheme
  const localeScopeRef = useRef(createTigerLocaleScope())
  const localeHandleRef = useRef<TigerLocaleHandle | null>(null)
  const documentHandleRef = useRef<DocumentConfigHandle | null>(null)
  const nestedScopeRef = useRef<TigerThemeScope | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const iconRegistryRef = useRef<IconRegistry | null>(null)
  if (!iconRegistryRef.current) {
    iconRegistryRef.current = parent.iconRegistry ?? createIconRegistry()
  }

  const isLazy = isLazyTigerLocale(locale)
  const [lazyLocale, setLazyLocale] = useState<Partial<TigerLocale> | undefined>(undefined)
  const [localeLoading, setLocaleLoading] = useState(isLazy)
  const [localeLoadError, setLocaleLoadError] = useState<Error | undefined>(undefined)
  const resolvedLocale = isLazy ? lazyLocale : getImmediateTigerLocale(locale)
  const layerLang = resolvedLocale?.locale

  useEffect(() => {
    if (!isLazyTigerLocale(locale)) {
      setLazyLocale(getImmediateTigerLocale(locale))
      setLocaleLoading(false)
      setLocaleLoadError(undefined)
      return
    }

    let cancelled = false
    setLocaleLoading(true)
    setLocaleLoadError(undefined)

    resolveTigerLocale(locale).then(
      (result) => {
        if (!cancelled) {
          setLazyLocale(result)
          setLocaleLoading(false)
          setLocaleLoadError(undefined)
        }
      },
      (reason) => {
        if (!cancelled) {
          const error = reason instanceof Error ? reason : new Error(String(reason))
          setLocaleLoading(false)
          setLocaleLoadError(error)
          devWarn(
            'ConfigProvider.localeLoad',
            '[Tigercat] ConfigProvider failed to load locale; keeping the previous locale.'
          )
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
        localeLoadError,
        direction: dir,
        theme,
        colorScheme,
        iconRegistry: iconRegistryRef.current ?? undefined,
        parent
      }),
    [resolvedLocale, localeLoading, localeLoadError, dir, theme, colorScheme, parent]
  )

  if (!localeHandleRef.current) {
    localeHandleRef.current = localeScopeRef.current.createHandle(value.locale)
  } else {
    localeHandleRef.current.update(value.locale)
  }

  useLayoutEffect(() => {
    const registry = iconRegistryRef.current
    const ownsRegistry = parent.iconRegistry == null
    return () => {
      localeHandleRef.current?.dispose()
      localeHandleRef.current = null
      if (ownsRegistry) registry?.dispose()
    }
  }, [parent.iconRegistry])

  useLayoutEffect(() => {
    if (!isDocumentOwner) return
    const handle = createDocumentConfigHandle()
    documentHandleRef.current = handle
    return () => {
      handle.dispose()
      documentHandleRef.current = null
    }
  }, [isDocumentOwner])

  useLayoutEffect(() => {
    if (isDocumentOwner || documentOwner === false) return
    const host = hostRef.current
    if (!host || !theme) {
      nestedScopeRef.current?.dispose()
      nestedScopeRef.current = null
      return
    }
    if (!nestedScopeRef.current) {
      nestedScopeRef.current = createTigerThemeScope({
        root: host,
        nested: true,
        theme,
        colorScheme: nestedScheme ?? 'auto'
      })
    }
    nestedScopeRef.current.setTheme(theme)
    if (nestedScheme) nestedScopeRef.current.setColorScheme(nestedScheme)
    else nestedScopeRef.current.apply()
    return () => {
      nestedScopeRef.current?.dispose()
      nestedScopeRef.current = null
    }
  }, [isDocumentOwner, documentOwner, theme, nestedScheme])

  useLayoutEffect(() => {
    if (!documentHandleRef.current) return
    documentHandleRef.current.apply({
      theme: value.theme,
      colorScheme: value.colorScheme,
      direction: value.direction,
      lang: layerLang
    })
    documentHandleRef.current.setLocale(value.locale)
  }, [value.theme, value.colorScheme, value.direction, layerLang, value.locale])

  return (
    <TigerConfigContext.Provider value={value}>
      <TigerDocumentOwnerContext.Provider value={isDocumentOwner || parentOwnsDocument}>
        <div
          ref={hostRef}
          className="tiger-config-root"
          data-tiger-config-root=""
          dir={value.direction}
          lang={layerLang}>
          <FeedbackDepthContext.Provider value={feedbackDepth}>
            <OverlayOutletProvider>
              {children}
              <FeedbackHost />
            </OverlayOutletProvider>
          </FeedbackDepthContext.Provider>
        </div>
      </TigerDocumentOwnerContext.Provider>
    </TigerConfigContext.Provider>
  )
}

ConfigProvider.displayName = 'TigerConfigProvider'
