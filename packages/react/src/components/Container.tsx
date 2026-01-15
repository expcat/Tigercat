import React from 'react'
import { getContainerClasses, type ContainerProps as CoreContainerProps } from '@expcat/tigercat-core'

export interface ContainerProps extends CoreContainerProps, React.HTMLAttributes<HTMLElement> {
  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType
}

export const Container: React.FC<ContainerProps> = ({
  maxWidth = false,
  center = true,
  padding = true,
  children,
  className,
  as: Component = 'div',
  ...props
}) => {
  const containerClasses = getContainerClasses({
    maxWidth,
    center,
    padding,
    className
  })

  return (
    <Component {...props} className={containerClasses}>
      {children}
    </Component>
  )
}
