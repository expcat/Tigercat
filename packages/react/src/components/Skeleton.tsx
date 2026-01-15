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

export const Skeleton: React.FC<SkeletonProps> = (props) => {
  const {
    variant = 'text',
    animation = 'pulse',
    width,
    height,
    shape = 'circle',
    rows = 1,
    paragraph = false,
    className,
    style,
    ['aria-label']: ariaLabelProp,
    ['aria-labelledby']: ariaLabelledByProp,
    ['aria-hidden']: ariaHiddenProp,
    ...divProps
  } = props

  const skeletonClasses = classNames(getSkeletonClasses(variant, animation, shape), className)

  const dimensions = getSkeletonDimensions(variant, width, height)

  const computedAriaHidden =
    ariaHiddenProp ?? (ariaLabelProp || ariaLabelledByProp ? undefined : true)

  // For text variant with multiple rows
  if (variant === 'text' && rows > 1) {
    const rowElements: React.ReactNode[] = []

    for (let i = 0; i < rows; i++) {
      const rowStyle: React.CSSProperties = {
        height: dimensions.height
      }

      // Apply paragraph widths if paragraph mode is enabled
      if (paragraph) {
        rowStyle.width = getParagraphRowWidth(i, rows)
      } else if (dimensions.width) {
        rowStyle.width = dimensions.width
      }

      rowElements.push(
        <div
          key={i}
          className={classNames(skeletonClasses, i < rows - 1 && 'mb-2')}
          style={rowStyle}
          aria-hidden={computedAriaHidden}
        />
      )
    }

    return (
      <div
        {...divProps}
        className={classNames('flex flex-col', className)}
        style={style}
        aria-hidden={computedAriaHidden}>
        {rowElements}
      </div>
    )
  }

  const skeletonStyle: React.CSSProperties = {
    ...style,
    ...(dimensions.width ? { width: dimensions.width } : null),
    height: dimensions.height
  }

  return (
    <div
      {...divProps}
      className={skeletonClasses}
      style={skeletonStyle}
      aria-label={ariaLabelProp}
      aria-labelledby={ariaLabelledByProp}
      aria-hidden={computedAriaHidden}
    />
  )
}
