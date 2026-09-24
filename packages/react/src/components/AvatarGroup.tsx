import React, { createContext, isValidElement, useMemo } from 'react'
import {
  avatarOverflowName,
  basicLabel,
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
import { useTigerConfig } from './tiger-config'
import { Popover } from './Popover'

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

  const childArray = React.Children.toArray(children)
  let avatarSeen = 0
  const cap =
    typeof max === 'number' && Number.isFinite(max) ? Math.max(0, Math.floor(max)) : undefined
  let overflowCount = 0
  const collapsedNames: string[] = []
  const rendered = childArray.map((child, index) => {
    if (!isAvatarElement(child)) return <React.Fragment key={index}>{child}</React.Fragment>
    const hidden = cap != null && avatarSeen >= cap
    if (hidden && isValidElement(child)) {
      overflowCount += 1
      const childProps = child.props as {
        text?: unknown
        alt?: unknown
        'aria-label'?: unknown
        ariaLabel?: unknown
      }
      const name = avatarOverflowName({
        text: childProps.text,
        alt: childProps.alt,
        ariaLabel: childProps['aria-label'] ?? childProps.ariaLabel
      })
      if (name) collapsedNames.push(name)
    }
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
        {overflowCount > 0 && (
          <Popover
            trigger="click"
            placement="top"
            asChild
            ariaLabel={basicLabel(mergedLocale?.locale, 'avatarGroup', 'overflowList')}
            content={
              <ul className="m-0 list-none p-0">
                {collapsedNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            }>
            <button
              type="button"
              className={getAvatarGroupOverflowClasses(
                size ?? 'md',
                overflowShape,
                avatarSeen > overflowCount
              )}
              aria-label={getAvatarGroupOverflowLabel(overflowCount, labels.overflowAriaLabel)}>
              {getAvatarGroupOverflowText(overflowCount)}
            </button>
          </Popover>
        )}
      </div>
    </AvatarGroupContext.Provider>
  )
}
