import React from 'react'
import { classNames, type FooterProps } from '@tigercat/core'

export interface ReactFooterProps extends FooterProps {
  /**
   * Footer content
   */
  children?: React.ReactNode
}

export const Footer: React.FC<ReactFooterProps> = ({
  className,
  height = 'auto',
  children,
  ...props
}) => {
  const footerClasses = classNames(
    'tiger-footer',
    'bg-white border-t border-gray-200 p-4',
    className
  )

  return (
    <footer 
      className={footerClasses}
      style={{ height }}
      {...props}
    >
      {children}
    </footer>
  )
}
