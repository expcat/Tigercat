import React, { useMemo } from 'react'
import { classNames, type LayoutProps } from '@tigercat/core'

export interface ReactLayoutProps extends LayoutProps {
  /**
   * Layout content
   */
  children?: React.ReactNode
}

export const Layout: React.FC<ReactLayoutProps> = ({
  className,
  children,
  ...props
}) => {
  const layoutClasses = useMemo(() => classNames(
    'tiger-layout',
    'flex flex-col min-h-screen',
    className
  ), [className])

  return (
    <div className={layoutClasses} {...props}>
      {children}
    </div>
  )
}
