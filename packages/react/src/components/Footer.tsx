import React, { useMemo } from 'react'
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
  const footerClasses = useMemo(() => classNames(
    'tiger-footer',
    'bg-white border-t border-gray-200 p-4',
    className
  ), [className])
  
  const footerStyle = useMemo((): React.CSSProperties => ({ height }), [height])

  return (
    <footer 
      className={footerClasses}
      style={footerStyle}
      {...props}
    >
      {children}
    </footer>
  )
}
