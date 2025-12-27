import React from 'react'
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
  const gapSize = getSpaceGapSize(size)
  
  const spaceClasses = classNames(
    baseClasses,
    getSpaceDirectionClass(direction),
    getSpaceAlignClass(align),
    gapSize.class,
    wrap && 'flex-wrap',
    className,
  )

  const spaceStyle: React.CSSProperties = {
    ...style,
    ...(gapSize.style ? { gap: gapSize.style } : {}),
  }

  return (
    <div className={spaceClasses} style={spaceStyle} {...props}>
      {children}
    </div>
  )
}
