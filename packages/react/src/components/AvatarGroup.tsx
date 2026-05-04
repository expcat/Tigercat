import React, { createContext, useMemo } from 'react'
import {
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getVisibleGroupItems,
  type AvatarSize,
  type AvatarGroupProps as CoreAvatarGroupProps
} from '@expcat/tigercat-core'

export interface AvatarGroupContextValue {
  size?: AvatarSize
  itemClass: string
}

export const AvatarGroupContext = createContext<AvatarGroupContextValue | null>(null)

export interface AvatarGroupProps extends CoreAvatarGroupProps {
  children?: React.ReactNode
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  size,
  className,
  children,
  ...props
}) => {
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
        aria-label="Avatar group"
        {...props}>
        {visibleItems}
        {overflowCount > 0 && (
          <span
            className={getAvatarGroupOverflowClasses(size ?? 'md')}
            aria-label={getAvatarGroupOverflowLabel(overflowCount)}>
            {getAvatarGroupOverflowText(overflowCount)}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
