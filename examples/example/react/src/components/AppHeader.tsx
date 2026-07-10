import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@expcat/tigercat-react/Button'
import { DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import ThemeSwitch from './ThemeSwitch'
import DarkModeSwitch from './DarkModeSwitch'
import ModernStyleSwitch from './ModernStyleSwitch'
import LanguageSwitch from './LanguageSwitch'

export interface AppHeaderProps {
  lang: DemoLang
  onLangChange: (lang: DemoLang) => void
  isSiderCollapsed: boolean
  isMobile: boolean
  isCompactHeader: boolean
  onToggleSider: () => void
  rightHint?: string
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  lang,
  onLangChange,
  isSiderCollapsed,
  isMobile,
  isCompactHeader,
  onToggleSider,
  rightHint
}) => {
  const siderLabel = isMobile
    ? lang === 'zh-CN'
      ? '打开菜单'
      : 'Open menu'
    : lang === 'zh-CN'
      ? isSiderCollapsed
        ? '展开侧边栏'
        : '收起侧边栏'
      : isSiderCollapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar'

  const siderIcon = isMobile ? '☰' : isSiderCollapsed ? '»' : '«'
  const settingsLabel = lang === 'zh-CN' ? '设置' : 'Settings'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-baseline gap-3">
          <Button
            htmlType="button"
            variant="outline"
            size="sm"
            onClick={onToggleSider}
            aria-label={siderLabel}
            className="size-8 p-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
            <span className="text-sm leading-none">{siderIcon}</span>
          </Button>
          <Link
            to="/"
            aria-label={DEMO_APP_TITLE[lang]}
            className="text-base sm:text-lg font-semibold text-gray-900 truncate dark:text-gray-100 hover:text-[var(--tiger-primary,#2563eb)]">
            {DEMO_APP_TITLE[lang]}
          </Link>
          {rightHint && (
            <div className="hidden text-xs text-gray-500 truncate dark:text-gray-400 sm:block">
              {rightHint}
            </div>
          )}
        </div>

        {isCompactHeader ? (
          <details className="relative shrink-0 sm:hidden">
            <summary className="flex size-8 cursor-pointer list-none select-none items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900 [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="text-base leading-none">
                ⚙
              </span>
              <span className="sr-only">{settingsLabel}</span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
              <div className="flex flex-col gap-3">
                <LanguageSwitch value={lang} onChange={onLangChange} />
                <ThemeSwitch lang={lang} />
                <ModernStyleSwitch lang={lang} />
                <DarkModeSwitch lang={lang} />
              </div>
            </div>
          </details>
        ) : (
          <div className="hidden items-center gap-3 sm:flex">
            <LanguageSwitch value={lang} onChange={onLangChange} />
            <ThemeSwitch lang={lang} />
            <ModernStyleSwitch lang={lang} />
            <DarkModeSwitch lang={lang} />
          </div>
        )}
      </div>
    </header>
  )
}

export default AppHeader
