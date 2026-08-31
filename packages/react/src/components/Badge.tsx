import React, { forwardRef } from 'react'
import {
  classNames,
  getBadgeVariantClasses,
  badgeBaseClasses,
  badgeSizeClasses,
  dotSizeClasses,
  badgeTypeClasses,
  badgeWrapperClasses,
  badgePositionClasses,
  resolveBadgeContent,
  warnStandaloneBadgeChildren,
  type BadgeProps as CoreBadgeProps
} from '@expcat/tigercat-core'

export type BadgeProps = CoreBadgeProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> & {
    children?: React.ReactNode
  }

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    locale: _locale,
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
    ['aria-labelledby']: ariaLabelledbyProp,
    ['aria-hidden']: ariaHiddenProp,
    ...props
  },
  ref
) {
  warnStandaloneBadgeChildren(children != null && children !== false, standalone)

  const resolved = resolveBadgeContent({ type, content, max, showZero })
  const isDot = resolved.kind === 'dot'
  const isHidden = resolved.kind === 'hidden'

  const badgeClasses = classNames(
    badgeBaseClasses,
    getBadgeVariantClasses(variant),
    isDot ? dotSizeClasses[size] : badgeSizeClasses[size],
    badgeTypeClasses[type],
    !standalone && badgePositionClasses[position]
  )

  const userNamed = Boolean(ariaLabelProp || ariaLabelledbyProp)
  const hideFromAT = ariaHiddenProp ?? (!userNamed && (isDot || !standalone))

  const badgeElement = !isHidden ? (
    <span
      {...(standalone ? props : undefined)}
      ref={standalone ? ref : undefined}
      className={classNames(badgeClasses, standalone && className)}
      aria-hidden={hideFromAT ? true : ariaHiddenProp}
      aria-label={hideFromAT ? undefined : ariaLabelProp}
      aria-labelledby={hideFromAT ? undefined : ariaLabelledbyProp}>
      {resolved.kind === 'text' ? resolved.value : null}
    </span>
  ) : null

  if (standalone) {
    return badgeElement
  }

  return (
    <span ref={ref} className={classNames(badgeWrapperClasses, className)} {...props}>
      {children}
      {badgeElement}
    </span>
  )
})
Badge.displayName = 'Badge'
