import React, { useMemo } from 'react'
import { 
  classNames, 
  getBadgeVariantClasses, 
  badgeBaseClasses,
  badgeSizeClasses,
  dotSizeClasses,
  badgeTypeClasses,
  badgeWrapperClasses,
  badgePositionClasses,
  formatBadgeContent,
  shouldHideBadge,
  type BadgeProps as CoreBadgeProps 
} from '@tigercat/core'

export interface BadgeProps extends CoreBadgeProps {
  /**
   * Badge content (children for wrapped mode)
   */
  children?: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'danger',
  size = 'md',
  type = 'number',
  content,
  max = 99,
  showZero = false,
  position = 'top-right',
  standalone = true,
  className,
  children,
  ...props
}) => {
  const isDot = type === 'dot'
  const isHidden = useMemo(() => shouldHideBadge(content, type, showZero), [content, type, showZero])
  const displayContent = useMemo(() => formatBadgeContent(content, max, showZero), [content, max, showZero])

  const badgeClasses = useMemo(() => {
    const sizeClass = isDot ? dotSizeClasses[size] : badgeSizeClasses[size]
    
    return classNames(
      badgeBaseClasses,
      getBadgeVariantClasses(variant),
      sizeClass,
      badgeTypeClasses[type],
      !standalone && badgePositionClasses[position],
      className,
    )
  }, [variant, size, type, standalone, position, className, isDot])

  // If badge should be hidden, render only children (or nothing if standalone)
  if (isHidden) {
    if (standalone) {
      return null
    }
    return <>{children}</>
  }

  // Create badge element
  const badgeElement = (
    <span
      className={badgeClasses}
      role="status"
      aria-label={isDot ? 'notification' : `${displayContent} notifications`}
      {...props}
    >
      {!isDot && displayContent}
    </span>
  )

  // If standalone, return badge only
  if (standalone) {
    return badgeElement
  }

  // If wrapping content, return wrapper with badge and children
  return (
    <span className={badgeWrapperClasses}>
      {children}
      {badgeElement}
    </span>
  )
}
