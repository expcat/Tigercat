import React, { forwardRef, useContext, useEffect, useMemo } from 'react'
import {
  classNames,
  getLayoutSidebarClasses,
  getSidebarAriaLabel,
  getSidebarStyle,
  injectLayoutGridStyles,
  isSidebarFullyHidden,
  resolveSidebarAriaProps,
  type SidebarProps as CoreSidebarProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { LayoutContext, SidebarContext } from '../utils/layout-context'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
}

export const Sidebar = forwardRef<HTMLElement, ReactSidebarProps>(function Sidebar(
  {
    className,
    width,
    collapsedWidth = '64px',
    collapsed = false,
    side = 'start',
    style,
    children,
    ...props
  },
  ref
) {
  injectLayoutGridStyles()
  const layout = useContext(LayoutContext)
  const config = useTigerConfig()
  const fallbackName = useMemo(() => getSidebarAriaLabel(config.locale), [config.locale])

  useEffect(() => {
    layout?.setSiderCollapsed(collapsed)
    return () => layout?.setSiderCollapsed(false)
  }, [collapsed, layout])

  const fullyHidden = isSidebarFullyHidden(collapsed, collapsedWidth)
  const sidebarClasses = classNames(
    getLayoutSidebarClasses({
      collapsed,
      side,
      widthProvided: width !== undefined
    }),
    className
  )
  const sidebarStyle: React.CSSProperties = {
    ...style,
    ...getSidebarStyle(collapsed, width, collapsedWidth)
  }
  const aria = resolveSidebarAriaProps({
    ariaLabel: props['aria-label'],
    ariaLabelledby: props['aria-labelledby'],
    fallback: fallbackName
  })

  const { ['aria-label']: _ignoredLabel, ['aria-labelledby']: _ignoredBy, ...rest } = props

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        ref={ref}
        className={sidebarClasses}
        style={sidebarStyle}
        inert={fullyHidden || undefined}
        aria-hidden={fullyHidden || undefined}
        {...aria}
        {...rest}>
        {children}
      </aside>
    </SidebarContext.Provider>
  )
})

Sidebar.displayName = 'TigerSidebar'
