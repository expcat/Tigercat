import React from 'react'
import {
  classNames,
  layoutHeaderClasses,
  type HeaderProps as CoreHeaderProps
} from '@expcat/tigercat-core'

export interface ReactHeaderProps
  extends CoreHeaderProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  children?: React.ReactNode
}

export const Header: React.FC<ReactHeaderProps> = ({
  className,
  height = '64px',
  style,
  children,
  ...props
}) => {
  const headerClasses = classNames(layoutHeaderClasses, className)
  const headerStyle: React.CSSProperties = { ...style, height }

  return (
    <header className={headerClasses} style={headerStyle} {...props}>
      {children}
    </header>
  )
}
