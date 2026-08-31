import React, { forwardRef } from 'react'
import {
  classNames,
  injectLayoutGridStyles,
  layoutFooterClasses,
  type FooterProps as CoreFooterProps
} from '@expcat/tigercat-core'

export interface ReactFooterProps
  extends CoreFooterProps, Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'height'> {
  as?: keyof HTMLElementTagNameMap
  children?: React.ReactNode
}

export const Footer = forwardRef<HTMLElement, ReactFooterProps>(function Footer(
  { className, height, style, as = 'footer', children, ...props },
  ref
) {
  injectLayoutGridStyles()
  const footerClasses = classNames(layoutFooterClasses, className)
  const footerStyle: React.CSSProperties | undefined = height ? { ...style, height } : style
  const Tag = as as React.ElementType

  return (
    <Tag ref={ref} className={footerClasses} style={footerStyle} {...props}>
      {children}
    </Tag>
  )
})

Footer.displayName = 'TigerFooter'
