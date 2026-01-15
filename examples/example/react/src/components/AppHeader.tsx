import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@expcat/tigercat-react'
import { DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import ThemeSwitch from './ThemeSwitch'
import LanguageSwitch from './LanguageSwitch'

export interface AppHeaderProps {
  lang: DemoLang
  onLangChange: (lang: DemoLang) => void
  isSiderCollapsed: boolean
  onToggleSider: () => void
  rightHint?: string
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  lang,
  onLangChange,
  isSiderCollapsed,
  onToggleSider,
  rightHint
}) => {
  const siderLabel =
    lang === 'zh-CN'
      ? isSiderCollapsed
        ? '展开侧边栏'
        : '收起侧边栏'
      : isSiderCollapsed
        ? 'Expand sidebar'
        : 'Collapse sidebar'

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-baseline gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleSider}
            aria-label={siderLabel}
            className="size-8 p-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
            <span className="text-sm leading-none">{isSiderCollapsed ? '»' : '«'}</span>
          </Button>
          <Link
            to="/"
            aria-label={DEMO_APP_TITLE[lang]}
            className="text-base sm:text-lg font-semibold text-gray-900 truncate dark:text-gray-100 hover:text-[var(--tiger-primary,#2563eb)]">
            {DEMO_APP_TITLE[lang]}
          </Link>
          {rightHint && (
            <div className="text-xs text-gray-500 truncate dark:text-gray-400">{rightHint}</div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitch value={lang} onChange={onLangChange} />
          <ThemeSwitch lang={lang} />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
