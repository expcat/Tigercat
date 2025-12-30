import React, { useMemo } from 'react'
import { classNames, type IconProps as CoreIconProps, type IconSize } from '@tigercat/core'

export interface IconProps extends CoreIconProps {
  /**
   * Icon content (typically SVG elements)
   */
  children?: React.ReactNode
}

interface SVGElementProps {
  className?: string
  fill?: string
  stroke?: string
  strokeWidth?: string | number
  strokeLinecap?: string
  strokeLinejoin?: string
  viewBox?: string
  xmlns?: string
}

const sizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
} as const

export const Icon: React.FC<IconProps> = ({
  size = 'md',
  color = 'currentColor',
  className,
  children,
  ...props
}) => {
  const iconClasses = useMemo(() => classNames(
    'inline-block',
    sizeClasses[size],
    className
  ), [size, className])

  // Process children to handle SVG elements
  const processedChildren = useMemo(() => React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'svg') {
      // Safely extract props with type checking
      const childProps = child.props as Record<string, unknown>
      const existingClassName = typeof childProps.className === 'string' ? childProps.className : ''
      const fill = typeof childProps.fill === 'string' ? childProps.fill : 'none'
      const strokeWidth = (typeof childProps.strokeWidth === 'string' || typeof childProps.strokeWidth === 'number') 
        ? childProps.strokeWidth 
        : '2'
      const strokeLinecap = typeof childProps.strokeLinecap === 'string' ? childProps.strokeLinecap : 'round'
      const strokeLinejoin = typeof childProps.strokeLinejoin === 'string' ? childProps.strokeLinejoin : 'round'
      const viewBox = typeof childProps.viewBox === 'string' ? childProps.viewBox : '0 0 24 24'
      const xmlns = typeof childProps.xmlns === 'string' ? childProps.xmlns : 'http://www.w3.org/2000/svg'
      
      // Clone SVG element with proper attributes
      return React.cloneElement(child as React.ReactElement<SVGElementProps>, {
        className: classNames(iconClasses, existingClassName),
        fill,
        stroke: color,
        strokeWidth,
        strokeLinecap,
        strokeLinejoin,
        viewBox,
        xmlns,
      })
    }
    return child
  }), [children, iconClasses, color])

  // If no SVG children, wrap in a span
  const hasSvg = useMemo(() => React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === 'svg'
  ), [children])

  if (!hasSvg && children) {
    const iconStyle = useMemo((): React.CSSProperties => ({ color }), [color])
    
    return (
      <span
        className={iconClasses}
        style={iconStyle}
        {...props}
      >
        {children}
      </span>
    )
  }

  return <>{processedChildren}</>
}
