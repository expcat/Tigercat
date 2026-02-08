import React, { createContext, useMemo } from 'react'
import {
  classNames,
  getAlignClasses,
  getJustifyClasses,
  getGutterStyles,
  type RowProps as CoreRowProps
} from '@expcat/tigercat-core'

export type RowProps = React.HTMLAttributes<HTMLDivElement> & CoreRowProps

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
  ...divProps
}) => {
  const rowClasses = useMemo(
    () =>
      classNames(
        'flex',
        'w-full',
        wrap && 'flex-wrap',
        getAlignClasses(align),
        getJustifyClasses(justify),
        className
      ),
    [wrap, align, justify, className]
  )

  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({ ...getGutterStyles(gutter).rowStyle, ...style }),
    [gutter, style]
  )

  const contextValue = useMemo(() => ({ gutter }), [gutter])

  return (
    <RowContext.Provider value={contextValue}>
      <div className={rowClasses} style={mergedStyle} {...divProps}>
        {children}
      </div>
    </RowContext.Provider>
  )
}
