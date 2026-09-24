import React, { forwardRef, useContext } from 'react'
import {
  classNames,
  getLayoutContentClasses,
  resolveLayoutSectionTag,
  type ContentProps as CoreContentProps
} from '@expcat/tigercat-core'
import { LayoutContext } from '../utils/layout-context'

export interface ReactContentProps
  extends CoreContentProps, Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: keyof HTMLElementTagNameMap
  children?: React.ReactNode
}

export const Content = forwardRef<HTMLElement, ReactContentProps>(function Content(
  { className, padding = true, as, children, ...props },
  forwardedRef
) {
  const layout = useContext(LayoutContext)
  const contentClasses = classNames(getLayoutContentClasses(padding), className)
  const Tag = resolveLayoutSectionTag({
    kind: 'content',
    nested: Boolean(layout?.nested),
    explicit: as
  }) as React.ElementType

  return (
    <Tag ref={forwardedRef} className={contentClasses} {...props}>
      {children}
    </Tag>
  )
})

Content.displayName = 'TigerContent'
