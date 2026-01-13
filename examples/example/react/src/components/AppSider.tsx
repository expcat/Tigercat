import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DEMO_NAV_GROUPS,
  type DemoLang,
  type DemoNavGroup,
} from "@demo-shared/app-config";

export interface AppSiderProps {
  lang: DemoLang;
}

function isActivePath(currentPath: string, targetPath: string) {
  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath;
}

export const AppSider: React.FC<AppSiderProps> = ({ lang }) => {
  const location = useLocation();
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  const groups = useMemo(() => DEMO_NAV_GROUPS, []);

  const toggleGroup = (group: DemoNavGroup) => {
    setCollapsedGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
  };

  return (
    <aside className="w-72 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="sticky top-14 h-[calc(100vh-56px)] overflow-y-auto px-3 py-4">
        <Link
          to="/"
          className={
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
            (isActivePath(location.pathname, "/")
              ? "bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)]"
              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900")
          }
        >
          {lang === "zh-CN" ? "首页" : "Home"}
        </Link>

        <div className="mt-4 space-y-3">
          {groups.map((group) => {
            const collapsed = !!collapsedGroups[group.key];
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-expanded={!collapsed}
                >
                  <span className="truncate">{group.label[lang]}</span>
                  <span className="text-xs">{collapsed ? "+" : "–"}</span>
                </button>

                {!collapsed && (
                  <div className="mt-1 space-y-1">
                    {group.items.map((item) => {
                      const active = isActivePath(location.pathname, item.path);
                      return (
                        <Link
                          key={item.key}
                          to={item.path}
                          className={
                            "block rounded-md px-3 py-2 text-sm transition-colors " +
                            (active
                              ? "bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900")
                          }
                        >
                          {item.label[lang]}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default AppSider;
