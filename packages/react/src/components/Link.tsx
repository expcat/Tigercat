import React from 'react'
import { classNames, getLinkVariantClasses, type LinkProps as CoreLinkProps } from '@tigercat/core'

export interface LinkProps extends CoreLinkProps {
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  
  /**
   * Link content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
}

const baseClasses = 'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer'

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const disabledClasses = 'cursor-not-allowed opacity-60 pointer-events-none'

export const Link: React.FC<LinkProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  href,
  target,
  rel,
  underline = true,
  onClick,
  children,
  className,
  ...props
}) => {
  const linkClasses = classNames(
    baseClasses,
    getLinkVariantClasses(variant),
    sizeClasses[size],
    underline && 'hover:underline',
    disabled && disabledClasses,
    className,
  )

  // Automatically add security attributes for target="_blank"
  const computedRel = target === '_blank' && !rel ? 'noopener noreferrer' : rel

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    if (onClick) {
      onClick(event)
    }
  }

  return (
    <a
      className={linkClasses}
      href={disabled ? undefined : href}
      target={target}
      rel={computedRel}
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}
