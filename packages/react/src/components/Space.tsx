import React from 'react'
import {
  getSpaceClasses,
  getSpaceStyle,
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
  const gapStyle = getSpaceStyle(size)

  return (
    <div
      {...props}
      className={getSpaceClasses({ direction, size, align, wrap }, className)}
      style={gapStyle ? { ...gapStyle, ...style } : style}>
      {children}
    </div>
  )
}
