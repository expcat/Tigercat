import React, { forwardRef } from 'react'
import {
  getSpaceClasses,
  getSpaceGapStyle,
  getSpaceStyle,
  type SpaceProps as CoreSpaceProps
} from '@expcat/tigercat-core'

export type SpaceProps = CoreSpaceProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> & {
    children?: React.ReactNode
    split?: React.ReactNode
    className?: string
    style?: React.CSSProperties
  }

export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    orientation = 'horizontal',
    size = 'md',
    align = 'start',
    wrap = false,
    verticalSize,
    split,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  const gapStyle =
    verticalSize != null
      ? getSpaceGapStyle(typeof size === 'number' ? size : 0, verticalSize)
      : getSpaceStyle(size)
  const nodes = React.Children.toArray(children)
  const content =
    split != null && nodes.length > 1
      ? nodes.flatMap((node, index) =>
          index === 0
            ? [node]
            : [
                <span key={`split-${index}`} data-tiger-space-split="" aria-hidden="true">
                  {split}
                </span>,
                node
              ]
        )
      : children

  return (
    <div
      {...props}
      ref={ref}
      data-tiger-space=""
      className={getSpaceClasses({ orientation, size, align, wrap }, className)}
      style={gapStyle ? { ...gapStyle, ...style } : style}>
      {content}
    </div>
  )
})
Space.displayName = 'Space'
