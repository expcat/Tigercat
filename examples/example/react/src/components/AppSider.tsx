import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { Collapse, CollapsePanel, Button } from '@expcat/tigercat-react'
import { DEMO_NAV_GROUPS, DEMO_APP_TITLE, type DemoLang } from '@demo-shared/app-config'
import { getStoredCollapsedNavGroups, setStoredCollapsedNavGroups } from '@demo-shared/prefs'

export interface AppSiderProps {
  lang: DemoLang
  isSiderCollapsed: boolean
  isMobile: boolean
  onClose: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function getAbbr(label: string) {
  const trimmed = (label ?? '').trim()
  if (!trimmed) return '?'
  const first = Array.from(trimmed)[0]
  return first ? first.toUpperCase() : '?'
}

function isActivePath(currentPath: string, targetPath: string) {
  if (targetPath === '/') return currentPath === '/'
  return currentPath === targetPath
}

export const AppSider: React.FC<AppSiderProps> = ({
  lang,
  isSiderCollapsed,
  isMobile,
  onClose
}) => {
  const location = useLocation()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() =>
    getStoredCollapsedNavGroups()
  )

  useEffect(() => {
    setStoredCollapsedNavGroups(collapsedGroups)
  }, [collapsedGroups])

  // Close on Escape key in mobile mode
  useEffect(() => {
    if (!isMobile || isSiderCollapsed) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isMobile, isSiderCollapsed, onClose])

  const activeKeys = DEMO_NAV_GROUPS.filter((group) => !collapsedGroups[group.key]).map(
    (group) => group.key
  )

  const handleCollapseChange = (next: string | number | (string | number)[] | undefined) => {
    const nextKeys = Array.isArray(next) ? next : next !== undefined ? [next] : []

    setCollapsedGroups((prev) => {
      const updated = { ...prev }
      DEMO_NAV_GROUPS.forEach((group) => {
        updated[group.key] = !nextKeys.includes(group.key)
      })
      return updated
    })
  }

  const handleItemClick = useCallback(() => {
    if (isMobile) onClose()
  }, [isMobile, onClose])

  // Shared menu content renderer
  const renderMenuContent = (collapsed: boolean) => (
    <div
      className={cn(
        'h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4',
        'transition-[padding] duration-300 ease-in-out',
        collapsed ? 'px-2' : 'px-3'
      )}>
      <div className="mt-4">
        <Collapse
          bordered={false}
          ghost
          expandIconPosition="end"
          activeKey={activeKeys}
          onChange={handleCollapseChange}
          className="space-y-2">
          {DEMO_NAV_GROUPS.map((group) => (
            <CollapsePanel
              key={group.key}
              panelKey={group.key}
              showArrow={!collapsed}
              header={
                <div
                  className={cn(
                    'w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
                    'text-gray-500 dark:text-gray-400',
                    collapsed ? 'justify-center' : 'justify-between'
                  )}
                  title={group.label[lang]}>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-[10px] font-bold',
                      collapsed
                        ? 'size-9 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                        : 'size-6 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                    )}>
                    {getAbbr(group.label[lang])}
                  </span>
                  {!collapsed && (
                    <span className="min-w-0 flex-1 truncate text-left">{group.label[lang]}</span>
                  )}
                </div>
              }>
              <div className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(location.pathname, item.path)
                  const label = item.label[lang]

                  return (
                    <Link
                      key={item.key}
                      to={item.path}
                      title={label}
                      onClick={handleItemClick}
                      className={cn(
                        'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden',
                        collapsed ? 'justify-center px-2' : 'gap-2 pr-3 pl-9',
                        active
                          ? 'bg-(--tiger-outline-bg-hover,#eff6ff) text-(--tiger-primary,#2563eb) font-medium'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                      )}>
                      <span
                        className={cn(
                          'inline-flex items-center justify-center text-[10px] font-semibold',
                          'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                          collapsed ? 'size-7' : 'size-6',
                          active && 'text-(--tiger-primary,#2563eb)'
                        )}>
                        {getAbbr(label)}
                      </span>
                      {!collapsed && <span className="truncate">{label}</span>}
                    </Link>
                  )
                })}
              </div>
            </CollapsePanel>
          ))}
        </Collapse>
      </div>
    </div>
  )

  // Mobile overlay mode
  if (isMobile) {
    if (isSiderCollapsed) return null
    return createPortal(
      <div className="fixed inset-0 z-50 demo-sider-overlay-enter">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        {/* Sidebar panel */}
        <aside className="absolute left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 dark:bg-gray-950 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col demo-sider-slide-enter">
          {/* Panel header with close button */}
          <div className="shrink-0 h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <Link
              to="/"
              onClick={onClose}
              className="text-base font-semibold text-gray-900 truncate dark:text-gray-100">
              {DEMO_APP_TITLE[lang]}
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              aria-label={lang === 'zh-CN' ? '关闭菜单' : 'Close menu'}
              className="size-8 p-0 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
              <span className="text-sm leading-none">✕</span>
            </Button>
          </div>
          <div className="flex-1 min-h-0">{renderMenuContent(false)}</div>
        </aside>
      </div>,
      document.body
    )
  }

  // Desktop mode
  return (
    <aside
      className={cn(
        'shrink-0 overflow-hidden border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        'transition-[width] duration-300 ease-in-out',
        isSiderCollapsed ? 'w-20' : 'w-56'
      )}>
      {renderMenuContent(isSiderCollapsed)}
    </aside>
  )
}

export default AppSider
