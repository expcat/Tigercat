import React, { createContext, useMemo } from 'react'
import {
  classNames,
  avatarGroupBaseClasses,
  avatarGroupItemClasses,
  avatarGroupOverflowClasses,
  avatarSizeClasses,
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
    () => ({ size, itemClass: avatarGroupItemClasses }),
    [size]
  )

  const childArray = React.Children.toArray(children)
  const total = childArray.length
  const visibleCount = max != null && max < total ? max : total
  const overflow = total - visibleCount
  const visible = childArray.slice(0, visibleCount)

  const overflowSizeClass = avatarSizeClasses[size ?? 'md']

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div
        className={classNames(avatarGroupBaseClasses, className)}
        role="group"
        aria-label="Avatar group"
        {...props}>
        {visible}
        {overflow > 0 && (
          <span
            className={classNames(avatarGroupOverflowClasses, overflowSizeClass)}
            aria-label={`${overflow} more`}>
            +{overflow}
          </span>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
