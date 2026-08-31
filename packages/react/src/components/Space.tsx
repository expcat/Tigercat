import React, { forwardRef } from 'react'
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

export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    direction = 'horizontal',
    size = 'md',
    align = 'start',
    wrap = false,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  const gapStyle = getSpaceStyle(size)

  return (
    <div
      {...props}
      ref={ref}
      data-tiger-space=""
      className={getSpaceClasses({ direction, size, align, wrap }, className)}
      style={gapStyle ? { ...gapStyle, ...style } : style}>
      {children}
    </div>
  )
})
Space.displayName = 'Space'
