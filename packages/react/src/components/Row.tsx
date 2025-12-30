import React, { createContext, useMemo } from 'react'
import {
  classNames,
  getAlignClasses,
  getJustifyClasses,
  getGutterStyles,
  type RowProps as CoreRowProps,
} from '@tigercat/core'

export interface RowProps extends CoreRowProps {
  /**
   * Row content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties
}

interface RowContextType {
  gutter?: CoreRowProps['gutter']
}

export const RowContext = createContext<RowContextType>({})

export const Row: React.FC<RowProps> = ({
  gutter = 0,
  align = 'top',
  justify = 'start',
  wrap = true,
  children,
  className,
  style,
  ...props
}) => {
  const gutterStyles = useMemo(() => getGutterStyles(gutter), [gutter])

  const rowClasses = useMemo(() => classNames(
    'flex',
    wrap && 'flex-wrap',
    getAlignClasses(align),
    getJustifyClasses(justify),
    className
  ), [wrap, align, justify, className])

  const mergedStyle = useMemo((): React.CSSProperties => ({
    ...gutterStyles.rowStyle,
    ...style
  }), [gutterStyles.rowStyle, style])

  const contextValue = useMemo(() => ({ gutter }), [gutter])

  return (
    <RowContext.Provider value={contextValue}>
      <div className={rowClasses} style={mergedStyle} {...props}>
        {children}
      </div>
    </RowContext.Provider>
  )
}
