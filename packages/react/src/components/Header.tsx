import React, { forwardRef, useContext } from 'react'
import {
  classNames,
  getLayoutHeaderClasses,
  resolveHeaderSticky,
  resolveLayoutSectionTag,
  type HeaderProps as CoreHeaderProps
} from '@expcat/tigercat-core'
import { LayoutContext } from '../utils/layout-context'

export interface ReactHeaderProps
  extends CoreHeaderProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  as?: keyof HTMLElementTagNameMap
  children?: React.ReactNode
}

export const Header = forwardRef<HTMLElement, ReactHeaderProps>(function Header(
  { className, variant = 'default', height, sticky = false, style, as, children, ...props },
  ref
) {
  const layout = useContext(LayoutContext)
  const stuck = resolveHeaderSticky({ sticky, fullHeightShell: Boolean(layout?.fullHeight) })
  const headerClasses = classNames(getLayoutHeaderClasses(variant, { sticky: stuck }), className)
  const headerStyle: React.CSSProperties | undefined = height ? { ...style, height } : style
  const Tag = resolveLayoutSectionTag({
    kind: 'header',
    nested: Boolean(layout?.nested),
    explicit: as
  }) as React.ElementType

  return (
    <Tag ref={ref} className={headerClasses} style={headerStyle} {...props}>
      {children}
    </Tag>
  )
})

Header.displayName = 'TigerHeader'
