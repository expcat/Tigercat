import React from 'react'
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
} from '@expcat/tigercat-core'

export type BadgeProps = CoreBadgeProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> & {
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
  ['aria-label']: ariaLabelProp,
  ...props
}) => {
  const isDot = type === 'dot'
  const isHidden = shouldHideBadge(content, type, showZero)
  const displayContent = formatBadgeContent(content, max, showZero)

  const badgeClasses = classNames(
    badgeBaseClasses,
    getBadgeVariantClasses(variant),
    isDot ? dotSizeClasses[size] : badgeSizeClasses[size],
    badgeTypeClasses[type],
    !standalone && badgePositionClasses[position],
    className
  )

  const computedAriaLabel =
    ariaLabelProp ??
    (isDot
      ? 'notification'
      : type === 'number'
        ? `${displayContent} notifications`
        : `${displayContent ?? ''}`)

  if (isHidden) {
    return standalone ? null : <>{children}</>
  }

  const badgeElement = (
    <span {...props} className={badgeClasses} role="status" aria-label={computedAriaLabel}>
      {!isDot && displayContent}
    </span>
  )

  if (standalone) {
    return badgeElement
  }

  return (
    <span className={badgeWrapperClasses}>
      {children}
      {badgeElement}
    </span>
  )
}
