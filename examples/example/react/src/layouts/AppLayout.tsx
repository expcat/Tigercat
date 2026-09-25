import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb } from '@expcat/tigercat-react/Breadcrumb'
import { BreadcrumbItem } from '@expcat/tigercat-react/BreadcrumbItem'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import { Outlet, useLocation } from 'react-router-dom'
import { overlayZIndexClass } from '@expcat/tigercat-core'
import type { DemoLang } from '@demo-shared/app-config'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import { collectDemoSections, sameDemoSections } from '@demo-shared/demo-sections'
import {
  getStoredColorScheme,
  getStoredLang,
  getStoredSiderCollapsed,
  getStoredTheme,
  setStoredDarkMode,
  setStoredLang,
  setStoredSiderCollapsed,
  setStoredTheme
} from '@demo-shared/prefs'
import { demoChrome } from '@demo-shared/chrome'
import { LangContext } from '../context/lang'
import AppHeader from '../components/AppHeader'
import AppSider from '../components/AppSider'
import A11yDebugPanel from '../components/A11yDebugPanel'

const isDev = import.meta.env.DEV

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const pageRootRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const [sections, setSections] = useState<ReturnType<typeof collectDemoSections>>([])
  const [anchorOffset, setAnchorOffset] = useState(0)
  const [pageTitle, setPageTitle] = useState('')
  const [lang, setLang] = useState<DemoLang>(() => getStoredLang())
  const [theme, setTheme] = useState(() => getStoredTheme())
  const [colorScheme, setColorScheme] = useState(() => getStoredColorScheme())
  const [isSiderCollapsed, setIsSiderCollapsed] = useState<boolean>(() => getStoredSiderCollapsed())
  const [isMobile, setIsMobile] = useState(false)
  const [isCompactHeader, setIsCompactHeader] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const compactMql = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setIsSiderCollapsed(true)
    }
    const compactHandler = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsCompactHeader(e.matches)
    }
    handler(mql)
    compactHandler(compactMql)
    mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void)
    compactMql.addEventListener('change', compactHandler as (e: MediaQueryListEvent) => void)
    return () => {
      mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void)
      compactMql.removeEventListener('change', compactHandler as (e: MediaQueryListEvent) => void)
    }
  }, [])

  useEffect(() => {
    setStoredLang(lang)
  }, [lang])

  useEffect(() => {
    setStoredTheme(theme)
  }, [theme])

  useEffect(() => {
    setStoredDarkMode(colorScheme === 'dark')
  }, [colorScheme])

  useEffect(() => {
    if (!isMobile) setStoredSiderCollapsed(isSiderCollapsed)
  }, [isSiderCollapsed, isMobile])

  // Scroll to top & auto-close sider on route change
  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
    if (isMobile) setIsSiderCollapsed(true)
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const root = pageRootRef.current
    if (!root) return

    const collect = () => {
      const h1 = root.querySelector('h1')
      setPageTitle((h1?.textContent ?? '').trim())
      const nextSections = collectDemoSections(root)
      setSections((current) => (sameDemoSections(current, nextSections) ? current : nextSections))
    }

    collect()
    const observer = new MutationObserver(() => collect())
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location.pathname])

  const headerTitle = pageTitle
    ? pageTitle
    : location.pathname.split('/').filter(Boolean).pop() || ''

  const tigerLocale = getDemoTigerLocale(lang)

  const homeLabel = demoChrome(lang).home

  const sectionItems = useMemo(
    () =>
      sections.map((section) => ({
        key: section.id,
        href: `#${section.id}`,
        label: section.label
      })),
    [sections]
  )

  useEffect(() => {
    const el = stickyRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      setAnchorOffset(Math.ceil(el.getBoundingClientRect().height))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [location.pathname, sectionItems.length])

  return (
    <LangContext.Provider value={{ lang }}>
      <ConfigProvider locale={tigerLocale} theme={theme} colorScheme={colorScheme}>
        <div className="h-screen overflow-hidden box-border bg-gray-50 dark:bg-gray-950 pt-14">
          <AppHeader
            lang={lang}
            onLangChange={setLang}
            theme={theme}
            onThemeChange={setTheme}
            dark={colorScheme === 'dark'}
            onDarkChange={(enabled) => setColorScheme(enabled ? 'dark' : 'light')}
            rightHint="React"
            isSiderCollapsed={isSiderCollapsed}
            isMobile={isMobile}
            isCompactHeader={isCompactHeader}
            onToggleSider={() => setIsSiderCollapsed((prev) => !prev)}
          />

          <div className="flex h-full">
            <AppSider
              lang={lang}
              isSiderCollapsed={isSiderCollapsed}
              isMobile={isMobile}
              onClose={() => setIsSiderCollapsed(true)}
            />

            <main className="flex-1 min-w-0 h-full overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{ ['--demo-anchor-offset' as string]: `${anchorOffset + 8}px` }}>
                {!isHome && (headerTitle || sections.length > 0) && (
                  <div
                    ref={stickyRef}
                    className={`sticky top-0 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80 ${overlayZIndexClass.viewport}`}>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-6 py-2">
                      <Breadcrumb className="w-auto shrink-0">
                        <BreadcrumbItem href="/">{homeLabel}</BreadcrumbItem>
                        <BreadcrumbItem current>{headerTitle}</BreadcrumbItem>
                      </Breadcrumb>
                      {sectionItems.length > 0 ? (
                        <ScrollSpy
                          items={sectionItems}
                          orientation="horizontal"
                          targetOffset={anchorOffset}
                          getContainer={() => scrollContainerRef.current || window}
                          className="min-w-0 justify-self-end [&_ul]:max-w-full [&_ul]:flex-nowrap [&_ul]:overflow-x-auto [&_li]:shrink-0"
                        />
                      ) : null}
                    </div>
                  </div>
                )}

                <div ref={pageRootRef} className="px-6 py-6">
                  <Suspense
                    fallback={
                      <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
                    }>
                    <Outlet />
                  </Suspense>
                </div>
              </div>
            </main>
          </div>
          {isDev && <A11yDebugPanel lang={lang} />}
        </div>
      </ConfigProvider>
    </LangContext.Provider>
  )
}

export default AppLayout
