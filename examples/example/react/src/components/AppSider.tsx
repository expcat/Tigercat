import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Collapse, CollapsePanel } from '@expcat/tigercat-react'
import { DEMO_NAV_GROUPS, type DemoLang } from '@demo-shared/app-config'
import { getStoredCollapsedNavGroups, setStoredCollapsedNavGroups } from '@demo-shared/prefs'

export interface AppSiderProps {
  lang: DemoLang
  isSiderCollapsed: boolean
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

export const AppSider: React.FC<AppSiderProps> = ({ lang, isSiderCollapsed }) => {
  const location = useLocation()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() =>
    getStoredCollapsedNavGroups()
  )

  useEffect(() => {
    setStoredCollapsedNavGroups(collapsedGroups)
  }, [collapsedGroups])

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

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        'transition-[width] duration-300 ease-in-out',
        isSiderCollapsed ? 'w-20' : 'w-56'
      )}>
      <div
        className={cn(
          'sticky top-0 h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4',
          'transition-[padding] duration-300 ease-in-out',
          isSiderCollapsed ? 'px-2' : 'px-3'
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
                showArrow={!isSiderCollapsed}
                header={
                  <div
                    className={cn(
                      'w-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wide',
                      'text-gray-500 dark:text-gray-400',
                      isSiderCollapsed ? 'justify-center' : 'justify-between'
                    )}
                    title={group.label[lang]}>
                    <span
                      className={cn(
                        'inline-flex items-center justify-center text-[10px] font-bold',
                        isSiderCollapsed
                          ? 'size-9 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                          : 'size-6 rounded-md bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                      )}>
                      {getAbbr(group.label[lang])}
                    </span>
                    {!isSiderCollapsed && (
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
                        className={cn(
                          'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden',
                          isSiderCollapsed ? 'justify-center px-2' : 'gap-2 pr-3 pl-9',
                          active
                            ? 'bg-(--tiger-outline-bg-hover,#eff6ff) text-(--tiger-primary,#2563eb) font-medium'
                            : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                        )}>
                        <span
                          className={cn(
                            'inline-flex items-center justify-center text-[10px] font-semibold',
                            'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                            isSiderCollapsed ? 'size-7' : 'size-6',
                            active && 'text-(--tiger-primary,#2563eb)'
                          )}>
                          {getAbbr(label)}
                        </span>
                        {!isSiderCollapsed && <span className="truncate">{label}</span>}
                      </Link>
                    )
                  })}
                </div>
              </CollapsePanel>
            ))}
          </Collapse>
        </div>
      </div>
    </aside>
  )
}

export default AppSider
