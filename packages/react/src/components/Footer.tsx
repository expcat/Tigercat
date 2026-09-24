import React, { forwardRef, useContext } from 'react'
import {
  classNames,
  getLayoutFooterClasses,
  resolveLayoutSectionTag,
  type FooterProps as CoreFooterProps
} from '@expcat/tigercat-core'
import { LayoutContext } from '../utils/layout-context'

export interface ReactFooterProps
  extends CoreFooterProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  as?: keyof HTMLElementTagNameMap
  children?: React.ReactNode
}

export const Footer = forwardRef<HTMLElement, ReactFooterProps>(function Footer(
  { className, height, size = 'default', style, as, children, ...props },
  ref
) {
  const layout = useContext(LayoutContext)
  const footerClasses = classNames(getLayoutFooterClasses(size), className)
  const footerStyle: React.CSSProperties | undefined = height ? { ...style, height } : style
  const Tag = resolveLayoutSectionTag({
    kind: 'footer',
    nested: Boolean(layout?.nested),
    explicit: as
  }) as React.ElementType

  return (
    <Tag ref={ref} className={footerClasses} style={footerStyle} {...props}>
      {children}
    </Tag>
  )
})

Footer.displayName = 'TigerFooter'
