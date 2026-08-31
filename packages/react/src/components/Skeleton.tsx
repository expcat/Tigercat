import React, { forwardRef } from 'react'
import {
  classNames,
  getParagraphRowWidth,
  getSkeletonClasses,
  getSkeletonInlineStyle,
  isSkeletonNamed,
  resolveSkeletonAriaHidden,
  type SkeletonProps as CoreSkeletonProps
} from '@expcat/tigercat-core'

export type SkeletonProps = CoreSkeletonProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
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
  },
  ref
) {
  const named = isSkeletonNamed(ariaLabel, ariaLabelledBy)
  const computedAriaHidden = resolveSkeletonAriaHidden(ariaHidden, named)
  const namedStatus = named && computedAriaHidden !== true
  const inlineStyle = getSkeletonInlineStyle(width, height)
  const a11y = {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-hidden': computedAriaHidden,
    role: namedStatus ? ('status' as const) : undefined,
    'aria-busy': namedStatus ? true : undefined
  }

  if (variant === 'text' && rows > 1) {
    const rowElements: React.ReactNode[] = []
    for (let i = 0; i < rows; i++) {
      const rowStyle: React.CSSProperties = {}
      if (paragraph) {
        rowStyle.width = getParagraphRowWidth(i, rows)
      }
      if (height) rowStyle.height = height
      rowElements.push(
        <div
          key={i}
          className={classNames(
            getSkeletonClasses(variant, animation, shape, {
              height,
              omitWidth: true
            }),
            !paragraph && 'w-full',
            i < rows - 1 && 'mb-2'
          )}
          style={Object.keys(rowStyle).length > 0 ? rowStyle : undefined}
        />
      )
    }

    return (
      <div
        {...divProps}
        ref={ref}
        data-tiger-skeleton=""
        className={classNames('flex flex-col', !width && 'w-full', className)}
        style={{ ...inlineStyle, ...style }}
        {...a11y}>
        {rowElements}
      </div>
    )
  }

  return (
    <div
      {...divProps}
      ref={ref}
      data-tiger-skeleton=""
      className={classNames(
        getSkeletonClasses(variant, animation, shape, { width, height }),
        className
      )}
      style={{ ...inlineStyle, ...style }}
      {...a11y}
    />
  )
})
Skeleton.displayName = 'Skeleton'
