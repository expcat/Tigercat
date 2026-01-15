import React from 'react'
import {
  classNames,
  layoutContentClasses,
  type ContentProps as CoreContentProps
} from '@expcat/tigercat-core'

export interface ReactContentProps
  extends CoreContentProps, Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children?: React.ReactNode
}

export const Content: React.FC<ReactContentProps> = ({ className, children, ...props }) => {
  const contentClasses = classNames(layoutContentClasses, className)

  return (
    <main className={contentClasses} {...props}>
      {children}
    </main>
  )
}
