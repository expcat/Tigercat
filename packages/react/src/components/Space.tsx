import React from 'react'
import {
  classNames,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  getSpaceGapSize,
  type SpaceProps as CoreSpaceProps
} from '@tigercat/core'

export type SpaceProps = CoreSpaceProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> & {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }

const baseClasses = 'inline-flex'

export const Space: React.FC<SpaceProps> = ({
  direction = 'horizontal',
  size = 'md',
  align = 'start',
  wrap = false,
  children,
  className,
  style,
  ...props
}) => {
  const gapSize = getSpaceGapSize(size)
  const mergedStyle: React.CSSProperties | undefined = gapSize.style
    ? { gap: gapSize.style, ...style }
    : style

  return (
    <div
      {...props}
      className={classNames(
        baseClasses,
        getSpaceDirectionClass(direction),
        getSpaceAlignClass(align),
        gapSize.class,
        wrap && 'flex-wrap',
        className
      )}
      style={mergedStyle}>
      {children}
    </div>
  )
}
