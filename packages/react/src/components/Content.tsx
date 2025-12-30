import React, { useMemo } from 'react'
import { classNames, type ContentProps } from '@tigercat/core'

export interface ReactContentProps extends ContentProps {
  /**
   * Content body
   */
  children?: React.ReactNode
}

export const Content: React.FC<ReactContentProps> = ({
  className,
  children,
  ...props
}) => {
  const contentClasses = useMemo(() => classNames(
    'tiger-content',
    'flex-1 bg-gray-50 p-6',
    className
  ), [className])

  return (
    <main className={contentClasses} {...props}>
      {children}
    </main>
  )
}
