import React, { forwardRef, useCallback, useMemo } from 'react'
import {
  resolveLinkAddress,
  resolveLinkClasses,
  type LinkProps as CoreLinkProps
} from '@expcat/tigercat-core'

export interface LinkProps
  extends
    CoreLinkProps,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      'href' | 'target' | 'rel' | 'onClick' | 'children'
    > {
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  children?: React.ReactNode
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    variant = 'primary',
    size = 'md',
    disabled = false,
    href,
    target,
    rel,
    underline = true,
    onClick,
    onKeyDown,
    tabIndex,
    children,
    className,
    ...props
  },
  ref
) {
  const linkClasses = useMemo(
    () => resolveLinkClasses({ variant, size, underline, disabled, className }),
    [variant, size, underline, disabled, className]
  )

  const address = useMemo(
    () => resolveLinkAddress({ href, target, rel, disabled }),
    [href, target, rel, disabled]
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      onClick?.(event)
    },
    [disabled, onClick]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      onKeyDown?.(event)
    },
    [disabled, onKeyDown]
  )

  return (
    <a
      {...props}
      ref={ref}
      className={linkClasses}
      href={address.href}
      target={address.target}
      rel={address.rel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      {children}
    </a>
  )
})
Link.displayName = 'Link'
