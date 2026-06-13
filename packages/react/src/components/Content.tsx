import React from 'react'
import {
  classNames,
  getLayoutContentClasses,
  type ContentProps as CoreContentProps
} from '@expcat/tigercat-core'

export interface ReactContentProps
  extends CoreContentProps, Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  children?: React.ReactNode
}

export const Content: React.FC<ReactContentProps> = ({
  className,
  padding = true,
  children,
  ...props
}) => {
  const contentClasses = classNames(getLayoutContentClasses(padding), className)

  return (
    <main className={contentClasses} {...props}>
      {children}
    </main>
  )
}
