import React from 'react'
import { classNames, type ContainerProps as CoreContainerProps, type ContainerMaxWidth } from '@tigercat/core'

export interface ContainerProps extends CoreContainerProps {
  /**
   * Container content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * HTML element to render as
   * @default 'div'
   */
  as?: React.ElementType
}

const maxWidthClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'w-full',
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
  const containerClasses = classNames(
    'w-full',
    maxWidth !== false && maxWidthClasses[maxWidth],
    center && 'mx-auto',
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  )

  return (
    <Component className={containerClasses} {...props}>
      {children}
    </Component>
  )
}
