import React from 'react'
import {
  classNames,
  layoutSidebarClasses,
  type SidebarProps as CoreSidebarProps
} from '@expcat/tigercat-core'

export interface ReactSidebarProps
  extends CoreSidebarProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'width'> {
  children?: React.ReactNode
}

export const Sidebar: React.FC<ReactSidebarProps> = ({
  className,
  width = '256px',
  collapsed = false,
  style,
  children,
  ...props
}) => {
  const sidebarClasses = classNames(layoutSidebarClasses, className)
  const sidebarStyle: React.CSSProperties = {
    ...style,
    width: collapsed ? '0px' : width,
    minWidth: collapsed ? '0px' : width,
    overflow: 'hidden'
  }

  return (
    <aside className={sidebarClasses} style={sidebarStyle} {...props}>
      {!collapsed && children}
    </aside>
  )
}
