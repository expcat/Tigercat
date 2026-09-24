import React, { createContext, isValidElement, useMemo, useState } from 'react'
import {
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupLabels,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  mergeTigerLocale,
  type AvatarShape,
  type AvatarSize,
  type AvatarGroupProps as CoreAvatarGroupProps,
  type TigerLocale,
  type TigerLocaleAvatarGroup
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface AvatarGroupContextValue {
  size?: AvatarSize
  shape?: AvatarShape
  itemClass: string
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null)

export interface AvatarGroupProps
  extends CoreAvatarGroupProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleAvatarGroup>
}

function isAvatarElement(child: React.ReactNode): boolean {
  if (!isValidElement(child)) return false
  const type = child.type as { displayName?: string; name?: string }
  return type.displayName === 'Avatar' || type.name === 'Avatar'
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  size,
  shape,
  className,
  locale,
  labels: labelsOverride,
  children,
  ...props
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getAvatarGroupLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  const contextValue = useMemo<AvatarGroupContextValue>(
    () => ({ size, shape, itemClass: getAvatarGroupItemClasses() }),
    [size, shape]
  )

  const [expanded, setExpanded] = useState(false)
  const childArray = React.Children.toArray(children)
  let avatarSeen = 0
  const cap =
    typeof max === 'number' && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : undefined
  let overflowCount = 0
  const rendered = childArray.map((child, index) => {
    if (!isAvatarElement(child)) return <React.Fragment key={index}>{child}</React.Fragment>
    const hidden = cap != null && !expanded && avatarSeen >= cap
    if (cap != null && avatarSeen >= cap) overflowCount += 1
    avatarSeen += 1
    if (!hidden) return <React.Fragment key={index}>{child}</React.Fragment>
    return (
      <span key={index} className="sr-only">
        {child}
      </span>
    )
  })
  const overflowShape = shape ?? 'circle'

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div
        className={getAvatarGroupClasses(className)}
        role="group"
        aria-label={labels.ariaLabel}
        {...props}>
        {rendered}
        {overflowCount > 0 && !expanded && (
          <button
            type="button"
            className={getAvatarGroupOverflowClasses(size ?? 'md', overflowShape, avatarSeen > overflowCount)}
            aria-expanded={false}
            aria-label={getAvatarGroupOverflowLabel(overflowCount, labels.overflowAriaLabel)}
            onClick={() => setExpanded(true)}>
            {getAvatarGroupOverflowText(overflowCount)}
          </button>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
