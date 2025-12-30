import React, { useMemo } from 'react'
import { classNames, type HeaderProps } from '@tigercat/core'

export interface ReactHeaderProps extends HeaderProps {
  /**
   * Header content
   */
  children?: React.ReactNode
}

export const Header: React.FC<ReactHeaderProps> = ({
  className,
  height = '64px',
  children,
  ...props
}) => {
  const headerClasses = useMemo(() => classNames(
    'tiger-header',
    'bg-white border-b border-gray-200',
    className
  ), [className])
  
  const headerStyle = useMemo((): React.CSSProperties => ({ height }), [height])

  return (
    <header 
      className={headerClasses} 
      style={headerStyle}
      {...props}
    >
      {children}
    </header>
  )
}
