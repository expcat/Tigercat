import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import type { DemoLang } from '@demo-shared/app-config'
import { getDemoTigerLocale } from '@demo-shared/tiger-locale'
import { ConfigProvider, Link } from '@expcat/tigercat-react'
import { getStoredLang, getStoredTheme, setStoredLang } from '@demo-shared/prefs'
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
  const [sections, setSections] = useState<DemoSection[]>([])
  const [pageTitle, setPageTitle] = useState('')
  const [lang, setLang] = useState<DemoLang>(() => getStoredLang())

  const isHome = useMemo(() => location.pathname === '/', [location.pathname])

  useEffect(() => {
    setStoredLang(lang)
  }, [lang])

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

  const headerTitle = useMemo(() => {
    if (pageTitle) return pageTitle
    const lastSegment = location.pathname.split('/').filter(Boolean).pop()
    return lastSegment ? lastSegment : ''
  }, [location.pathname, pageTitle])

  const tigerLocale = useMemo(() => getDemoTigerLocale(lang), [lang])

  return (
    <LangContext.Provider value={{ lang }}>
      <ConfigProvider locale={tigerLocale}>
        <div className="h-screen overflow-hidden box-border bg-gray-50 dark:bg-gray-950 pt-14">
          <AppHeader lang={lang} onLangChange={setLang} rightHint="React" />

          <div className="flex h-full">
            <AppSider lang={lang} />

            <main className="flex-1 min-w-0 h-full overflow-hidden">
              <div className="h-full overflow-y-auto">
                {!isHome && (headerTitle || sections.length > 0) && (
                  <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
                    <div className="px-6 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                          {headerTitle}
                        </div>
                        {sections.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {sections.map((s: DemoSection) => (
                              <Link
                                key={s.id}
                                href={`#${s.id}`}
                                underline={false}
                                variant="default"
                                size="sm"
                                className="text-sm px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                onClick={(e) => {
                                  e.preventDefault()
                                  const el = document.getElementById(s.id)
                                  el?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                  })
                                  try {
                                    window.history.replaceState(null, '', `#${s.id}`)
                                  } catch {
                                    // ignore
                                  }
                                }}>
                                {s.label}
                              </Link>
                            ))}
                          </div>
                        )}
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
