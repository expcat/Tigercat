import React, { forwardRef, useCallback, useContext, useMemo, useState } from 'react'
import {
  classNames,
  getLayoutRootClasses,
  injectLayoutGridStyles,
  isLayoutSiderTypeName,
  resolveLayoutHasSider,
  type LayoutProps as CoreLayoutProps
} from '@expcat/tigercat-core'
import { LayoutContext, type LayoutContextValue } from '../utils/layout-context'

export interface ReactLayoutProps
  extends CoreLayoutProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: React.ReactNode
}

function isSiderChild(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false
  const type = child.type as { displayName?: string; name?: string }
  return isLayoutSiderTypeName(type.displayName) || isLayoutSiderTypeName(type.name)
}

function childrenHaveSider(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some(isSiderChild)
}

export const Layout = forwardRef<HTMLDivElement, ReactLayoutProps>(function Layout(
  { className, children, hasSider, direction, fullHeight = false, style, ...props },
  ref
) {
  injectLayoutGridStyles()
  const parent = useContext(LayoutContext)
  const nested = parent != null
  const childIsSider = childrenHaveSider(children)
  const resolvedHasSider = resolveLayoutHasSider({ hasSider, direction, childIsSider })
  const [siderCollapsed, setSiderCollapsedState] = useState(false)
  const [contentEl, setContentElState] = useState<HTMLElement | null>(null)

  const setSiderCollapsed = useCallback((collapsed: boolean) => {
    setSiderCollapsedState(collapsed)
  }, [])
  const setContentEl = useCallback((el: HTMLElement | null) => {
    setContentElState(el)
  }, [])

  const contextValue = useMemo<LayoutContextValue>(
    () => ({
      nested,
      hasSider: resolvedHasSider,
      siderCollapsed,
      setSiderCollapsed,
      contentEl,
      setContentEl
    }),
    [nested, resolvedHasSider, siderCollapsed, setSiderCollapsed, contentEl, setContentEl]
  )

  const layoutClasses = classNames(
    getLayoutRootClasses({
      hasSider: resolvedHasSider,
      nested,
      fullHeight
    }),
    className
  )

  return (
    <LayoutContext.Provider value={contextValue}>
      <div ref={ref} className={layoutClasses} style={style} {...props}>
        {children}
      </div>
    </LayoutContext.Provider>
  )
})

Layout.displayName = 'TigerLayout'
