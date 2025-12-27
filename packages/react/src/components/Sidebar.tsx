import React from 'react'
import { classNames, type SidebarProps } from '@tigercat/core'

export interface ReactSidebarProps extends SidebarProps {
  /**
   * Sidebar content
   */
  children?: React.ReactNode
}

export const Sidebar: React.FC<ReactSidebarProps> = ({
  className,
  width = '256px',
  collapsed = false,
  children,
  ...props
}) => {
  const sidebarClasses = classNames(
    'tiger-sidebar',
    'bg-white border-r border-gray-200 transition-all duration-300',
    className
  )

  return (
    <aside 
      className={sidebarClasses}
      style={{
        width: collapsed ? '0' : width,
        minWidth: collapsed ? '0' : width,
        overflow: 'hidden',
      }}
      {...props}
    >
      {!collapsed && children}
    </aside>
  )
}
