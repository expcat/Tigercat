import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@tigercat/react';
import {
  DEMO_NAV_GROUPS,
  type DemoLang,
  type DemoNavGroup,
} from '@demo-shared/app-config';
import {
  getStoredCollapsedNavGroups,
  getStoredSiderCollapsed,
  setStoredCollapsedNavGroups,
  setStoredSiderCollapsed,
} from '@demo-shared/prefs';

export interface AppSiderProps {
  lang: DemoLang;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function getAbbr(label: string) {
  const trimmed = (label ?? '').trim();
  if (!trimmed) return '?';
  const first = Array.from(trimmed)[0];
  return first ? first.toUpperCase() : '?';
}

function isActivePath(currentPath: string, targetPath: string) {
  if (targetPath === '/') return currentPath === '/';
  return currentPath === targetPath;
}

export const AppSider: React.FC<AppSiderProps> = ({ lang }) => {
  const location = useLocation();
  const [isSiderCollapsed, setIsSiderCollapsed] = useState<boolean>(() =>
    getStoredSiderCollapsed()
  );
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >(() => getStoredCollapsedNavGroups());

  const groups = useMemo(() => DEMO_NAV_GROUPS, []);

  const toggleGroup = (group: DemoNavGroup) => {
    setCollapsedGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
  };

  useEffect(() => {
    setStoredSiderCollapsed(isSiderCollapsed);
  }, [isSiderCollapsed]);

  useEffect(() => {
    setStoredCollapsedNavGroups(collapsedGroups);
  }, [collapsedGroups]);

  return (
    <aside
      className={cn(
        'shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950',
        'transition-[width] duration-300 ease-in-out',
        isSiderCollapsed ? 'w-16' : 'w-72'
      )}>
      <div
        className={cn(
          'sticky top-0 h-full overflow-y-auto overflow-x-hidden demo-scrollbar py-4',
          'transition-[padding] duration-300 ease-in-out',
          isSiderCollapsed ? 'px-2' : 'px-3'
        )}>
        <div
          className={cn(
            'mb-3 flex',
            isSiderCollapsed ? 'justify-center' : 'justify-end'
          )}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSiderCollapsed((v) => !v)}
            className={cn(
              'size-8 p-0 border-gray-200 bg-white text-gray-700',
              'hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900'
            )}
            aria-label={
              isSiderCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }>
            <span className="text-sm leading-none">
              {isSiderCollapsed ? '»' : '«'}
            </span>
          </Button>
        </div>

        <Link
          to="/"
          title={lang === 'zh-CN' ? '首页' : 'Home'}
          className={cn(
            'flex items-center rounded-md py-2 text-sm font-medium transition-colors overflow-hidden',
            isSiderCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
            isActivePath(location.pathname, '/')
              ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)]'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
          )}>
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-md text-xs font-semibold',
              isSiderCollapsed
                ? 'size-9 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
                : 'size-7 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200',
              isActivePath(location.pathname, '/') &&
                'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)]'
            )}>
            {getAbbr(lang === 'zh-CN' ? '首页' : 'Home')}
          </span>
          {!isSiderCollapsed && (
            <span className="truncate">
              {lang === 'zh-CN' ? '首页' : 'Home'}
            </span>
          )}
        </Link>

        <div className="mt-4 space-y-3">
          {groups.map((group) => {
            const collapsed = !!collapsedGroups[group.key];
            return (
              <div key={group.key}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGroup(group)}
                  title={group.label[lang]}
                  className={cn(
                    'w-full flex items-center gap-2 py-2 text-xs font-semibold uppercase tracking-wide',
                    'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                    isSiderCollapsed
                      ? 'justify-center px-2'
                      : 'justify-between px-3'
                  )}
                  aria-expanded={!collapsed}>
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
                    <span className="min-w-0 flex-1 truncate text-left">
                      {group.label[lang]}
                    </span>
                  )}
                  {!isSiderCollapsed && (
                    <span
                      className={cn(
                        'shrink-0 transition-transform duration-200',
                        collapsed ? '-rotate-90' : 'rotate-0'
                      )}
                      aria-hidden>
                      ▾
                    </span>
                  )}
                </Button>

                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                  )}>
                  <div
                    className={cn(
                      'overflow-hidden',
                      collapsed && 'pointer-events-none'
                    )}>
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const active = isActivePath(
                          location.pathname,
                          item.path
                        );
                        const label = item.label[lang];

                        return (
                          <Link
                            key={item.key}
                            to={item.path}
                            title={label}
                            className={cn(
                              'flex items-center rounded-md py-2 text-sm transition-colors overflow-hidden',
                              isSiderCollapsed
                                ? 'justify-center px-2'
                                : 'gap-2 pr-3 pl-9',
                              active
                                ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium'
                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                            )}>
                            <span
                              className={cn(
                                'inline-flex items-center justify-center text-[10px] font-semibold',
                                'rounded-md border border-gray-200 bg-transparent text-gray-700 dark:border-gray-800 dark:text-gray-200',
                                isSiderCollapsed ? 'size-7' : 'size-6',
                                active && 'text-[var(--tiger-primary,#2563eb)]'
                              )}>
                              {getAbbr(label)}
                            </span>
                            {!isSiderCollapsed && (
                              <span className="truncate">{label}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default AppSider;
