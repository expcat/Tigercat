import React from 'react'
import {
  classNames,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  getSpaceGapSize,
  SPACE_BASE_CLASS,
  type SpaceProps as CoreSpaceProps
} from '@expcat/tigercat-core'

export type SpaceProps = CoreSpaceProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> & {
    children?: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }

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
        SPACE_BASE_CLASS,
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
