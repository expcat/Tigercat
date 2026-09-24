import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  getLayoutSidebarClasses,
  getSidebarAriaLabel,
  getSidebarStyle,
  isSidebarFullyHidden,
  resolveSidebarAriaProps,
  type SidebarLandmark,
  type SidebarProps as CoreSidebarProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { SidebarContext } from '../utils/layout-context'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
  /** Set by Layout. Not a public styling prop. */
  landmark?: SidebarLandmark
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
    landmark = 'default',
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const fallbackName = useMemo(() => getSidebarAriaLabel(config.locale), [config.locale])

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
  const named =
    landmark === 'plain'
      ? {}
      : resolveSidebarAriaProps({
          ariaLabel: props['aria-label'],
          ariaLabelledby: props['aria-labelledby'],
          fallback: landmark === 'default' ? fallbackName : ''
        })

  const { ['aria-label']: _ignoredLabel, ['aria-labelledby']: _ignoredBy, ...rest } = props
  const Tag = landmark === 'plain' ? 'div' : 'aside'

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <Tag
        ref={ref}
        className={sidebarClasses}
        style={sidebarStyle}
        inert={fullyHidden || undefined}
        aria-hidden={fullyHidden || undefined}
        {...named}
        {...rest}>
        {children}
      </Tag>
    </SidebarContext.Provider>
  )
})

Sidebar.displayName = 'TigerSidebar'
