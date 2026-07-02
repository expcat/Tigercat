import React, { createContext, useMemo } from 'react'
import {
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupLabels,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getVisibleGroupItems,
  mergeTigerLocale,
  type AvatarSize,
  type AvatarGroupProps as CoreAvatarGroupProps,
  type TigerLocale,
  type TigerLocaleAvatarGroup
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface AvatarGroupContextValue {
  size?: AvatarSize
  itemClass: string
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null)

export interface AvatarGroupProps
  extends CoreAvatarGroupProps, React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleAvatarGroup>
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  size,
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
    () => ({ size, itemClass: getAvatarGroupItemClasses() }),
    [size]
  )

  const childArray = React.Children.toArray(children)
  const { visibleItems, overflowCount } = getVisibleGroupItems(childArray, max)

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
            className={getAvatarGroupOverflowClasses(size ?? 'md')}
            aria-label={getAvatarGroupOverflowLabel(overflowCount, labels.overflowAriaLabel)}>
            {getAvatarGroupOverflowText(overflowCount)}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
