import React, { createContext, isValidElement, useMemo } from 'react'
import {
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupLabels,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getVisibleGroupItems,
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

  const childArray = React.Children.toArray(children).filter(isAvatarElement)
  const { visibleItems, overflowCount, visibleCount } = getVisibleGroupItems(childArray, max)
  const overflowShape = shape ?? 'circle'

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div
        className={getAvatarGroupClasses(className)}
        role="group"
        aria-label={labels.ariaLabel}
        {...props}>
        {visibleItems}
        {overflowCount > 0 && (
          <span
            className={getAvatarGroupOverflowClasses(size ?? 'md', overflowShape, visibleCount > 0)}
            role="img"
            aria-label={getAvatarGroupOverflowLabel(overflowCount, labels.overflowAriaLabel)}>
            {getAvatarGroupOverflowText(overflowCount)}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
