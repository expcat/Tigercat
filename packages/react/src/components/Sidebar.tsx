import React from 'react'
import {
  classNames,
  layoutSidebarClasses,
  layoutSidebarCollapsedClasses,
  getSidebarStyle,
  type SidebarProps as CoreSidebarProps
} from '@expcat/tigercat-core'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
}

export const Sidebar: React.FC<ReactSidebarProps> = ({
  className,
  width = '256px',
  collapsedWidth = '64px',
  collapsed = false,
  style,
  children,
  ...props
}) => {
  const sidebarClasses = classNames(
    layoutSidebarClasses,
    collapsed && layoutSidebarCollapsedClasses,
    className
  )
  const sidebarStyle: React.CSSProperties = {
    ...style,
    ...getSidebarStyle(collapsed, width, collapsedWidth)
  }

  return (
    <aside className={sidebarClasses} style={sidebarStyle} {...props}>
      {children}
    </aside>
  )
}
