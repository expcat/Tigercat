import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import type { DemoLang } from '@demo-shared/app-config'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import {
  Anchor,
  AnchorLink,
  Breadcrumb,
  BreadcrumbItem,
  ConfigProvider
} from '@expcat/tigercat-react'
import {
  getStoredLang,
  getStoredSiderCollapsed,
  getStoredTheme,
  setStoredLang,
  setStoredSiderCollapsed
} from '@demo-shared/prefs'
import { applyTheme } from '@demo-shared/themes'
import { LangContext } from '../context/lang'
import AppHeader from '../components/AppHeader'
import AppSider from '../components/AppSider'

interface DemoSection {
  id: string
  label: string
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const pageRootRef = useRef<HTMLDivElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [sections, setSections] = useState<DemoSection[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [lang, setLang] = useState<DemoLang>(() => getStoredLang())
  const [isSiderCollapsed, setIsSiderCollapsed] = useState<boolean>(() => getStoredSiderCollapsed())

  const isHome = location.pathname === '/'

  useEffect(() => {
    setStoredLang(lang)
  }, [lang])

  useEffect(() => {
    setStoredSiderCollapsed(isSiderCollapsed)
  }, [isSiderCollapsed])

  useEffect(() => {
    const storedTheme = getStoredTheme()
    applyTheme(storedTheme)
  }, [])

  useEffect(() => {
    const root = pageRootRef.current
    if (!root) return

    const h1 = root.querySelector('h1')
    const nextTitle = (h1?.textContent ?? '').trim()
    setPageTitle(nextTitle)

    const headings = Array.from(root.querySelectorAll('h2'))
      .map((el) => el as HTMLHeadingElement)
      .filter((el) => el.textContent && el.textContent.trim().length > 0)

    const usedIds = new Set<string>()
    const nextSections: DemoSection[] = []

    for (const h2 of headings) {
      const label = (h2.textContent ?? '').trim()
      let id = h2.id?.trim()
      if (!id) id = slugify(label)
      if (!id) continue

      let uniqueId = id
      let counter = 2
      while (usedIds.has(uniqueId) || document.getElementById(uniqueId)) {
        uniqueId = `${id}-${counter}`
        counter += 1
      }

      usedIds.add(uniqueId)
      h2.id = uniqueId
      h2.setAttribute('data-demo-anchor', 'true')

      nextSections.push({ id: uniqueId, label })
    }

    setSections(nextSections)
  }, [location.pathname])

  const headerTitle = pageTitle
    ? pageTitle
    : location.pathname.split('/').filter(Boolean).pop() || ''

  const tigerLocale = getDemoTigerLocale(lang)

  const homeLabel = lang === 'zh-CN' ? '首页' : 'Home'

  const handleAnchorClick = (_event: React.MouseEvent, href: string) => {
    try {
      window.history.replaceState(null, '', href)
    } catch {
      // ignore
    }
  }

  return (
    <LangContext.Provider value={{ lang }}>
      <ConfigProvider locale={tigerLocale}>
        <div className="h-screen overflow-hidden box-border bg-gray-50 dark:bg-gray-950 pt-14">
          <AppHeader
            lang={lang}
            onLangChange={setLang}
            rightHint="React"
            isSiderCollapsed={isSiderCollapsed}
            onToggleSider={() => setIsSiderCollapsed((prev) => !prev)}
          />

          <div className="flex h-full">
            <AppSider lang={lang} isSiderCollapsed={isSiderCollapsed} />

            <main className="flex-1 min-w-0 h-full overflow-hidden">
              <div ref={scrollContainerRef} className="h-full overflow-y-auto overflow-x-hidden">
                {!isHome && (headerTitle || sections.length > 0) && (
                  <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
                    <div className="px-6 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                          <Breadcrumb
                            extra={
                              sections.length > 0 ? (
                                <Anchor
                                  affix={false}
                                  direction="horizontal"
                                  getContainer={() => scrollContainerRef.current || window}
                                  onClick={handleAnchorClick}
                                  className="flex items-center justify-end">
                                  {sections.map((s: DemoSection) => (
                                    <AnchorLink
                                      key={s.id}
                                      href={`#${s.id}`}
                                      title={s.label}
                                      className="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    />
                                  ))}
                                </Anchor>
                              ) : null
                            }>
                            <BreadcrumbItem href="/">{homeLabel}</BreadcrumbItem>
                            <BreadcrumbItem current>{headerTitle}</BreadcrumbItem>
                          </Breadcrumb>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={pageRootRef} className="px-6 py-6">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </ConfigProvider>
    </LangContext.Provider>
  )
}

export default AppLayout
