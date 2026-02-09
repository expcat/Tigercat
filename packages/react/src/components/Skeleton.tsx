import React from 'react'
import {
  classNames,
  getParagraphRowWidth,
  getSkeletonClasses,
  getSkeletonDimensions,
  type SkeletonProps as CoreSkeletonProps
} from '@expcat/tigercat-core'

export type SkeletonProps = CoreSkeletonProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  shape = 'circle',
  rows = 1,
  paragraph = false,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-hidden': ariaHidden,
  ...divProps
}) => {
  const visualClasses = getSkeletonClasses(variant, animation, shape)
  const dimensions = getSkeletonDimensions(variant, width, height)
  const computedAriaHidden = ariaHidden ?? (ariaLabel || ariaLabelledBy ? undefined : true)

  // Multi-row text variant
  if (variant === 'text' && rows > 1) {
    const rowElements: React.ReactNode[] = []
    for (let i = 0; i < rows; i++) {
      const rowStyle: React.CSSProperties = {
        height: dimensions.height
      }
      if (paragraph) {
        rowStyle.width = getParagraphRowWidth(i, rows)
      } else if (dimensions.width) {
        rowStyle.width = dimensions.width
      }
      rowElements.push(
        <div
          key={i}
          className={classNames(visualClasses, i < rows - 1 && 'mb-2')}
          style={rowStyle}
        />
      )
    }

    return (
      <div
        {...divProps}
        className={classNames('flex flex-col', className)}
        style={style}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-hidden={computedAriaHidden}>
        {rowElements}
      </div>
    )
  }

  // Single skeleton element
  return (
    <div
      {...divProps}
      className={classNames(visualClasses, className)}
      style={{
        ...style,
        ...(dimensions.width ? { width: dimensions.width } : undefined),
        height: dimensions.height
      }}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-hidden={computedAriaHidden}
    />
  )
}
