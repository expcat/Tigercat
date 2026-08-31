import React, { forwardRef, useContext, useEffect, useRef } from 'react'
import {
  classNames,
  getLayoutContentClasses,
  injectLayoutGridStyles,
  type ContentProps as CoreContentProps
} from '@expcat/tigercat-core'
import { LayoutContext } from '../utils/layout-context'

export interface ReactContentProps
  extends CoreContentProps, Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: keyof HTMLElementTagNameMap
  children?: React.ReactNode
}

export const Content = forwardRef<HTMLElement, ReactContentProps>(function Content(
  { className, padding = true, as = 'main', children, ...props },
  forwardedRef
) {
  injectLayoutGridStyles()
  const layout = useContext(LayoutContext)
  const localRef = useRef<HTMLElement | null>(null)

  const setRefs = (node: HTMLElement | null) => {
    localRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  useEffect(() => {
    layout?.setContentEl(localRef.current)
    return () => layout?.setContentEl(null)
  }, [layout])

  const contentClasses = classNames(getLayoutContentClasses(padding), className)
  const Tag = as as React.ElementType

  return (
    <Tag ref={setRefs} className={contentClasses} {...props}>
      {children}
    </Tag>
  )
})

Content.displayName = 'TigerContent'
