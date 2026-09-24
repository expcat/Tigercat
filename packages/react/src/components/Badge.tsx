import React, { forwardRef, useMemo } from 'react'
import {
  classNames,
  formatBadgeCountLabel,
  getBadgeVariantClasses,
  getStatusLabels,
  mergeTigerLocale,
  badgeBaseClasses,
  badgeSizeClasses,
  dotSizeClasses,
  badgeTypeClasses,
  badgeWrapperClasses,
  badgePositionClasses,
  resolveBadgeContent,
  resolveBadgePosition,
  warnStandaloneBadgeChildren,
  type BadgeProps as CoreBadgeProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export type BadgeProps = CoreBadgeProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'content'> & {
    children?: React.ReactNode
  }

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    locale,
    variant = 'danger',
    size = 'md',
    type = 'number',
    content,
    max = 99,
    standalone = true,
    showZero = standalone,
    position: positionProp = 'top-end',
    className,
    children,
    ['aria-label']: ariaLabelProp,
    ['aria-labelledby']: ariaLabelledbyProp,
    ['aria-hidden']: ariaHiddenProp,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const statusLabels = useMemo(
    () => getStatusLabels(mergeTigerLocale(config.locale, locale)),
    [config.locale, locale]
  )
  warnStandaloneBadgeChildren(children != null && children !== false, standalone)

  const position = resolveBadgePosition(positionProp)
  const resolved = resolveBadgeContent({ type, content, max, showZero })
  const isDot = resolved.kind === 'dot'
  const isHidden = resolved.kind === 'hidden' || (isDot && !statusLabels.badgeLabel)
  const countLabel =
    typeof content === 'number' && Number.isFinite(content)
      ? formatBadgeCountLabel(statusLabels.badgeCountLabel, content, config.locale?.locale)
      : resolved.kind === 'text'
        ? resolved.value
        : statusLabels.badgeLabel

  const badgeClasses = classNames(
    badgeBaseClasses,
    getBadgeVariantClasses(variant),
    isDot ? dotSizeClasses[size] : badgeSizeClasses[size],
    badgeTypeClasses[type],
    !standalone && badgePositionClasses[position]
  )

  const userNamed = Boolean(ariaLabelProp || ariaLabelledbyProp)
  const hideFromAT = ariaHiddenProp ?? (!standalone || (isDot && !userNamed))

  const badgeElement = !isHidden ? (
    <span
      {...(standalone ? props : undefined)}
      ref={standalone ? ref : undefined}
      className={classNames(badgeClasses, standalone && className)}
      aria-hidden={hideFromAT ? true : ariaHiddenProp}
      aria-label={
        hideFromAT ? undefined : ariaLabelProp || (isDot ? statusLabels.badgeLabel : undefined)
      }
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
      {!isHidden ? (
        <span className="sr-only">{isDot ? statusLabels.badgeLabel : countLabel}</span>
      ) : null}
    </span>
  )
})
Badge.displayName = 'Badge'
