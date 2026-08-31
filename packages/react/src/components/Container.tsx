import React, { forwardRef, useMemo } from 'react'
import {
  getContainerClasses,
  getContainerMaxWidthStyle,
  type ContainerProps as CoreContainerProps
} from '@expcat/tigercat-core'

export interface ContainerProps extends CoreContainerProps, React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: keyof HTMLElementTagNameMap
}

export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  {
    maxWidth = false,
    center = true,
    padding = true,
    children,
    className,
    as = 'div',
    style,
    ...props
  },
  ref
) {
  const containerClasses = getContainerClasses({
    maxWidth,
    center,
    padding,
    className
  })
  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({ ...getContainerMaxWidthStyle(maxWidth), ...style }),
    [maxWidth, style]
  )
  const Tag = as as React.ElementType

  return (
    <Tag ref={ref} {...props} className={containerClasses} style={mergedStyle}>
      {children}
    </Tag>
  )
})

Container.displayName = 'TigerContainer'
