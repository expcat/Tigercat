import React, { useMemo } from 'react'
import { 
  classNames,
  getSpaceGapSize,
  getSpaceAlignClass,
  getSpaceDirectionClass,
  type SpaceProps as CoreSpaceProps
} from '@tigercat/core'

export interface SpaceProps extends CoreSpaceProps {
  /**
   * Space content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Custom style
   */
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
  const gapSize = useMemo(() => getSpaceGapSize(size), [size])
  
  const spaceClasses = useMemo(() => classNames(
    baseClasses,
    getSpaceDirectionClass(direction),
    getSpaceAlignClass(align),
    gapSize.class,
    wrap && 'flex-wrap',
    className,
  ), [direction, align, gapSize.class, wrap, className])

  const spaceStyle = useMemo((): React.CSSProperties => ({
    ...style,
    ...(gapSize.style ? { gap: gapSize.style } : {}),
  }), [style, gapSize.style])

  return (
    <div className={spaceClasses} style={spaceStyle} {...props}>
      {children}
    </div>
  )
}
