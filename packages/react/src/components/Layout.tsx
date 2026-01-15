import React from 'react'
import { classNames, layoutRootClasses, type LayoutProps as CoreLayoutProps } from '@expcat/tigercat-core'

export interface ReactLayoutProps
  extends CoreLayoutProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: React.ReactNode
}

export const Layout: React.FC<ReactLayoutProps> = ({ className, children, ...props }) => {
  const layoutClasses = classNames(layoutRootClasses, className)

  return (
    <div className={layoutClasses} {...props}>
      {children}
    </div>
  )
}
