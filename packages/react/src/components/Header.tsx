import React, { forwardRef } from 'react'
import {
  classNames,
  getLayoutHeaderClasses,
  injectLayoutGridStyles,
  type HeaderProps as CoreHeaderProps
} from '@expcat/tigercat-core'

export interface ReactHeaderProps
  extends CoreHeaderProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  children?: React.ReactNode
}

export const Header = forwardRef<HTMLElement, ReactHeaderProps>(function Header(
  { className, variant = 'default', height, style, children, ...props },
  ref
) {
  injectLayoutGridStyles()
  const headerClasses = classNames(getLayoutHeaderClasses(variant), className)
  const headerStyle: React.CSSProperties | undefined = height ? { ...style, height } : style

  return (
    <header ref={ref} className={headerClasses} style={headerStyle} {...props}>
      {children}
    </header>
  )
})

Header.displayName = 'TigerHeader'
